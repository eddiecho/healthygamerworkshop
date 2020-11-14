#!/bin/bash

set -xe

# install phase
pushd backend
pip3 --no-cache install -r requirements.txt --target app/layer/python/
popd

pushd cdk
npm install

# build phase
npm run cdk synth
