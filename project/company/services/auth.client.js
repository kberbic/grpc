import GRPCClient from './clients/grpc.js';

const client = new Client([{
    address: process.env.AUTH_SERVICE,
    proto: "auth.proto"
}]);

export default {
    client.AuthService
};