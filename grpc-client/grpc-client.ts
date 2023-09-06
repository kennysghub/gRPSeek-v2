import * as path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from '../proto/helloworld';
import MetricInterceptor from '../server/loadTester';
import engine from '../load-test-engine/load-test-engine';
const PORT = 8082;
const PROTO = '../proto/helloworld.proto';

const packageDef = protoLoader.loadSync(path.resolve(__dirname, PROTO));
const grpcObj = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType;
const greeterPackage = grpcObj.greeterPackage;


let clientInterceptor = new MetricInterceptor();

// function main() {
//   client.SayHello({ name: "Kenny" }, { interceptors: [clientInterceptor.interceptor] },  (err, res) => {
//     if (err) {
//       console.log('error', err)
//     }else{
      
//        console.log("result:", res)
//     }
//   })
// }

const client = new grpcObj.greeterPackage.Greeter(
  `0.0.0.0:${PORT}`, grpc.credentials.createInsecure(),
);
const makeCall = () => {
  client.SayHello({ name: "Kenny" }, { interceptors: [clientInterceptor.interceptor] },  (err, res) => {
    if (err) {
      console.log('error', err);
    } else {
      console.log("result:", res);
    }
  });
}

engine.addCall(client.SayHello,{name:"Meow"},1000, "TheCall", clientInterceptor);
engine.start(["TheCall"])









// let counter = 0;
// let copy = function () {
//   counter++;
//   if (counter < 100) {
//     setTimeout(() => { copy() }, 1);
//   }
//   main();
// }

// copy();

// setTimeout(() => {
//   console.log('Finished calls: ', clientInterceptor.numCalls);
//   console.log('Number of failed requests: ', clientInterceptor.numErrors);
// }, 1000);