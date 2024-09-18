# reproa-k8s
Kubernetes deployment of reproa

## Usage
### 1. Build images
```bash
. docker/build.sh
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
kubectl exec $POD -c data-processor -it -- bash
```

### 5. Stop
```bash
kubectl delete -f deployment.yml && k wait --for=delete pod -l app=file-processing --timeout=60s
```