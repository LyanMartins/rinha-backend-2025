import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';
import {request} from 'undici';


async function healthCheck() {
  const redis = new Redis({
    host: "rinha-redis-node"
  });
  const [defaultProcessor, fallbackProcessor] = await Promise.all([
    request(`${process.env.PAYMENT_PROCESSOR_URL_DEFAULT}/payments/service-health`),
    request(`${process.env.PAYMENT_PROCESSOR_URL_FALLBACK}/payments/service-health`)
  ]);

  const defaultRes = await defaultProcessor.body.json();
  const fallbackRes = await fallbackProcessor.body.json();
  console.log("Default:", defaultRes);
  console.log("Fallback:", fallbackRes);

  if(!defaultRes.failing && defaultRes.minResponseTime<100){
    redis.set('requestLeader', "default");
  }else{
    redis.set('requestLeader', "fallback");
  }
  
  console.log(await redis.get('requestLeader'))

  console.log("finish")
  return;
}

const result = healthCheck();
parentPort.close();