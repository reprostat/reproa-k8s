POD_WEB=$(kubectl get pods -n reproa -l app=reproa-frontend -o name)
kubectl delete -n reproa $POD_WEB

POD_API=$(kubectl get pods -n reproa -l app=reproa-api -o name)
kubectl delete -n reproa $POD_API