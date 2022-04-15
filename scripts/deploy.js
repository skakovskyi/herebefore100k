const hre = require("hardhat");

async function main() {
  
  const HereBeforeToken = await ethers.getContractFactory("HereBeforeToken");
  const contract = await HereBeforeToken.deploy();
  await contract.deployed();
  
  console.log("HereBeforeToken deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
