# BigMood API #
Sentiment analysis of twitter data (back-end)

The docker file has already been created:
To create the docker image run:
docker build --tag=big-data-node-api .

Running the docker container to test on local machine
docker run -p 3000:3000 -d big-data-node-api

To stop the container
docker stop [container id]
