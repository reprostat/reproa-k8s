kubectl delete -f reproa-k8s/frontend.yml && kubectl delete -f reproa-k8s/api.yml
kubectl wait --for=delete -n reproa pod -l app=reproa-frontend --timeout=60s
kubectl wait --for=delete -n reproa pod -l app=reproa-api --timeout=60s

SVC_TYPE=$(kubectl get svc -n reproa reproa-access -o custom-columns='TYPE:.spec.type' | tail -n 1 | awk '{print tolower($0)}')
if [[ ! -z $SVC_TYPE ]]; then
    kubectl delete reproa-k8s-access/${SVC_TYPE}.yml
    kubectl wait --for=delete -n reproa svc -l app=reproa-frontend --timeout=60s
fi

kubectl delete -f reproa-k8s/namespace.yml