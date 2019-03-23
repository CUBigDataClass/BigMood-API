# BigMood API #  
Sentiment analysis of Twitter data (back-end)  

The docker file has already been created:  
To create the docker image run:  
docker build --tag=big-data-node-api .  

Running the docker container to test on local machine  
docker run -p 3000:3000 -d big-data-node-api  

To stop the container  
docker stop [container id]  

Deployment on Google cloud:  
1. Install the Google cloud SDK on a local machine  
2. Install the kubectl  
3. Setup your project configuration - gcloud init  
4. We have created a gcloud build config for this project. (big-mood-cloud-build.yaml).  
5. Run the following commands to upload and create a docker image onto google cloud registry, it will also build the container for deployment.
gcloud builds submit --config big-mood-cloud-build.yaml .  
6. Wait for it to succeed. To test if the deployed image runs as expected we will do two things. 1. Set the config for our local docker to use google cloud registry. 2. Pull the docker image and run.
gcloud auth configure-docker  
docker run -p 3000:3000 gcr.io/supple-bank-232805/big-data-node-api  
This should start the node js server locally and Redis client should be connected.  
7. Create a container cluster using the gcloud.  
gcloud container clusters create big-data-node-api-cluster  
8. Run the Docker container images on the above cluster.  
kubectl run big-data-node-api-cluster --image gcr.io/supple-bank-232805/big-data-node-api --port 3000  
9. Put the cluster in front of a load balancer and set up the ports.  
kubectl expose deployment big-data-node-api-cluster --type LoadBalancer --port 3000 --target-port 3000  

10. Run the 'kubectl get service' command to get the status of your deployment.  
Wait till the external IP address populates. Now use the external IP address with the port information to check the status of your service.  
Example: 104.198.251.99:3000/bigmoodapi/trends/ . 
