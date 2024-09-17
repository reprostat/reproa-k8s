# reproa-k8s
Kubernetes deployment of reproa

## Usage
### 1. Build images
```bash
cd docker

# Frontend
cd frontend
docker build -t reprostat/reproa-k8s_frontend:dev .
docker push reprostat/reproa-k8s_frontend:dev

# File API
cd ../file-api
docker build -t reprostat/reproa-k8s_file-api:dev .
docker push reprostat/reproa-k8s_file-api:dev

# Data processor
cd ../data-processor
docker build -t reprostat/reproa-k8s_data-processor:demo .
docker push reprostat/reproa-k8s_data-processor:demo
```

### 2. Deploy
```bash
cd kubernetes
kubectl apply -f deployment.yml && k wait --for=condition=ready pod -l app=file-processing
```

#### Expose
##### Port-forward
```bash
kubectl port-forward deployment.apps/file-processing-deployment 8000:80
```

##### Service
```bash
k apply -f service.yml
```

### 3. Access pod
```bash
POD=$(kubectl get pods -l app=file-processing -o name)
kubectl exec $POD -c file-api -it -- bash
```

### 5. Stop
```bash
kubectl delete -f deployment.yml && k wait --for=delete pod -l app=file-processing --timeout=60s
```