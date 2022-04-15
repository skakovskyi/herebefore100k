require("@nomiclabs/hardhat-waffle");
require('hardhat-contract-sizer');

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const { API_URL, PRIVATE_KEY } = process.env;


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    main: {
      url: API_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  contractSizer: {
    runOnCompile: true
  }
};
