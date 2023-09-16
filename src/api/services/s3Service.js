const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

exports.uploadImgFiles = async (files) => {
  try {
    const params = files.map((file) => {
      return {
        Bucket: bucketName,
        Key: `uploads/service-listing/img/${uuidv4()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: "image/jpg",
      };
    });
    const keys = [];
    params.forEach((param) => {
      keys.push(param.Key);
    });
    await Promise.all(
      params.map((param) => s3client.send(new PutObjectCommand(param)))
    );
    return keys;
  } catch (error) {
    console.error("Error uploading files from s3 bucket:", error);
    throw error;
  }
};

exports.deleteFiles = async (keys) => {
  try {
    const deleteParams = keys.map((key) => {
      return {
        Bucket: bucketName,
        Key: key,
      };
    });
    await Promise.all(
      deleteParams.map((param) => s3client.send(new DeleteObjectCommand(param)))
    );
  } catch (error) {
    console.error("Error deleting files from s3 bucket:", error);
    throw error;
  }
};

// export async function getObjectSignedUrl(keys)
exports.getObjectSignedUrl = async (keys) => {
  try {
    const signedUrls = [];
    for (const key of keys) {
      const params = {
        Bucket: bucketName,
        Key: key,
        ContentType: "image/jpg",
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3client, command);
      signedUrls.push(url);
    }
    return signedUrls;
  } catch (error) {
    console.error("Error obtained signedURLs:", error);
    throw error;
  }
};
