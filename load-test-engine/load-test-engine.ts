import MetricInterceptor from '../server/loadTester';
const hash = require('crypto');

interface Message {
  [key: string]: string | number | boolean;
}
// Added optional `options` parameter which will be used for passing the interceptor options
type StubFunction = (message: Message & { [key: string]: any }, options?:any) => any;

type stub = {
  stub: StubFunction
  message: Message,
  interval: number,
  interceptor: MetricInterceptor
  timeout: NodeJS.Timeout | undefined,
}

// Generates a label if one is not provided by user
function hashCall(stub:StubFunction, message:Message, interval:number) {
  return hash.createHash('sha256')
    .update(stub.toString() + JSON.stringify(message) + interval.toString())
    .digest('hex');
}

// Recursive setTimeout for repeating calls
function repeatCall(call: stub) {
  console.log("call: ", call)
  call.stub(call.message, {interceptors: [call.interceptor.interceptor] });
  call.timeout = setTimeout(() => {repeatCall(call)}, call.interval);
}



class LoadTestEngine {
  /**
   * Record is a utility type that constructs an object type whose property keys are `K` and corresponding values are `T`. The syntax is  `Record<Keys, Type>`. In this case, Record<string, stub> means an object where each property key is a `string` and value is of type `stub`. These are objects wehre each key is a string(label for a call) and each value is a stub object containing the details for that call. 
   */
  private calls: Record<string, stub>
  private active: Record<string, stub>
  
  constructor() {
    this.calls = {};
    this.active = {};
  }

  addCall(stub: StubFunction, message: Message, interval: number, label: string = hashCall(stub, message, interval), interceptor:MetricInterceptor, timeout?: NodeJS.Timeout): LoadTestEngine {
    if (this.calls[label]) {
      throw new Error('Label already exists.');
    };
    this.calls[label] = {
      stub,
      message,
      interval,
      interceptor,
      timeout
    }
    console.log(`Call ${label} added.`);
    return this;
  }

  removeCall(label:string): LoadTestEngine {
    if (this.calls[label]) {
      delete this.calls[label];
      console.log(`Call ${label} removed`);
      return this;
    } else {
      throw new Error('Label does not exist.')
    }
  }

  getLabels(): Array<string> {
    return Object.keys(this.calls);
  }

  start(labels: Array<string>): void {
    labels.forEach((label) => {
      // Check that call is not already active
      if (!this.active[label]) {
        // The associated this.calls object for the current label
        const call = this.calls[label];
        // Set a recursive timeout
        console.log(`Call ${label} started.`);
        repeatCall(call);
        // Add to active calls tracker
        this.active[label] = call;
      }
    })
  }

  startAll(): void {
    console.log(`Starting all calls.`);
    for (const label in this.calls) {
      if (!this.active[label]) {
        const call = this.calls[label];
        console.log(`Call ${label} started.`);
        repeatCall(call);
        this.active[label] = call;
      }
    }
  }

  stop(labels: Array<string>): void {
    labels.forEach((label) => {
      clearTimeout(this.active[label].timeout);
      delete this.active[label];
      console.log(`Call ${label} stopped.`);
    })
  }

  stopAll(): void {
    if (!Object.keys(this.active).length) {
      throw new Error('No active calls.')
    }
  
    for (const label in this.active) {
      clearTimeout(this.active[label].timeout);
      delete this.active[label];
      console.log(`Call ${label} stopped.`);
    }
    console.log('All active calls stopped.');
  }

}

// module.exports = new LoadTestEngine();
// export const loadTestEngineInstance = new LoadTestEngine();
const engine = new LoadTestEngine();
export default engine;
