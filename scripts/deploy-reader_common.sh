MINIMUM_BASH_VERSION=4

BASTION_HOST=b.dlib.nyu.edu

declare -A ENVIRONMENTS

ENVIRONMENTS[dev]=devweb1.dlib.nyu.edu

ENVIRONMENTS[stage]=stageweb1.dlib.nyu.edu

ENVIRONMENTS[prod]=web1.dlib.nyu.edu

# This string tells the expect script wrapper that refresh run has completed.
SCRIPT_RUN_COMPLETE='Open Square reader deployment completed.'

function validate_environment_arg() {
    local deploy_to_environment=$1

    if ! [ ${ENVIRONMENTS[${deploy_to_environment}]} ]
    then
        echo >&2 "\"${deploy_to_environment}\" is not a recognized deployment environment."

        usage

        exit 1
    fi
}

function get_server() {
    local deploy_to_environment=$1

    echo ${ENVIRONMENTS[${deploy_to_environment}]}
}

