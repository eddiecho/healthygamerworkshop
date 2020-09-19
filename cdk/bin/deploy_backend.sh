#!/bin/bash

set -xe

npm install

npm run cdk deploy $1 -- -a cdk.out --require-approval never
