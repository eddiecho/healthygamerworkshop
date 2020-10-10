#!/bin/bash

set -xe

pushd frontend

npm install
npm run build
