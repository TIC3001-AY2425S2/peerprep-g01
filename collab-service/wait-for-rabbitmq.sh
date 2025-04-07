#!/bin/sh
# wait-for-rabbitmq.sh

set -e

host="$1"
shift

until nc -z "$host" 5672; do
  echo "Waiting for RabbitMQ to be ready..."
  sleep 1
done

echo "RabbitMQ is up - executing command"
exec "$@" 