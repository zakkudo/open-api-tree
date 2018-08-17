#!/bin/bash

set -e

yarn build
yarn document
yarn cover

cp package.json build/package.json
cp README.md build/README.md

yarn publish --access public --no-git-tag-version --cwd build
