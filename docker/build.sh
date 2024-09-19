# Parse inputs
if [[ -z ${1} ]]; then
    # Find all folders with Dockerfile
    to_build=(`find . -mindepth 2 -maxdepth 2 -name Dockerfile  \( ! -iname ".*" \) | grep -oP '(?<=\./)[^/]*'`)
else
    to_build=($@)
fi

for api in ${to_build[@]}; do
    if [[ ! -e $api/Dockerfile ]]; then
        echo "Folder $api is not a valid docker image specification -> ignoring..."
        continue
    fi

    cd $api
    image=$(head Dockerfile -n 1 | grep -oP '(?<=# )[a-z0-9\/\:_-]*')
    echo "Building and publishing ${image} ..."
    docker build -t ${image} .
    docker push ${image}
    echo "Done!"
    cd ..
done

# Clear
docker rmi $(docker images --filter "dangling=true" -q --no-trunc)