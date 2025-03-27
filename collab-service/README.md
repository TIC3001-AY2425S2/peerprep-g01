# Tutorial: Introduction to RabbitMQ

## Overview

RabbitMQ is a powerful message-broker software that enables communication between applications using messages. It provides a reliable and scalable platform for building distributed systems and implementing messaging patterns like message queues and publish-subscribe (pub/sub).

## Prerequisites

- Basic understanding of messaging and queueing concepts
- Node.js and npm installed on your machine. You can visit this [page](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for installation instructions.
- Docker installed on your machine

## Setup and Installation

1. Pull the official RabbitMQ image from Docker Hub:

   ```
   docker pull rabbitmq:3-management
   ```

2. Run a RabbitMQ container with the management plugin enabled:

   ```
   docker run -d --name some-rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

   The management plugin provides a web-based UI for managing and monitoring the RabbitMQ server. You can now access the RabbitMQ management dashboard in your web browser at http://localhost:15672. Use the default credentials: username "guest" and password "guest".


## Message Queue

1. Go to the "Producer-Consumer" folder and install the required dependencies:

   ```
   npm install
   ```

2. The code for producer, consumer, and a simple web interface has been provided.

   Start the producer by running the following command in a terminal:

   ```
   node producer.js
   ```

   Start the consumer by running the following command in a separate terminal:

   ```
   node consumer.js
   ```

3. Open the `index.html` file in a web browser and click the "Send Message" button.
   Observe the output in the consumer terminal, which should display the received message.

### **Concepts**

- **Producer**: An application that sends messages.
- **Consumer**: An application that mostly waits to receive messages.
- **Queue**: A buffer maintained by RabbitMQ that stores messages until they are consumed.

:blue_book:**Connection and Channel**

- **Connection**: A TCP connection established between the application and RabbitMQ. We need this connection for the application to communicate with the RabbitMQ broker.
- **Channel**: A logical/virtual connection **within a connection** that is used for sending and receiving messages, as well as managing queues, exchanges, bindings, and other RabbitMQ entities. Channels are lightweight, and multiple channels can be *multiplexed over a single connection*, which can be thought of as they share the single TCP connection.

### **Explanation of the Message Queue Example**

In this example, we have a simple web interface with a button that triggers a message to be sent to RabbitMQ. The producer (`producer.js`) defines an Express route named "/send" that sends a message to a queue named "message_queue" when the endpoint is accessed.

The consumer (`consumer.js`) connects to RabbitMQ and consumes messages from the same queue (i.e., the one named "message_queue"). Whenever a message is received, it is logged to the console.

This example demonstrates the basic concept of message queues, where messages are sent by producers and consumed by consumers asynchronously.

### :book:**Exercises**

#### **Asynchronous Message Delivery**

1. Stop the consumer if it's running but ensure the producer is running.
2. Without the consumer running, send multiple messages to RabbitMQ.
3. After the messages are sent, stop the producer.
4. Now, start the consumer by running `node consumer.js`.
5. Observe the output in the consumer terminal.

You should see all the messages that were sent by the producer before the consumer started, demonstrating the asynchronous nature of message queues. Messages are persisted in the queue until they are consumed, regardless of whether the consumer is running when they are sent or the producer is running when they are delivered.

> :bulb:**Tips**
>
> You can access the RabbitMQ management dashboard at http://localhost:15672 (with the default guest/guest credentials) to observe the queues, messages, and other details. This can be a useful tool for monitoring and troubleshooting your RabbitMQ setup.

#### Message Durability

The previous exercise demonstrates RabbitMQ is able to hold the messages until they are consumed, but what if the RabbitMQ server stops before the messages are consumed? Let's simulate this scenario.

1. Repeat steps 1-3 in the previous exercise.

2. Before starting the consumer, restart the Docker container running the RabbitMQ server:

   ```
   docker restart some-rabbit
   ```

3. Now continue with steps 4-5 in the previous exercise.

Unfortunately, When RabbitMQ quits or crashes, it will forget the queues and messages unless we tell it not to. To make sure that messages aren't lost, we need to mark **both the queue and messages** as *durable*.

1. In both the `producer.js` and `consumer.js` files, find the line where the queue is declared and update it to (note that a new queue name is used):

   ```javascript
   await channel.assertQueue("durable_message_queue", { durable: true });
   ```

2. In the `producer.js` file, find the line where messages are published and add the `persistent` option:

   ```javascript
   channel.sendToQueue("durable_message_queue", Buffer.from(message), { persistent: true });
   ```

3. Don't forget to update the queue name for `channel.consume` in `consumer.js`!

4. After these changes, repeat the steps, and undelivered messages should now be persisted even after RabbitMQ restarts.

#### Consumer Acknowledgment and Message Redelivery

1. Open the `consumer.js` file and comment out or remove the line `channel.ack(message);` which acknowledges the successful processing of a message by the consumer.
2. Restart the consumer by running `node consumer.js`.
3. Start the producer and send a message from the web interface.
4. Observe the output in the consumer terminal. You should see the message being logged.
5. Stop and restart the consumer multiple times. What do you observe? Compare this behavior to when the acknowledgment (`ack`) is used.

By removing the acknowledgment from the consumer, messages are repeatedly delivered and consumed. RabbitMQ assumes unacknowledged messages haven't been processed successfully and redelivers them after a consumer restart, ensuring no message is lost even if a worker dies.

# Publish/Subscribe

Let's extend the previous example to demonstrate the publish/subscribe (pub/sub) pattern using RabbitMQ and Node.js.

1. Now go to the "Publisher-Subscriber" folder and install the required dependencies:

   ```
   npm install
   ```

2. The code for publisher, subscriber, and a simple web interface has been provided.

   Start the publisher by running the following command in a terminal:

   ```
   node publisher.js
   ```

   Start **multiple instances of the subscriber** by running the following command in separate terminals:

   ```
   node subscriber.js
   ```

3. Open the `index.html` file in a web browser and click the "Publish Message" button.
   Observe the output in all the subscriber terminals, which should display the received message.


### **Concepts**

- **Exchange**: A message routing agent responsible for receiving messages from producers/publishers and pushing them to one or more queues based on the *exchange type*.
  - **Fanout** exchange type: Broadcasts (routes) messages to all queues bound to the exchange.
- **Binding**: A relationship between an exchange and a queue that tells the exchange to send messages to the queue.

:blue_book:**Temporary queues**

```javascript
channel.assertQueue("", { exclusive: true });
```

This line of code in `subscriber.js` creates a temporary queue. Temporary queues are useful in scenarios where a fresh, empty queue is needed upon connecting to RabbitMQ, and there is no need to share it between producers and consumers. The queue created has some properties:

- **Randomly named:** RabbitMQ generates a unique, random name for the queue when the queue is declared with an empty string as its name.
- **Automatically deleted:** The queue is automatically deleted when the connection that declared it closes. This ensures cleanup and avoids unused queues.
- **Exclusive usage:** The queue is declared as *exclusive*, meaning only the connection that created it can consume messages from it.

### **Explanation of the Pub/Sub Example**

In this pub/sub example, the publisher (`publisher.js`) creates an exchange named "logs". The exchange is declared to be of type "fanout", which means it will broadcast the messages to all the queues bound to it.

Each subscriber (`subscriber.js`) creates an exclusive queue and binds it to the "logs" exchange. Each subscriber will then receive its own copy of the published messages.

When you click the "Publish Message" button in the web interface, the publisher publishes a message to the "logs" exchange. The exchange then distributes the message to all the bound queues, and each subscriber consumes and logs the received message.

This demonstrates the pub/sub pattern, where multiple subscribers can receive the same message independently. It allows for decoupling of the message producers and consumers, enabling scalable and flexible architectures.

<br>

> :book:**Additional Exercise**
>
> In the pub/sub example, we ran multiple subscribers, and they all received the same published message. In this additional exploration, try running multiple consumers (`consumer.js`) in the previous producer-consumer example and observe how RabbitMQ distributes messages across them.

## **Further Exploration and References**

This tutorial has covered some core concepts of RabbitMQ and demonstrated the message queue and publish/subscribe patterns using Node.js. However, RabbitMQ is a powerful tool with many more features and use cases to explore.

The [official RabbitMQ tutorials](https://www.rabbitmq.com/tutorials/tutorial-one-javascript) provide a wealth of information and cover more advanced topics in depth. Use them as a reference and continue learning and exploring the powerful capabilities of RabbitMQ.
