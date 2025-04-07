import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const makeSlug = (title: string) => {
  return title
    .toLowerCase()                   // Convert to lowercase
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w\-]+/g, '')        // Remove all non-word chars except -
    .replace(/\-\-+/g, '-')          // Replace multiple - with single -
    .replace(/^-+/, '')              // Trim - from start
    .replace(/-+$/, '');             // Trim - from end
};


const s3Client = new S3Client({
  region: import.meta.env.VITE_S3_REGION, // e.g., "us-east-1"
  credentials: {
    accessKeyId: import.meta.env.VITE_ACCESS_KEY, // better to use environment variables
    secretAccessKey: import.meta.env.VITE_SECRET_KEY,
  },
});

export const getJsonFileFromS3 = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: import.meta.env.VITE_BUCKET_NAME,
      Key: import.meta.env.VITE_FILE_KEY,
    });

    const response = await s3Client.send(command);
    const jsonData = await response.Body.transformToString();
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading JSON from S3:", error);
    throw error;
  }
};

export const uploadToS3 = async (data: any[]): Promise<string> => {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const body = new TextEncoder().encode(jsonData);

    const params = {
      Bucket: import.meta.env.VITE_BUCKET_NAME,
      Key: import.meta.env.VITE_FILE_KEY,
      Body: body,
      ContentType: "application/json",
    };

    await s3Client.send(new PutObjectCommand(params));
    return "success";
  } catch (error) {
    console.error("Upload failed:", error);
    return "error";
  }
};


export const uploadImages = async (images: File[]) => {
  try {
    for (const image of images) {
      const imageKey = `images/${image.name}`;
      
      const arrayBuffer = await image.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const params = {
        Bucket: import.meta.env.VITE_BUCKET_NAME,
        Key: imageKey,
        Body: uint8Array,
        ContentType: image.type,
      };

      await s3Client.send(new PutObjectCommand(params));
    }
    return "success"
  } catch (error) {
    console.error("Upload failed:", error);
    return "error"
  }
};
