#!/bin/bash

set -xe

# install phase
pushd backend
pip3 --no-cache install -r requirements.txt --no-deps --target app/layer/
popd

pushd cdk
npm install

# build phase
npm run cdk synth
