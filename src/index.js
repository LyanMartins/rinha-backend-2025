import uWS from 'uWebSockets.js';
import Payment from './payment.js';
import Redis from 'ioredis';
import { Worker } from 'worker_threads';
import WorkerPool from './worker.js';

const app = uWS.App();
app.use(express.json());
const payment = new Payment();
payment.healthcheck()
// new WorkerPool('./src/process.js')


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
    return res.end(response)
})

app.get('/payments-summary', async function(req, res){
    res.send(await new Payment().paymentSummary());
})

app.listen(3000, token => {
  if (token) console.log('Listening on port 3000');
});


