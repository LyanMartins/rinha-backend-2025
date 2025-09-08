import Redis from 'ioredis';
import { request, fetch, Agent, setGlobalDispatcher } from 'undici';
import { Worker } from 'worker_threads';

class Payment {

    redis = new Redis({path: "/var/run/redis/redis.sock"});
    
    constructor() {
    }

    payment = async function(data){
        
        await this.redis.rpush("queue", JSON.stringify({
                correlationId: data.correlationId,
                amount: data.amount,
                requestedAt: new Date().toISOString()
            }));
        // this.redis.rpush("queue",
        //     JSON.stringify({
        //         correlationId: data.correlationId,
        //         amount: data.amount,
        //         requestedAt: new Date().toISOString()
        //     })
        // ).catch(console.error);

        return 'OK';
    }
    
    paymentSummary = async function() {
       try {
            
            // const fall = await this.redis.lrange('fallback', 0, -1);
            const [def, fall] = await Promise.all([this.calculatePaymentProcessed('default'), this.calculatePaymentProcessed('fallback')]);
            // console.log(result);
            let paymentProcessedCalculated = {
                'default': def,
                'fallback': fall
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
        const [totalRequests, totalAmount] = await this.redis.mget(
            `${paymentGateway}:totalRequests`,
            `${paymentGateway}:totalAmount`
        );

        return {
            "totalRequests": totalRequests??0,
            "totalAmount": totalAmount??0
        }
    }

}
export default Payment