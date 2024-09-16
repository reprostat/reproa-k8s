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
##### Port-forward
```bash
kubectl port-forward deployment.apps/file-processing-deployment 8080:8000 &
PID1=$!
kubectl port-forward deployment.apps/file-processing-deployment 8081:8001 &
PID2=$!
```

##### Service
```bash
k apply -f service.yml
```
You need to change the hostname in _index.html_ from "_localhost_" to the IP of the service.

### 3. Access pod
```bash
POD=$(kubectl get pods -l app=file-processing -o name)
kubectl exec $POD -c file-api -it -- bash
```

### 5. Stop
```bash
kubectl delete -f deployment.yml && k wait --for=delete $POD --timeout=60s
kill $PID1
kill $PID2
```