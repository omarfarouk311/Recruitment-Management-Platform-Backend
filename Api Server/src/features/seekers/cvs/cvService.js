const CV = require('./cvModel');
const { client } = require('../../../../config/MinIO');
const { fileSizeLimit, cvsBucketName } = require('../../../../config/config');
const { getPhotoService } = require('../../../common/util');


exports.uploadCV = async ({ seekerId, mimeType, fileName, fileSize, dataStream }) => {
    let id;
    console.log(fileName);
    if (mimeType !== 'application/pdf') {
        dataStream.resume();
        const err = new Error('Invalide file type while uploading the CV')
        err.msg = 'CV type must be pdf';
        err.status = 400;
        throw err;
    }

    if (fileSize > fileSizeLimit) {
        dataStream.resume();
        const err = new Error(`CV size exceeded the limit of ${fileSizeLimit / 1048576}mb`)
        err.msg = err.message;
        err.status = 413;
        throw err;
    }

    // wrap the error event listener in a promise
    const streamErrorPromise = new Promise((resolve, reject) => {
        dataStream.on('error', async (err) => {
            try {
                if (id) {
                    await client.removeObject(cvsBucketName, id, { forceDelete: true });
                    err.msg = 'Error while uploading the CV';
                    err.status = 500;
                    reject(err);
                }
            }
            catch (err) {
                err.msg = 'Error while uploading the CV';
                err.status = 500;
                reject(err);
            }
        });
    });

    /* upload to minio first then insert to the db, because having a hanging CV without a record in the db
    (in case of falling to remove it from minio if insertion failed) is tolerable, which isn't the case for having 
    a hanging record in the db without the CV existing in the object store*/

    id = await CV.getIdFromSequence();

    // upload the CV to the object store, and ensure the operation is marked as failed if an error happend during streaming
    await Promise.race([
        streamErrorPromise,
        client.putObject(cvsBucketName, id.toString(), dataStream, fileSize, {
            'content-type': mimeType,
            filename: fileName
        })
    ]);

    // insert the CV data in the DB, and try to delete it from the object store if insertion failed
    try {
        const cv = new CV(id, fileName, seekerId, new Date());
        await cv.create();
    }
    catch (err) {
        await client.removeObject(cvsBucketName, id, { forceDelete: true });
        throw err;
    }
}; 

module.exports.getCvName = async (jobId, seekerId, userId, userRole) => {
    const cvs = await CV.getCvName(jobId, seekerId, userId, userRole);
    return cvs;
}

exports.downloadCV = async (cvId, userId, userRole, seekerId, jobId) => {
    try {
        await CV.downloadCV(cvId, userId, userRole, seekerId, jobId);
        return await getPhotoService(cvsBucketName, cvId);
    } catch (err) {
        throw err;
    }
}

exports.deleteCV = async (cvId, userId) => {
    try {
        const msg = await CV.deleteCV(cvId, userId);
        return msg;
    } catch (err) {
        throw err;
    }
}


exports.getCvsForJob = async (jobId, seekerId) => {
    try {
        const cvs = await CV.getCvsForJob(jobId, seekerId);
        return cvs;
    } catch (err) {
        throw err;
    }
}