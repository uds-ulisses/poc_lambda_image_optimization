import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({ region: "us-east-1" });
const ORIG_BUCKET = "poc-image-estrela-bet";
const CACHE_BUCKET = "poc-image-estrela-bet-cache"; // criamos um segundo bucket para guardar imagens processadas

// helper para stream -> buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const _buf = [];
    stream.on("data", (chunk) => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", reject);
  });

export const handler = async (event) => {
  const request = event.Records[0].cf.request;
  const [, params, ...rest] = request.uri.split("/");
  const [wParam, hParam] = params.split(",");
  const width = parseInt(wParam.replace("w_", ""));
  const height = parseInt(hParam.replace("h_", ""));
  const key = rest.join("/");
  const cacheKey = `${params}/${key}`;

  // 1) Tenta buscar do cache
  try {
    const cacheObj = await s3.send(
      new GetObjectCommand({
        Bucket: CACHE_BUCKET,
        Key: cacheKey,
      })
    );
    const buf = await streamToBuffer(cacheObj.Body);
    return {
      status: "200",
      statusDescription: "OK",
      headers: {
        "cache-control": [
          {
            key: "Cache-Control",
            value: "max-age=31536000",
          },
        ],
        "content-type": [
          {
            key: "Content-Type",
            value: cacheObj.ContentType,
          },
        ],
        "content-length": [
          {
            key: "Content-Length",
            value: buf.length.toString(),
          },
        ],
      },
      body: buf.toString("base64"),
      bodyEncoding: "base64",
    };
  } catch (e) {
    // cache miss → segue
  }

  // 2) Busca imagem original
  const orig = await s3.send(
    new GetObjectCommand({
      Bucket: ORIG_BUCKET,
      Key: key,
    })
  );
  const origBuffer = await streamToBuffer(orig.Body);

  // 3) Redimensiona e converte para WebP
  const outputBuffer = await sharp(origBuffer)
    .resize(width, height)
    .toFormat("webp")
    .toBuffer();

  // 4) Armazena no bucket de cache (pode falhar, mas seguimos)
  s3.send(
    new PutObjectCommand({
      Bucket: CACHE_BUCKET,
      Key: cacheKey,
      Body: outputBuffer,
      ContentType: "image/webp",
      ACL: "public-read",
    })
  ).catch((err) => console.warn("erro cache put:", err.message));

  // 5) Retorna resposta
  return {
    status: "200",
    statusDescription: "OK",
    headers: {
      "cache-control": [
        {
          key: "Cache-Control",
          value: "max-age=31536000",
        },
      ],
      "content-type": [
        {
          key: "Content-Type",
          value: "image/webp",
        },
      ],
      "content-length": [
        {
          key: "Content-Length",
          value: outputBuffer.length.toString(),
        },
      ],
    },
    body: outputBuffer.toString("base64"),
    bodyEncoding: "base64",
  };
};
