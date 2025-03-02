const { fileSizeLimit } = require('../../../config/config');
const { Transform } = require('stream');
const { parsedProto } = require('../../../config/grpc');
const grpc = require('@grpc/grpc-js');
const { CVService } = parsedProto;
const client = new CVService('parser-server:50051', grpc.credentials.createInsecure());

exports.parseCV = (cvData) => {
    return new Promise((resolve, reject) => {
        const { mimeType, fileSize, dataStream } = cvData;

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
            err.status = 400;
            throw err;
        }

        // Used to transform the streamed cv data into the grpc Call request structure
        const transformCV = new Transform({
            writableObjectMode: false,
            readableObjectMode: true,
            autoDestroy: true,
            transform(chunk, encoding, callback) {
                callback(null, { cv: chunk });
            }
        });

        // invoke the upload method in the parser service
        const grpcCall = client.UploadCV((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.response);
            }
        });

        // Pipe the incoming data stream through the transform stream and then into the gRPC call stream
        dataStream
            .pipe(transformCV)
            .pipe(grpcCall)
            .on('error', (err) => {
                grpcCall.cancel();
                err.msg = err.message;
                err.status = 500;
                reject(err);
            });
    });
};