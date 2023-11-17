const s3ServiceInstance = require("../api/services/s3Service");

// Replace all base64 encoded images with S3 url links inside a HTML string
async function replaceBase64WithS3URL(htmlContent) {
  const regex = /src="data:image\/[^;]+;base64,([^"]+)"/g;
  let content = htmlContent;
  const matches = content.match(regex);
  if (matches) {
    for (const base64Data of matches) {
      const base64Match = base64Data.match(/src="data:image\/[^;]+;base64,([^"]+)"/);
      if (base64Match && base64Match[1]) {
        const base64Image = base64Match[1];
        const buffer = Buffer.from(base64Image, "base64");
        const key = await s3ServiceInstance.uploadImgFilesAllTypes(
          [{ buffer: buffer, originalname: "article-img" }],
          "article"
        );
        const url = await s3ServiceInstance.getObjectSignedUrl(key);
        content = content.replace(base64Data, `src="${url}"`);
      }
    }
  }
  return content;
}

module.exports = {
  replaceBase64WithS3URL,
};
