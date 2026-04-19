#!/usr/bin/env bash
cd ..

git pull
bun run build

echo 'Deployed!'
