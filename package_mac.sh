#!/bin/bash
sudo rm -rf ./release/app/dist
npx cross-env \
DO_KEY_ID=OKJRQ3JKZHYSMDJP3PZZ \
DO_SECRET_KEY=WLNAC1hvaGaAiXwqaiTmL3hiPvKq4ieagH2C1sy5ozo \
APPLE_ID=mahmoudmousahamad@gmail.com \
APPLE_ID_PASS=hsjb-ojek-ajwr-bwlz \
npm run package --mac
