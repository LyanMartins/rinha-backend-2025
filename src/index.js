import express from 'express';
import Payment from './payment.js';
import Redis from 'ioredis';

const app = express();
app.use(express.json());
new Payment().worker()

app.get('/', async function(req, res){
    return res.send(await new Payment().healthcheck());
})

app.post('/payments', async function(req, res){
    let response = await new Payment().payment(req.body);
    return res.send(response)
})

app.get('/payments-summary', async function(req, res){
    res.send(await new Payment().paymentSummary());
})



app.listen(3000, function(){
    console.log('run')
    // while (true) {
    //     new Payment().worker()
    // }
});

