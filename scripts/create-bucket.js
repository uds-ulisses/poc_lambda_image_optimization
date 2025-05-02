import {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
} from "@aws-sdk/client-s3";
const BUCKET = "poc-image-estrela-bet";
const client = new S3Client({ region: "us-east-1" }); // Região da AWS

async function init() {
  try {
    await client.send(new CreateBucketCommand({ Bucket: BUCKET }));
    console.log(`Bucket ${BUCKET} criado`);
    // Habilita CORS para acesso público:
    await client.send(
      new PutBucketCorsCommand({
        Bucket: BUCKET,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ["*"],
              AllowedMethods: ["GET"],
              AllowedHeaders: ["*"],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    );
    console.log(`CORS configurado`);
  } catch (err) {
    console.error(err);
  }
}

init();
