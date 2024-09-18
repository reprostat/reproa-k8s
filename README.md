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
cd kubernetes
kubectl apply -f namespace.yml
kubectl apply -f frontend.yml && kubectl apply -f api.yml
kubectl wait --for=condition=ready -n reproa pod -l app=reproa-frontend --timeout=60s
kubectl wait --for=condition=ready -n reproa pod -l app=reproa-api --timeout=60s
```

#### Expose
##### Port-forward
```bash
kubectl port-forward -n reproa deployment.apps/reproa-frontend 8000:80
```

##### Service
```bash
kubectl apply -f service.yml
kubectl wait --for=jsonpath='{.status.loadBalancer.ingress}' -n reproa service/reproa-access
```

### 3. Stop
```bash
kubectl delete -f frontend.yml && kubectl delete -f api.yml
kubectl wait --for=delete -n reproa pod -l app=reproa-frontend --timeout=60s
kubectl wait --for=delete -n reproa pod -l app=reproa-api --timeout=60s
kubectl delete -f namespace.yml
```

## Debug
### Access data-prcessor
```bash
POD_API=$(kubectl get pods -n reproa -l app=reproa-api -o name)
kubectl exec -n reproa $POD_API -c data-processor -it -- bash
```
