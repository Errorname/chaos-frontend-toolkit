#!/bin/bash

# Remove previous zips
rm landing/chaos-frontend-toolkit-with-manifest-v3.zip
rm landing/chaos-frontend-toolkit-with-manifest-v2.zip
rm -rf chaos-frontend-toolkit

# Compile library
npm run browserify

# Zip Web Extension Manifest V3
cp -R web-extension chaos-frontend-toolkit
cd chaos-frontend-toolkit
rm manifest-v2.json
zip -r ../landing/chaos-frontend-toolkit-with-manifest-v3.zip .

# Zip Web Extension Manifest V2
cp ../web-extension/manifest-v2.json manifest.json
zip -r ../landing/chaos-frontend-toolkit-with-manifest-v2.zip .

# Cleanup
cd ..
rm -rf chaos-frontend-toolkit