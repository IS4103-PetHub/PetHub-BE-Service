const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

class S3Service {
  constructor() {
    this.bucketName = process.env.AWS_BUCKET_NAME;
    this.region = process.env.AWS_BUCKET_REGION;
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    this.s3Service = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  async uploadImgFiles(files) {
    try {
      const params = files.map((file) => {
        return {
          Bucket: this.bucketName,
          Key: `uploads/service-listing/img/${uuidv4()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: "image/jpg",
        };
      });
      const keys = params.map((param) => param.Key);
      await Promise.all(
        params.map((param) => this.s3Service.send(new PutObjectCommand(param)))
      );
      return keys;
    } catch (error) {
      console.error("Error uploading files from s3 bucket:", error);
      throw error;
    }
  }

  async deleteFiles(keys) {
    try {
      const deleteParams = keys.map((key) => {
        return {
          Bucket: this.bucketName,
          Key: key,
        };
      });
      await Promise.all(
        deleteParams.map((param) =>
          this.s3Service.send(new DeleteObjectCommand(param))
        )
      );
    } catch (error) {
      console.error("Error deleting files from s3 bucket:", error);
      throw error;
    }
  }

  // export async function getObjectSignedUrl(keys)
  async getObjectSignedUrl(keys) {
    try {
      const signedUrls = [];
      for (const key of keys) {
        const params = {
          Bucket: this.bucketName,
          Key: key,
          ContentType: "image/jpg",
        };

        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(this.s3Service, command);
        signedUrls.push(url);
      }
      return signedUrls;
    } catch (error) {
      console.error("Error obtained signedURLs:", error);
      throw error;
    }
  }
}

module.exports = S3Service;
