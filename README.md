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
Make sure you supply the correct project name.
  
Build the docker image and test it locally?  
1. Run the following commands to upload and create a docker image onto google cloud registry, it will also build the container for deployment.
gcloud builds submit --config big-mood-cloud-build.yaml .  
2. Wait for it to succeed. To test if the deployed image runs as expected we will do two things.  i. Set the config for our local docker to use google cloud registry.  ii. Pull the docker image and run.  
gcloud auth configure-docker  
docker run -p 3000:3000 -p 34234:34234 gcr.io/supple-bank-232805/big-data-node-api:latest  
This should start the node js server locally and Redis client and kafka should be connected if you have provided the correct configuration files.  
  
Deopoying the image in Kuberneties cluster.  
1. Create a container cluster using the gcloud.(we are creating single node cluster)  
gcloud container clusters create big-data-node-api-cluster --num-nodes 1  
2. Create a deployment of the uploaded image on the createded cluser.
kubectl apply -f bigmoodapi-deploy.yaml  
3. Create a loadbalancer service to expose the cluster on the web.  
kubectl apply -f bigmoodapi-loadbalancer-service.yaml  
4. Run the 'kubectl get service' command to get the status of your deployment.  Wait till the external IP address populates. Now use the external IP address with the port information to check the status of your service.  
You will see an external IP Address of the load balancer and PORT mappings. -> Ex: 3000:32031/TCP,34234:30455/TCP  (Don't worry about these mapping)  

Test the emdpoints:
Example: ---.---.---.---:3000/bigmoodapi/trends/ 


