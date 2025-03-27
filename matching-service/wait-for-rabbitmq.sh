#!/bin/sh
while ! nc -z rabbitmq 5672; do
  echo "Waiting for RabbitMQ to be ready..."
  sleep 1
done
echo "RabbitMQ is ready!"
exec "$@" 