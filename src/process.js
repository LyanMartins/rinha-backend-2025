import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';
import {request} from 'undici';


async function processPayment(data) {
    const redis = new Redis({
        host: "rinha-redis-node"
    });

    console.log(data)
    // let header = {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         correlationId: data.correlationId,
    //         amount: data.amount,
    //         requestedAt: new Date()
    //     })
    // };

    // const leader = await this.redis.get('requestLeader')
    // let requestleader = leader == 'default' ? process.env.PAYMENT_PROCESSOR_URL_DEFAULT : PAYMENT_PROCESSOR_URL_FALLBACK;
    // let request = await fetch(`${requestleader}/payments`, header);

    // redis.rpush(leader, ...[header.body]);

    parentPort.postMessage('OK');

    return;
}

const result = processPayment();
parentPort.close();

// parentPort.on("message", (data) => {
//   console.log("Worker processando:", data);

//   // simula trabalho pesado
// //   let result = data.value.toUpperCase();

//   parentPort.postMessage("ok");
// });