kubectl apply -f reproa-k8s/namespace.yml
kubectl apply -f reproa-k8s/frontend.yml && kubectl apply -f reproa-k8s/api.yml
kubectl wait --for=condition=ready -n reproa pod -l app=reproa-frontend --timeout=60s
kubectl wait --for=condition=ready -n reproa pod -l app=reproa-api --timeout=60s

case $1 in
    port-forward)
        kubectl port-forward -n reproa deployment.apps/reproa-frontend 8000:80
        ;;
    load-balancer)
        kubectl apply -f reproa-k8s/loadbalancer.yml
        kubectl wait --for=jsonpath='{.status.loadBalancer.ingress}' -n reproa service/reproa-access
        ;;
    *)
        echo "Invalid argument"
        ;;
esac
