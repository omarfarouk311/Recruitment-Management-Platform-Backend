const { Client } = require('minio');
const { minio_user, minio_password } = require('./config');

const minioClient = new Client({
    endPoint: 'object-store',
    port: 9000,
    useSSL: false,
    accessKey: minio_user,
    secretKey: minio_password
});

async function checkBucketExistence() {
    const bucket1 = 'profile-photo-bucket'
    const bucket2 = 'cv-bucket'
    const exists = await Promise.all([minioClient.bucketExists(bucket1), minioClient.bucketExists(bucket2)]);
    if (!exists[0]) {
        await minioClient.makeBucket(bucket1);
        console.log('profile-photo-bucket created successfully');
    }
    else console.log('profile-photo-bucket already exists');
    if (!exists[1]) {
        await minioClient.makeBucket(bucket2);
        console.log('cv-bucket created successfully');
    }
    else console.log('cv-bucket already exists');
}

exports.minioConnect = checkBucketExistence;
exports.client = minioClient;
