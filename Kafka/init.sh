#!/bin/bash

# Wait for Kafka brokers to be ready
while ! kafka-broker-api-versions.sh --bootstrap-server kafka1:9092; do
sleep 2;
done;

while ! kafka-broker-api-versions.sh --bootstrap-server kafka2:9092; do
sleep 2;
done;

# List of topics to create
topics=(
"cv_parsing"
"cv_embedding_generation"
"job_embedding_generation"
"profile_embedding_generation"
"logs"
"emails"
)

# Function to check if a topic exists
topic_exists() {
kafka-topics.sh --list --bootstrap-server kafka1:9092 | grep -wq "$1"
}

# Create topics if they do not exist
for topic in "${topics[@]}"; do
if topic_exists "$topic"; then
    echo "Topic '$topic' already exists."
else
    kafka-topics.sh --create --bootstrap-server kafka1:9092 --partitions 1 --topic "$topic"
fi
done;