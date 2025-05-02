import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
const BUCKET = "poc-image-estrela-bet";
const client = new S3Client({ region: "us-east-1" });

async function run() {
  const files = fs.readdirSync("sample-images");
  for (const file of files) {
    const body = fs.readFileSync(`sample-images/${file}`);
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: file,
        Body: body,
        ContentType: "image/" + file.split(".").pop(),
      })
    );
    console.log(`↑ ${file}`);
  }
}
run();
