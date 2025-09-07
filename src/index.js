import uWS from 'uWebSockets.js';
// const uWS = require('../dist/uws.js');
// import express from 'express';
import Fastify from 'fastify'
import Payment from './payment.js';
import Redis from 'ioredis';
import { Worker } from 'worker_threads';
import WorkerPool from './worker.js';


// const app = uWS.App();
// const app = express();
const app = Fastify({
  logger: true
})
// app.use(express.json());
const payment = new Payment();
payment.healthcheck()
// new WorkerPool('./src/process.js')
// 


// app.get('/', (res, req) => {
//   res.end(JSON.stringify({ status: 'ok' }));
// })

// app.listen(3000, token => {
//   if (token) console.log('Listening on port 3000');
// });

app.get('/', async function(req, res){
    return res.send(await new Payment().healthcheck());
})

app.post('/payments', function(req, res){
    let response = payment.payment(req.body);
    return res.send(response)
})

// app.post('/payments',function(req, res){
    
//     readJson(req, (body) => {
//         console.log('Recebi o body:', body);
//         let response = payment.payment(body);
//     });
//     // Trata abortos
//     req.onAborted(() => {
//       console.log('Request abortada pelo cliente');
//     });
//     return req.end('response')
// })


app.get('/payments-summary', async function(req, res){
    res.send(await new Payment().paymentSummary());
})

// app.get('/payments-summary', async function(req, res){

//     req.onAborted(() => {
//         req.aborted = true;
//     });

//     const ret = await new Payment().paymentSummary();
    
//     // console.log(ret)

//     if (!req.aborted) {
//         req.cork(() => {
//             req.end(ret);
//         });
//     }
// })

app.get('/purge-payment', function(req, res) {
    payment.purgePayment();
    res.send("OK")
})

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
})

// app.listen(3000, token => {
//     if (token) console.log('Listening on port 3000');
// });

function readJson(req, callback){
    let buffer = Buffer.alloc(0);
    // Captura os dados que chegam
    req.onData((chunk, isLast) => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
        let body = null;
        if (isLast) {
            try {
                body = JSON.parse(buffer.toString());
            } catch (err) {
                console.log(err)
                body = [];
            }
            callback(body); // retorna o body
        }
    });
    // return body;
}
