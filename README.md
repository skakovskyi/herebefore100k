# HEREBEFORE100K

Initialize npm project:
npm i

Copy ENV_SAMPLE to .ENV and set up atleast PRIVATE_KEY to start

Compile contracts:
npx hardhat compile

Run tests:
npx hardhat test

Deploy contracts:
npx hardhat run scripts/deploy.js --network main

(--network - optional key for a network settings in hardhat.config.js, if not set will deploy to local node)


If no npx:
npm i -g npx