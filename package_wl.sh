
#!/bin/bash

npm version patch -git-tag-version false

(cd release/app/; npm version patch -git-tag-version false)

sudo docker run --rm -ti \
    --env CSC_LINK=/project/certificate.pfx \
    --env DO_KEY_ID=OKJRQ3JKZHYSMDJP3PZZ \
    --env DO_SECRET_KEY=WLNAC1hvaGaAiXwqaiTmL3hiPvKq4ieagH2C1sy5ozo \
    --env ELECTRON_CACHE="/root/.cache/electron" \
    --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder"  \
    -v "${PWD}:/project"  -v "${PWD##*/}-node-modules:/project/node_modules"  \
    -v ~/.cache/electron:/root/.cache/electron  \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    --entrypoint=/bin/bash  electronuserland/builder:wine \
    -c "npm install && npx cross-env DEBUG_PROD=true npm run publish:all"

# For more info see this: https://www.electron.build/multi-platform-build#docker
