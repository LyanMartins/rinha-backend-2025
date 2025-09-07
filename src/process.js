import { parentPort, workerData } from 'worker_threads';
import Redis from 'ioredis';
import {request, fetch} from 'undici';

const redis = new Redis({ host: "rinha-redis-node" });

async function processPayment(data) {
    
    data = JSON.parse(data.job);
    let header = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            correlationId: data.correlationId,
            amount: data.amount,
            requestedAt: new Date()
        })
    };

    const leader = await redis.get('requestLeader')
    let requestleader = leader == 'default' ? process.env.PAYMENT_PROCESSOR_URL_DEFAULT : process.env.PAYMENT_PROCESSOR_URL_FALLBACK;
    let request = await fetch(`${requestleader}/payments`, header);

    redis.rpush(leader, ...[JSON.stringify(data)]);

    
    parentPort.postMessage('OK');
    // parentPort.close();

    return;
}

// const result = processPayment();
// 

parentPort.on("message", (data) => {
    processPayment(data)
});