import Redis from 'ioredis';
import { request, fetch, Agent, setGlobalDispatcher } from 'undici';
import { Worker } from 'worker_threads';

class Payment {

    redis = new Redis({host: "rinha-redis-node"});
    
    constructor() {
        //console.log("entrou na controler")
        
    }

    payment = function(data){
    //    this.redis.flushdb()
        this.redis.rpush("queue",
            JSON.stringify({
                correlationId: data.correlationId,
                amount: data.amount,
                requestedAt: new Date().toISOString()
            })
        ).catch(console.error);

        return 'OK';
    }
    
    paymentSummary = async function() {
       try {
            let test = await this.redis.lrange('default', 0, -1)
            const parsed = test.map(item => JSON.parse(item));
            console.log(JSON.stringify(parsed))
            return parsed;
        } catch (err) {
            console.error("Erro capturado:", err);
        }
    }

    healthcheck = async function() {
        
        const worker = new Worker('./src/healthcheck.js');
        
        await new Promise((resolve) => setTimeout(resolve, 5000))
            
        worker.terminate();
        
        return this.healthcheck();
    }

    // processQueue = async function() {
    //     while (true) {
    //         console.log("start")
    //         const worker = new Worker('./src/process.js');

    //         const value = [];
            
    //         worker.postMessage(value);
    //         await new Promise((resolve) => setTimeout(resolve, 3000))

    //         worker.on("message", (result) => {
    //             console.log("Resultado:", result);
    //             worker.terminate();
    //         });
            
    //         worker.on("error", (err) => {
    //             console.error("Erro no worker:", err);
    //             worker.terminate();
    //         });
    //         worker.terminate();
    //     }
    // }
}
export default Payment