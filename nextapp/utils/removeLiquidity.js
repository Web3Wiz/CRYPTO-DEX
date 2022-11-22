import { Contract } from "ethers";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
} from "../constants";

export const removeLiquidity = async (
  signer,
  cryptoDevLPTokensToRemoveInWei
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );

  const tx = await exchangeContract.removeLiquidity(
    cryptoDevLPTokensToRemoveInWei
  );
  await tx.wait();
};

export const getTokensAfterRemove = async (
  provider,
  cryptoDevLPTokensToRemoveInWei,
  ethReserve,
  cryptoDevTokenReserve
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );

    const cryptoDevLPTokensReserve = await exchangeContract.totalSupply();

    const ethToReturn = ethReserve
      .mul(cryptoDevLPTokensToRemoveInWei)
      .div(cryptoDevLPTokensReserve);
    const cryptoDevTokensToReturn = cryptoDevTokenReserve
      .mul(cryptoDevLPTokensToRemoveInWei)
      .div(cryptoDevLPTokensReserve);

    return { ethToReturn, cryptoDevTokensToReturn };
  } catch (error) {
    console.error(error);
  }
};
