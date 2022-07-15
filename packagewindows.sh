
#!/bin/bash

sudo docker run --rm -ti  --env ELECTRON_CACHE="/root/.cache/electron" \
    --env DO_KEY_ID=M76QGZYEZD3DJVNLY75L \
    --env DO_SECRET_KEY=1CH8dAutEWs9zz5RWhVQ9BZv2Kz9cy+bcvY+wife3ek \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"  \
    -v ${PWD}:/project  -v ${PWD##*/}-node-modules:/project/node_modules  \
    -v ~/.cache/electron:/root/.cache/electron  \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    --entrypoint=/bin/bash  electronuserland/builder:wine -c "npx cross-env DEBUG_PROD=true npm run publish:all"

# For more info see this: https://www.electron.build/multi-platform-build#docker
