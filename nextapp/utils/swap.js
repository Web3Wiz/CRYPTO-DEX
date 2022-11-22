import { Contract } from "ethers";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
} from "../constants";

//swapTokens, getAmountOfTokensReceivedFromSwap

export const getAmountOfTokensReceivedFromSwap = async (
  provider,
  inputAmountInWei,
  ethReserve,
  cryptoDevTokensReserve,
  isEthToCryptoDevConversion
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    let outputAmountOfTokens;
    if (isEthToCryptoDevConversion) {
      outputAmountOfTokens = await exchangeContract.getAmountOfTokens(
        inputAmountInWei,
        ethReserve,
        cryptoDevTokensReserve
      );
    } else {
      outputAmountOfTokens = await exchangeContract.getAmountOfTokens(
        inputAmountInWei,
        cryptoDevTokensReserve,
        ethReserve
      );
    }
    return outputAmountOfTokens;
  } catch (error) {
    console.error(error);
  }
};

export const swapTokens = async (
  signer,
  inputAmountInWei,
  outputTokensToBeReceivedAfterSwap,
  isEthToCryptoDevConversion
) => {
  try {
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
    let tx;
    if (isEthToCryptoDevConversion) {
      tx = await exchangeContract.ethToCryptoDevToken(
        outputTokensToBeReceivedAfterSwap,
        { value: inputAmountInWei }
      );
      await tx.wait();
    } else {
      tx = await tokenContract.approve(
        EXCHANGE_CONTRACT_ADDRESS,
        inputAmountInWei.toString()
      );
      await tx.wait();
      await exchangeContract.cryptoDevTokenToEth(
        inputAmountInWei,
        outputTokensToBeReceivedAfterSwap
      );
      await tx.wait();
    }
  } catch (error) {
    console.error(error);
  }
};
