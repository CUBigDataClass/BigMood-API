# BigMood API #
Sentiment analysis of twitter data (back-end)

The docker file has already been created:
To create the docker image run:
docker build --tag=big-data-node-api .

Running the docker container to test on local machine
docker run -p 3000:3000 -d big-data-node-api

To stop the container
docker stop [container id]

Deployment on Google cloud:
1. Install the Google cloud sdk on local machine
2. Install the kubctl
3. Setup your project configuration - gcloud init
4. We have created a gcloud build config for this project. (big-mood-cloud-build.yaml).
5. Run the following commands to upload and create a docker image onto google cloud registry, it will also build the container for deployment.
  gcloud builds submit --config big-mood-cloud-build.yaml .
6. Wait for it to succeed. To test if the deployed image runs as expected we will do two things. 1. Set the config for our local docker to use google cloud registry. 2. Pull the docker image and run.
gcloud auth configure-docker
docker run -p 3000:3000 gcr.io/supple-bank-232805/big-data-node-api
This should start the node js server locally and Redis client should be connected.
7.
