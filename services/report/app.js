const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
      }
}


async function processMessage(msg) {
    try {
        const reportData = JSON.parse(msg.content.toString());
        console.log('--- [REPORT SERVICE] NEW MESSAGE RECEIVED ---');
        
        await updateReport(reportData.products);
        await printReport();
        
        console.log('-------------------------------------------');
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.message}`);
        console.log(msg.content.toString());
    }
}

async function consume() {
    console.log('Starting Report Service...');
    let rabbitMQService;
    try {
        rabbitMQService = await RabbitMQService.getInstance();
    } catch (error) {
        console.error('X ERROR: Could not connect to RabbitMQ.', error);
        process.exit(1);
    }

    const queue = 'report';
    console.log(`[REPORT SERVICE] Waiting for messages in queue: ${queue}`);

    try {
        await rabbitMQService.consume(queue, processMessage);
    } catch (error) {
        console.error(`X ERROR: Could not start consuming from queue ${queue}`, error);
    }
} 

consume()