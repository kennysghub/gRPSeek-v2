import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/helloworld';
import clientInterceptor from '../server/loadTester';
import engine from '../load-test-engine/load-test-engine';

const PORT = 8082;
const PROTO = '../proto/helloworld.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO));
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const greeterPackage = grpcObj.greeterPackage;

const client = new greeterPackage.Greeter(
  `0.0.0.0:${PORT}`, grpc.credentials.createInsecure(),
);

function callback(err:any, res:any) {
  if (err) {
    console.log('error', err);
    return;
  }
  console.log("result:", res);
}

const interceptor = clientInterceptor();
const options = { interceptors: [interceptor] };



function sayHelloStub(message: { name: string }) {

  client.SayHello(message, options, callback);
}

engine.addCall(sayHelloStub, {name: "Kenny"}, 1000);

engine.startAll()
// function main() {
//   client.SayHello({ name: "Kenny" }, options, callback);
// }

// while (true) {
//   main();
// }