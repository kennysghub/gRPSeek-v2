import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/helloworld';
import { GreeterHandlers } from '../proto/greeterPackage/Greeter';
import { grpcRequestDuration, grpcRequestsTotal, grpcResponseLatency } from '../metrics/metrics';

const PORT = 8082;
const PROTO_FILE = '../proto/helloworld.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO_FILE))
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType
const greeterPackage = grpcObj.greeterPackage;

function main(){
  const server = getServer();

  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port)=> {
    if(err){
      console.log("Error: ", err);
      return;
    }
    console.log(`Your server has started on port ${port}`);
    server.start();
  })
}

function getServer(){
  const server = new grpc.Server();

  server.addService(greeterPackage.Greeter.service, {
    SayHello: (req, res) => {
      grpcRequestsTotal.inc();
      // Start timer 
      console.log(grpcRequestsTotal)
      const timer = grpcRequestDuration.startTimer();
      timer();
      console.log(timer())
      res(null, {message: "Hello from server"})
    }
  } as GreeterHandlers);

  return server;
}
main();