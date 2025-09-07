import Redis from 'ioredis';
import { request, fetch, Agent, setGlobalDispatcher } from 'undici';
import { Worker } from 'worker_threads';

class Payment {

    redis = new Redis({host: "rinha-redis-node"});
    
    constructor() {
    }

    payment = function(data){
        
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
            let paymentProcessedCalculated = {
                'default': await this.calculatePaymentProcessed('default'),
                'fallback': await this.calculatePaymentProcessed('fallback')
            }
            return JSON.stringify(paymentProcessedCalculated);
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

    purgePayment = function(){
        this.redis.flushdb()
    }

    calculatePaymentProcessed = async function(paymentGateway) {
        let test = await this.redis.lrange(paymentGateway, 0, -1)
        const parsed = test.map(item => JSON.parse(item));
        let totalAmount = 0;
        totalAmount = parsed.reduce((acc, value, index) => acc + value.amount, 0);

        return {
            "totalRequests": parsed.length,
            "totalAmount": totalAmount
        }
    }

}
export default Payment