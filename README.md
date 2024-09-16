# reproa-k8s
Kubernetes deployment of reproa

## Usage
### 1. Build file-api
```bash
cd docker/file-api
docker build -t reprostat/file-api:dev .
docker push reprostat/file-api:dev
```

### 2. Deploy
```bash
cd kubernetes
kubectl apply -f deployment.yml
```

#### Expose
##### Service
```bash
k apply -f service.yml
```

##### Port-forward
```bash
kubectl port-forward deployment.apps/file-processing-deployment 8000:8000
```

### 3. Access pod
```bash
POD=$(kubectl get pods -l app=file-processing -o name)
kubectl exec $POD -c file-api -it -- bash
```

### 5. Stop
```bash
kubectl delete -f deployment.yml && k wait --for=delete $POD --timeout=60s
```