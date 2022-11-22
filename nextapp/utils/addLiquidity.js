import { Contract, utils } from "ethers";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
} from "../constants";

export const addLiquidity = async (
  signer,
  cryptoDevTokenAmountToAddInWei,
  ethAmoutToAddInWei
) => {
  const tokenContract = new Contract(
    TOKEN_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    signer
  );
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );

  let tx = await tokenContract.approve(
    EXCHANGE_CONTRACT_ADDRESS,
    cryptoDevTokenAmountToAddInWei.toString()
  );
  await tx.wait();
  tx = await exchangeContract.addLiquidity(cryptoDevTokenAmountToAddInWei, {
    value: ethAmoutToAddInWei,
  });
  await tx.wait();
};

export const calculateCD = async (
  ethAmount = "0",
  cryptoDevTokenReserve,
  ethReserve
) => {
  const ethAmoutToAddInWei = utils.parseEther(ethAmount);

  const cryptoDevTokenAmountToAdd = ethAmoutToAddInWei
    .mul(cryptoDevTokenReserve)
    .div(ethReserve);

  return cryptoDevTokenAmountToAdd;
};
