const amqp = require('amqplib');

class MatchConsumer {
    constructor(queueName, url = 'amqp://localhost') {
        this.queueName = queueName;
        this.url = url;
        this.connection = null;
        this.channel = null;
    }

    async connect() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            const replyQueue = await channel.assertQueue('', { exclusive: true, autoDelete: true });
            console.log(`Connected to RabbitMQ and listening on queue: ${this.queueName}`);
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            process.exit(1);
        }
    }

    async consumeMessage(callback) {
        if (!this.channel) {
            console.error('RabbitMQ channel not initialized.');
            return;
        }

        this.channel.consume(this.queueName, (msg) => {
            if (msg) {
                console.log(`Received message: ${msg.content.toString()}`);
                callback(msg.content.toString());

                // Acknowledge the message
                this.channel.ack(msg);
            }
        });
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed.');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

module.exports = MatchConsumer;
