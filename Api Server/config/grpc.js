const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const PROTO_PATH = path.join(__dirname, 'cv.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
});

exports.parsedProto = grpc.loadPackageDefinition(packageDefinition);