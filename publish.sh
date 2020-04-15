#!/bin/sh

# Install
yarn

# Build
cd packages/cli
yarn build
cd ../..

# Login to NPM
npm login

# Publish eslint-config
cd packages/eslint-config
npm publish --tag latest --access public
cd ../..

# Publish babel-preset
cd packages/babel-preset
npm publish --tag latest --access public
cd ../..

# Publish babel-preset-react
cd packages/babel-preset-react
npm publish --tag latest --access public
cd ../..

# Publish cli
cd packages/cli
npm publish --tag latest --access public
cd ../..

# Logout of NPM
npm logout
