const { Client } = require('minio');
const { minio_user, minio_password, imagesBucketName, cvsBucketName } = require('./config');

const minioClient = new Client({
    endPoint: 'object-store',
    port: 9000,
    useSSL: false,
    accessKey: minio_user,
    secretKey: minio_password
});

async function checkBucketExistence() {
    try {
        const exists = await Promise.all([minioClient.bucketExists(imagesBucketName), minioClient.bucketExists(cvsBucketName)]);
        if (!exists[0]) {
            await minioClient.makeBucket(imagesBucketName);
            console.log(`${imagesBucketName} created successfully`);
        }
        else console.log(`${imagesBucketName} already exists`);
        if (!exists[1]) {
            await minioClient.makeBucket(cvsBucketName);
            console.log(`${cvsBucketName} created successfully`);
        }
        else console.log(`${cvsBucketName} already exists`);
    } catch (error) {
        console.log(error);
    }
}

exports.minioConnect = checkBucketExistence;
exports.client = minioClient;

