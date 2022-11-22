//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {
    address public cryptoDevTokenAddress;

    constructor(address _cryptoDevTokenAddress)
        ERC20("CryptoDev Liquidity Provider Token", "CDLP")
    {
        require(
            _cryptoDevTokenAddress != address(0),
            "Null adddress provided for CryptoDev Token"
        );
        cryptoDevTokenAddress = _cryptoDevTokenAddress;
    }

    function getCryptoDevTokenReserves() public view returns (uint256) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }

    function addLiquidity(uint256 _CryptoDevTokenAmount)
        public
        payable
        returns (uint256)
    {
        uint256 liquidity;
        uint256 CryptoDevTokenReserves = getCryptoDevTokenReserves();
        uint256 ethReserves = address(this).balance;

        if (CryptoDevTokenReserves == 0) {
            ERC20(cryptoDevTokenAddress).transferFrom(
                msg.sender,
                address(this),
                _CryptoDevTokenAmount
            );
            liquidity = ethReserves;
            _mint(msg.sender, liquidity);
        } else {
            ethReserves = ethReserves - msg.value;
            uint CryptoDevTokenToAdd = (msg.value * CryptoDevTokenReserves) /
                ethReserves;
            require(
                _CryptoDevTokenAmount >= CryptoDevTokenToAdd,
                "CryptoDev tokens sent are less than the minimum required"
            );

            ERC20(cryptoDevTokenAddress).transferFrom(
                msg.sender,
                address(this),
                CryptoDevTokenToAdd
            );
            liquidity = (msg.value * totalSupply()) / ethReserves;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    function removeLiquidity(uint256 _CryptoDevLPTokens)
        public
        returns (uint256, uint256)
    {
        require(
            _CryptoDevLPTokens > 0,
            "CryptoDev LP tokens should be greater than zero"
        );
        uint256 ethReserves = address(this).balance;
        uint256 CryptoDevLPTokenReserves = totalSupply();

        uint256 ethToReturn = (_CryptoDevLPTokens * ethReserves) /
            CryptoDevLPTokenReserves;
        uint256 cryptoDevTokensToReturn = (_CryptoDevLPTokens *
            getCryptoDevTokenReserves()) / CryptoDevLPTokenReserves;

        _burn(msg.sender, _CryptoDevLPTokens);

        payable(msg.sender).transfer(ethToReturn);

        ERC20(cryptoDevTokenAddress).transfer(
            msg.sender,
            cryptoDevTokensToReturn
        );

        return (ethToReturn, cryptoDevTokensToReturn);
    }

    function getAmountOfTokens(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(inputReserve > 0 && outputReserve > 0, "Invalid Reserves");

        //Charging 1% fee.
        //i.e inputAmountWithFee = inpuAmount - ((1*inputAmount)/100) = (inputAmount*99)/100
        uint256 inputAmountWithFee = inputAmount * 99;

        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputAmountWithFee + (inputReserve * 100);
        return numerator / denominator;
    }

    function ethToCryptoDevToken(uint _minTokensToSwap) public payable {
        uint256 inputAmount = msg.value;
        uint256 inputReserve = address(this).balance - msg.value;
        uint256 outputReserve = getCryptoDevTokenReserves();

        uint256 CryptoDevTokenBoughtAmount = getAmountOfTokens(
            inputAmount,
            inputReserve,
            outputReserve
        );
        require(
            CryptoDevTokenBoughtAmount >= _minTokensToSwap,
            "Insufficient Output Amount"
        );

        ERC20(cryptoDevTokenAddress).transfer(
            msg.sender,
            CryptoDevTokenBoughtAmount
        );
    }

    function cryptoDevTokenToEth(
        uint _cryptoDevTokensSold,
        uint256 _minEthToSwap
    ) public {
        uint256 inputAmount = _cryptoDevTokensSold;
        uint256 inputReserve = getCryptoDevTokenReserves();
        uint256 outputReserve = address(this).balance;

        uint256 EthBoughtAmount = getAmountOfTokens(
            inputAmount,
            inputReserve,
            outputReserve
        );
        require(EthBoughtAmount >= _minEthToSwap, "Insufficient Output Amount");

        ERC20(cryptoDevTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _cryptoDevTokensSold
        );
        payable(msg.sender).transfer(EthBoughtAmount);
    }
}

/*

Current gas price: 51801364070
Estimated gas: 2252442
Deployer balance:  4.797279202725600846
Deployment price:  0.11667956808855894
Exchange contract address is 0x3AF6371cD3f1477Bff743147355c0FF6dbdd3fB9

*/
