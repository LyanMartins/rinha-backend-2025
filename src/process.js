import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';
import {request, fetch} from 'undici';

const redis = new Redis({path: "/var/run/redis/redis.sock"});

async function processPayment(data) {
    
    // data = JSON.parse(data.job);
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

    // const leader = await redis.get('requestLeader')
    // let requestleader = leader == 'default' ? process.env.PAYMENT_PROCESSOR_URL_DEFAULT : process.env.PAYMENT_PROCESSOR_URL_FALLBACK;
    // await fetch(`${requestleader}/payments`, header);

    // redis
    //     .multi()
    //     .rpush(`${leader}:items`, JSON.stringify(data))
    //     .incr(`${leader}:totalRequests`)
    //     .incrbyfloat(`${leader}:totalAmount`, data.amount)
    //     .exec();

    // parentPort.postMessage('OK');
    // parentPort.close();

    data = JSON.parse(data.job);
    const leader = await redis.get('requestLeader');

    await redis
        .multi()
        .rpush(`${leader}:items`, JSON.stringify(data))
        .incr(`${leader}:totalRequests`)
        .incrbyfloat(`${leader}:totalAmount`, data.amount)
        .exec();
    
    // Faz fetch assíncrono sem await
    fetch(`${leader === 'default' ? process.env.PAYMENT_PROCESSOR_URL_DEFAULT : process.env.PAYMENT_PROCESSOR_URL_FALLBACK}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            correlationId: data.correlationId,
            amount: data.amount,
            requestedAt: new Date()
        })
    }).catch(console.error);

    parentPort.postMessage('OK');

    
    return;
}


// const result = processPayment();
// 

parentPort.on("message", (data) => {
    processPayment(data)
});