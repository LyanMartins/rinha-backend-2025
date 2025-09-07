import { Worker } from 'worker_threads';
import { Redis } from 'ioredis';

class WorkerPool {
    constructor(workerPath, size = 2) {
        this.workerPath = workerPath;
        this.redis = new Redis({
            host: "rinha-redis-node",
        });

        for (let i = 0; i < size; i++) {
            this.addNewWorker(i);
        }
    }

    addNewWorker(id) {
        const worker = new Worker(this.workerPath);
        worker.on("message", (msg) => {
            // console.log(`✅ Worker ${msg.workerId} terminou:`, msg.result);
            this.getJob(id, worker); // pega o próximo job quando terminar
        });

        worker.on("error", (err) => {
            console.log(err)
            //console.error(`❌ Erro no worker ${id}:`, err);
            worker.terminate();
            this.addNewWorker(id); // recria worker se deu erro
        });

        this.getJob(id, worker); 
    }

    getJob = async function(id, worker) {
        try {
            const res = await this.redis.blpop("queue", 0);
            const [, job] = res;
            console.log(res);
            worker.postMessage({ job });
        } catch (err) {
            console.error(`Erro no worker ${id}:`, err);
            setTimeout(this.getJob(), 1000); // tenta de novo depois
        }
    } 

}

export default WorkerPool