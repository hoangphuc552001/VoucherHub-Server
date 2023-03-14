const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account, ", deployer.address);

  console.log("Account balance: ", (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory("RandomNumber");
  const contract = await Contract.deploy("1234", "NgocLe", "1.0.0");

  console.log("Token address", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
