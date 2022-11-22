const { ethers } = require("hardhat");
const { CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS } = require("../constants");

const main = async () => {
  const contract = await ethers.getContractFactory("Exchange");

  /* ############ START => Additional Deployement Steps (Optional) ######################## */
  {
    const gasPrice = await contract.signer.getGasPrice();
    console.log(`Current gas price: ${gasPrice}`);
    const estimatedGas = await contract.signer.estimateGas(
      contract.getDeployTransaction(CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS) //need to change based upon contract's constructor
    );
    console.log(`Estimated gas: ${estimatedGas}`);
    const deploymentPrice = gasPrice.mul(estimatedGas);
    const deployerBalance = await contract.signer.getBalance();
    console.log(
      `Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`
    );
    console.log(
      `Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`
    );
    if (Number(deployerBalance) < Number(deploymentPrice)) {
      throw new Error("You dont have enough balance to deploy.");
    }
  }
  /* ############ END   => Additional Deployement Steps (Optional) ######################## */

  const deployedContract = await contract.deploy(
    CRYPTO_DEV_TOKEN_CONTRACT_ADDRESS
  );
  await deployedContract.deployed();

  console.log("Exchange contract address is", deployedContract.address);
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
