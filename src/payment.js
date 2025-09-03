import Redis from 'ioredis';
import { request, fetch, Agent, setGlobalDispatcher } from 'undici';
import { Worker } from 'worker_threads';

class Payment {

    redis='';
    
    constructor() {
        //console.log("entrou na controler")
        this.redis = new Redis({
            host: "rinha-redis-node",
        });
    }

    healthcheck = async function() 
    {
       const result = await this.redis.flushdb();
    }

    payment = async function(data){
        let validated = await this.validate(data);
        if (!validated) {
            throw new Error('invalid payload')
        }
        
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

        const leader = await this.redis.get('requestLeader')
        let requestleader = leader == 'default' ? process.env.PAYMENT_PROCESSOR_URL_DEFAULT : PAYMENT_PROCESSOR_URL_FALLBACK;
        let request = await fetch(`${requestleader}/payments`, header);

        this.redis.rpush(leader, ...[header.body]);

        return request;
    }

    validate = async function(data){
        if(!data.correlationId) return false;

        if(!data.amount) return false;

        return true;
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

    worker = function() {
        const worker = new Worker('./src/worker.js', {
            workerData: 5,
        });
    }
}
export default Payment