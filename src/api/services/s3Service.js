const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

/**
 * S3Service - A service class for handling S3 operations.
 *
 * Examples:
 *
 * ------- Uploading an Image for a Service Listing -------
 * 
 * Using the S3Service, you can easily upload an image to AWS S3 and retrieve its unique path for future reference. Here's how you can do it:
 *
 * 1. Create an instance of the S3Service.
 *      ```javascript
 *      const s3Service = require('./path-to-s3Service-file');
 *      ```
 * 
 * 2. If you have an image to be uploaded in your service listing data, initiate the upload process:
 *      ```javascript
 *      let imagePath;  // This will store the S3 path of the uploaded image
 *
 *      if (data.imageFile) {
 *          // Get the S3 uploader middleware. Pass in the desired path prefix for your object.
 *          // In this example, 'service-listings' is used as the path prefix.
 *          const uploader = s3Service.getUploader('service-listings');
 *
 *          // Use the uploader to upload the image. It will return the unique path on successful upload.
 *          const uploadResult = await new Promise((resolve, reject) => {
 *              uploader.single('image')(data.req, data.res, (err) => {
 *                  if (err) reject(err);
 *                  else resolve(data.req.file.location);  // The unique S3 path
 *              });
 *          });
 *
 *          imagePath = uploadResult;
 *      }
 *      ```
 *
 * 3. The `imagePath` now contains the unique path of the uploaded image in S3. You can store this path in your database for subsequent retrievals.
 * 
 *
 * ------- Retrieving an Image from S3 -------
 * 
 * Once you have the unique `imagePath` stored in your database, you can retrieve the image from S3 using the `retrieve` method. Here's how you can do it:
 *
 * 1. Create an instance of the S3Service (if not already done).
 *      ```javascript
 *      const s3Service = require('./path-to-s3Service-file');
 *      ```
 * 
 * 2. Use the `retrieve` method to get the image from S3:
 *      ```javascript
 *      s3Service.retrieve(imagePath, (error, imageData) => {
 *          if (error) {
 *              console.error('Error retrieving the image:', error);
 *              return;
 *          }
 *
 *          // Now, you can use the `imageData` for your purpose.
 *          // For example, send it as a response to a client request.
 *      });
 *      ```
 * 
 * Note: The retrieved `imageData` is a buffer. Depending on your use case, you might want to convert it to a stream, base64 string, or any other format.
 * 


*/
class S3Service {
    /**
     * Constructor initializes and configures the AWS SDK.
     */
    constructor() {
        // AWS configuration
        aws.config.update({
            region: process.env.AWS_BUCKET_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        });

        this.s3 = new aws.S3();
    }

    /**
     * Returns an uploader middleware configured for S3.
     * @param {string} [pathPrefix=''] - The prefix (path/folder) under which the file should be saved.
     * @returns {Function} A middleware function to handle the file upload.
     */
    getUploader(pathPrefix = '') {
        return multer({
            storage: multerS3({
                s3: this.s3,
                bucket: process.env.AWS_BUCKET_NAME,
                key: function (req, file, cb) {
                    // Create a unique file name with the provided prefix
                    const uniqueID = `${pathPrefix}/${uuidv4()}-${file.originalname}`;
                    cb(null, uniqueID);
                }
            })
        });
    }

    /**
     * Retrieves a file from S3.
     * @param {string} filePath - The complete path (including the file name) in the S3 bucket.
     * @param {Function} callback - The callback function to execute after retrieval. 
     *      It receives two arguments: error (null if no errors) and the retrieved data.
     */
    retrieve(filePath, callback) {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filePath
        };

        this.s3.getObject(params, (err, data) => {
            if (err) {
                callback(err);
                return;
            }
            // data.Body is a buffer. Depending on your use case, you might want 
            // to convert it to a stream or something else.
            callback(null, data.Body);
        });
    }
}

module.exports = new S3Service();
