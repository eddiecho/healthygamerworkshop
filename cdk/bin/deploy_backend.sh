#!/bin/bash

set -xe

npm run cdk deploy $1 -- -a cdk.out --require-approval never
