# reproa-k8s
Kubernetes deployment of reproa

## Usage
### 1. Build images
```bash
. docker/build.sh
```

### 2. Deploy
#### Deploy
```bash
. kubernetes/deploy.sh port-forward
# . kubernetes/deploy.sh load-balancer
```

### 3. Stop
```bash
. kubernetes/delete.sh
```

## Debug
### Access containers
```bash
# Frontend
POD_WEB=$(kubectl get pods -n reproa -l app=reproa-frontend -o name)
kubectl exec -n reproa $POD_WEB -it -- sh

# Data-processor
POD_API=$(kubectl get pods -n reproa -l app=reproa-api -o name)
kubectl exec -n reproa $POD_API -c data-processor-api -it -- bash
```
