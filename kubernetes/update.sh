if [[ -z ${1} ]]; then
    # Find all folders with Dockerfile
    to_update=(frontend api)
else
    to_update=($@)
fi

for pod in ${to_update[@]}; do
    POD=$(kubectl get pods -n reproa -l app=reproa-${pod} -o name)
    kubectl delete -n reproa $POD

    podname=POD_$(echo $pod | awk '{print toupper($0)}')
    declare $podname=$(kubectl get pods -n reproa -l app=reproa-${pod} -o name)  
    export $podname  
done
