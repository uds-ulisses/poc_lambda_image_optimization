var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { S3Client, CreateBucketCommand, PutBucketCorsCommand, } from "@aws-sdk/client-s3";
const BUCKET = "poc-image-estrela-bet";
const client = new S3Client({ region: "us-east-1" }); // Região da AWS
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield client.send(new CreateBucketCommand({ Bucket: BUCKET }));
            console.log(`Bucket ${BUCKET} criado`);
            // Habilita CORS para acesso público:
            yield client.send(new PutBucketCorsCommand({
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
            }));
            console.log(`CORS configurado`);
        }
        catch (err) {
            console.error(err);
        }
    });
}
init();
