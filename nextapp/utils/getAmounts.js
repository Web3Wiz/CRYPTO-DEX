import { Contract } from "ethers";
import {
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  EXCHANGE_CONTRACT_ABI,
} from "../constants";

export const getEtherBalance = async (
  provider,
  address,
  isContract = false
) => {
  try {
    const ethBalance = isContract
      ? await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS)
      : await provider.getBalance(address);

    return ethBalance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
export const getCryptoDevTokensBalance = async (provider, address) => {
  try {
    const tokenContract = new Contract(
      TOKEN_CONTRACT_ADDRESS,
      TOKEN_CONTRACT_ABI,
      provider
    );
    const cryptoDevTokenBalance = await tokenContract.balanceOf(address);
    return cryptoDevTokenBalance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getLPTokensBalance = async (provider, address) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const lpTokenBalance = await exchangeContract.balanceOf(address);
    return lpTokenBalance;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getCryptoDevTokensReserve = async (provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const cryptoDevTokenReserve =
      await exchangeContract.getCryptoDevTokenReserves();
    return cryptoDevTokenReserve;
  } catch (error) {
    console.error(error);
    return 0;
  }
};
