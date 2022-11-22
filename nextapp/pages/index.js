import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import Web3Modal from "web3modal";
import { utils, providers, BigNumber } from "ethers";

import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
  getCryptoDevTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getCryptoDevTokensReserve,
} from "../utils/getAmounts";
import {
  getTokensAfterRemove,
  removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);

  //User Balances
  const [ethBalance, setETHBalance] = useState(zero);
  const [cdBalance, setCDBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);

  //Contract Reserves
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);

  //Add Tokens
  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);

  //Remove Tokens
  const [removeEther, setRemoveEther] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeLPTokens, setRemoveLPTokens] = useState("0");

  //Swap
  const [swapAmount, setSwapAmount] = useState("");
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);

  //Is ETH selected
  const [ethSelected, setEthSelected] = useState(true);

  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then((signerAddress) => {
        if (signerAddress != "") _getAmounts();
      });
    }
  }, [walletConnected]);

  const connectWallet = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      if (address != "") {
        setWalletConnected(true);
      }
      return address;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const currentProvider = await web3ModalRef.current.connect();
    const web3provider = new providers.Web3Provider(currentProvider);

    const { chainId } = await web3provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please connect your wallet using Goerli testnet!");
      throw new Error("Please connect your wallet using Goerli testnet!");
    }
    return needSigner ? web3provider.getSigner() : web3provider;
  };

  const _getAmounts = async () => {
    const provider = await getProviderOrSigner();
    const signer = await getProviderOrSigner(true);
    const address = await signer.getAddress();

    //User Balances
    setCDBalance(await getCryptoDevTokensBalance(provider, address));
    setETHBalance(await getEtherBalance(provider, address, false));
    setLPBalance(await getLPTokensBalance(provider, address));

    //Contract Reserves
    setEtherBalanceContract(await getEtherBalance(provider, null, true));
    const _reservedCD = await getCryptoDevTokensReserve(provider);
    setReservedCD(_reservedCD);
  };
  const _addLiquidity = async () => {
    try {
      const addEitherInWei = utils.parseEther(addEther.toString());
      if (!addEitherInWei.eq(zero) && !addCDTokens.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEitherInWei);
        setLoading(false);

        setAddCDTokens(zero);
        await _getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      window.alert(error.error.message);
    }
  };
  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokensInWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTokensInWei);
      setLoading(false);
      await _getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
      window.alert(error.error.message);
    }
  };
  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokensInWei = utils.parseEther(_removeLPTokens);

      const _ethReserve = await getEtherBalance(provider, null, true);
      const _cdReserve = await getCryptoDevTokensReserve(provider);

      const { ethToReturn, cryptoDevTokensToReturn } =
        await getTokensAfterRemove(
          provider,
          removeLPTokensInWei,
          _ethReserve,
          _cdReserve
        );

      setRemoveEther(ethToReturn);
      setRemoveCD(cryptoDevTokensToReturn);
    } catch (error) {
      console.error(error);
    }
  };

  const _swapTokens = async () => {
    try {
      const swapAmountInWei = utils.parseEther(swapAmount);
      if (!swapAmountInWei.eq(zero)) {
        setLoading(true);
        const signer = await getProviderOrSigner(true);
        await swapTokens(
          signer,
          swapAmountInWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);
        await _getAmounts();
        setSwapAmount("");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      await _getAmounts();
      setSwapAmount("");
      window.alert(error.error.message);
    }
  };
  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const swapAmountInWei = utils.parseEther(_swapAmount);
      if (!swapAmountInWei.eq(zero)) {
        setLoading(true);
        const provider = await getProviderOrSigner();
        const outputAmountOfTokens = await getAmountOfTokensReceivedFromSwap(
          provider,
          swapAmountInWei,
          etherBalanceContract,
          reservedCD,
          ethSelected
        );
        setLoading(false);

        settokenToBeReceivedAfterSwap(outputAmountOfTokens);
      } else {
        settokenToBeReceivedAfterSwap(zero);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  const renderTabs = () => {
    if (!walletConnected) {
      return <div></div>;
    }

    if (loading) {
      return (
        <button className={styles.button}>Processing... Please wait</button>
      );
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(cdBalance)} Crypto Dev Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} Crypto Dev LP tokens
          </div>
          <div>
            <h3>Add Liquidity</h3>
            {utils.parseEther(reservedCD.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Enter Ether Amount"
                  onChange={(e) => {
                    setAddEther(e.target.value || "0");
                  }}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Enter CryptoDev tokens amount"
                  onChange={(e) => {
                    setAddCDTokens(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    );
                  }}
                  className={styles.input}
                />
                <br />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    const _addCDTokens = await calculateCD(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedCD
                    );
                    setAddCDTokens(_addCDTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {`You will need ${utils.formatEther(addCDTokens)} Crypto Dev
                  Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            {
              <div>
                <h3>Remove Liquidity</h3>
                <input
                  type="number"
                  placeholder="Amount of LP Tokens"
                  onChange={async (e) => {
                    setRemoveLPTokens(e.target.value || "0");
                    await _getTokensAfterRemove(e.target.value || "0");
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  You will get{" "}
                  {removeCD == null ? " " : utils.formatEther(removeCD)} Crypto
                  Dev Tokens and{" "}
                  {removeEther == null ? " " : utils.formatEther(removeEther)}{" "}
                  Eth
                </div>
                <button className={styles.button1} onClick={_removeLiquidity}>
                  Remove
                </button>
              </div>
            }
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Crypto Dev Tokens`
              : `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={_swapTokens}>
            Swap
          </button>
        </div>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>DeFi Exchange</title>
        <meta name="description" content="CryptoDevs Decentralized Exchange" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDevs DeFi Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </div>
          <div>
            {walletConnected ? (
              <div>
                <div>
                  <button
                    className={styles.button}
                    onClick={() => {
                      setLiquidityTab(true);
                    }}
                  >
                    Liquidity
                  </button>
                  <button
                    className={styles.button}
                    onClick={() => {
                      setLiquidityTab(false);
                    }}
                  >
                    Swap
                  </button>
                </div>
                {renderTabs()}
              </div>
            ) : (
              <button className={styles.button} onClick={connectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
        <div>
          <img className={styles.image} src="./cryptodev.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Kazim&#169;
      </footer>
    </div>
  );
}
