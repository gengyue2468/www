#!/usr/bin/env bash
rsync -avz --exclude='node_modules' --exclude='dist' ./ gengyue@100.101.102.10:~/www/
mosh gengyue@100.101.102.10
cd ~/www
npm run build
echo "Deployment complete!"
exit