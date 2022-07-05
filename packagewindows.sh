
#!/bin/bash

sudo docker run --rm -ti  --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"  \
    -v ${PWD}:/project  -v ${PWD##*/}-node-modules:/project/node_modules  \
    -v ~/.cache/electron:/root/.cache/electron  \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    --entrypoint=/bin/bash  electronuserland/builder:wine -c "npm run package -- --windows"

# See this for more info: https://www.electron.build/multi-platform-build#docker
