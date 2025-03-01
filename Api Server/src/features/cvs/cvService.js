const { parsedProto } = require('../../../config/grpc');
const { Transform } = require('stream');
const grpc = require('@grpc/grpc-js');
const CVService = parsedProto.CVService;
const client = new CVService('parser-server:50051', grpc.credentials.createInsecure());

exports.parseCV = (req) => {
    return new Promise((resolve, reject) => {
        const transformCV = new Transform({
            writableObjectMode: false,
            readableObjectMode: true,
            autoDestroy: true,
            transform(chunk, encoding, callback) {
                callback(null, { cv: chunk });
            }
        });

        const grpcCall = client.UploadCV((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.response);
            }
        });

        // Pipe the incoming request stream through the transform stream and then into the gRPC call stream
        req.pipe(transformCV)
            .pipe(grpcCall)
            .on('error', (err) => {
                grpcCall.cancel();
                reject(err);
            });
    });
};
