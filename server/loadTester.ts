import * as grpc from '@grpc/grpc-js';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
// TimeScale DB Setup 
import {sequelize} from '../api-server/expressServer'
import {QueryTypes} from 'sequelize'
/** Interceptor for client node server
 * For every request it calculates the length it took and status code
 * WiP: Using requestors to check status code of request
 */
function clientInterceptor(): grpc.Interceptor {
  return (options, nextCall) => {
    //define requestor

    //before the request to the server
    let startTime = performance.now();

    //executing nextCall returns an InterceptingCallInterface which is a parent class of InterceptingCall hence conversion needed
    const call = new grpc.InterceptingCall(nextCall(options));

    //after the request is finished
    let endTime = performance.now();

    //duration in ms
    let timeDuration = endTime - startTime;
    // console.log("Time Duration: ", timeDuration);
    console.log(path.join(__dirname,'../metrics/time.txt'))
    fs.writeFileSync(path.join(__dirname, '../metrics/time.txt'), `Time Duration: ${timeDuration}\n`, { flag: "a+" });
    // Insert metrics into Timescale DB
    // sequelize.query(`
    //     INSERT INTO metrics(time, latency) VALUES($1, $2)
    //   `, {
    //     bind: [new Date(), timeDuration],
    //     type: QueryTypes.INSERT  // Use imported QueryTypes
    //   }).then(() => {
    //     console.log('Metric inserted into TimescaleDB');
    //   }).catch(err => {
    //     console.log('Error inserting metric:', err);
    //   });

    // console.log('this is the call: ', call);
    return call;
  }
}


export default clientInterceptor