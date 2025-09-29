import { promises as fs } from "fs";
import path from "path";
import cloudinary from "cloudinary";
import 'dotenv/config';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudinary settings
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// r2 settings
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
// path to image directory
const RAW_DIR = path.resolve("./raw");
const PREFIX = "";

async function processImages() {
  // read files
  const files = await fs.readdir(RAW_DIR);
  const imageFiles = files.filter((f) => /\.(jpe?g|png|tiff|bmp)$/i.test(f));

  for (const file of imageFiles) {
    const localPath = path.join(RAW_DIR, file);
    try {
      // Upload and Process via Cloudinary 
      const uploadResult = await cloudinary.v2.uploader.upload(localPath, {
        folder: "temp",         // Cloudinary tempolary folder
        format: "webp",         // to WebP 
        quality: "auto:best",   // quarity remains best
        overwrite: true,
      });

      console.log("Cloudinary: Success")
      const response = await fetch(uploadResult.secure_url);

      // Upload to R2 Bucket with Prefix
      const imageBuffer = await response.arrayBuffer();
      const r2Key = `${PREFIX && PREFIX+"/"}${path.basename(file, path.extname(file))}.webp`;
      
      await r2.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET,
          Key: r2Key,
          Body: Buffer.from(imageBuffer),
          ContentType: "image/webp",
        })
      );
      console.log("R2: Success")
      console.log(`${r2Key}`);

    } catch (err) {
      console.error(`Error processing ${file}:`, err);
      break;
    }
  }
}
processImages().then(() => console.log("All done!"));
