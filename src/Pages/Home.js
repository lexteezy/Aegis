import React from "react";
import { ethers, BigNumber } from "ethers";
import AegisStakingABI from "../ABI/AegisStakingABI.json"
import AegisTokenABI from "../ABI/AegisTokenABI.json";
import { useState, useEffect } from "react";
import Axios from "axios";

class Home extends React.Component {

    constructor(props) {
        super(props);

        // const ethProvider = new ethers.providers.getDefaultProvider("mainnet");
        const ethProvider = new ethers.providers.getDefaultProvider("https://eth-mainnet.public.blastapi.io	");

        const aegisStakingCA = "0xE7d9747404532A1AEFd1Bf9D878aF1E859a51544";
        const aegisTokenCA = "0x3e4c87bf57d48935d1643A7b8a3383B928B040de";

        const aegisStakingContract = new ethers.Contract(
            aegisStakingCA,
            AegisStakingABI,
            ethProvider
        );

        const aegisTokenContract = new ethers.Contract(
            aegisTokenCA,
            AegisTokenABI,
            ethProvider
        );

        this.state = {
            ethProvider,
            provider : null,
            aegisStakingCA,
            aegisTokenCA,
            aegisTokenContract,
            aegisStakingContract,
            aegisStakingInteractionContract : null,
            aegisTokenInteractionContract: null,
            signerAddress: "",
            signerBalance: 0,
            signer: null,
            teamAStakedBalance: 0,
            teamBStakedBalance: 0,
            teamAOdds: 0,
            teamBOdds: 0,
            teamAPotentialWinning: 0,
            teamBPotentialWinning: 0
        };
        this.start();
    }

    async start() {
        await this.connectWallet();

        // await this.enableStaking(); //Apply to button
        // await this.getStakedBalance(); //Apply to button
        await this.getTeamOdds();
        // await this.getPotentialWinnings();

        console.log('state', this.state);
    }

    connectWallet = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", null);

        const signer = await provider.getSigner();
        const signerAddress = await signer.getAddress();
        const signerBalance = await this.getAccountBalance(signerAddress);
        const aegisTokenInteractionContract = new ethers.Contract(
            this.state.aegisTokenCA,
            AegisTokenABI,
            signer
        );
        const aegisStakingInteractionContract = new ethers.Contract(
            this.state.aegisStakingCA,
            AegisStakingABI,
            signer
        );
        this.setState({ 
            provider,
            signer,
            signerAddress,
            signerBalance,
            aegisTokenInteractionContract,
            aegisStakingInteractionContract
        });
    }

    async getAccountBalance(address) {
        return ethers.utils.formatUnits(await this.state.aegisTokenContract.balanceOf(address));
    }

    async enableStaking() {
        const provider = this.state.provider;
		await provider.send("eth_requestAccounts", []);
        const signer = this.state.signer;
        const chainId = await signer.getChainId();
        if(chainId != 1) {
            // pop up error if network not ethereum
            // ALERT PLEASE SWITCH TO ETHEREUM NETWORK TO CONTINUE
        } else {
            const spenderAddress = this.state.aegisStakingCA;
            const amount = "9999999999999999999999999999";
            this.state.aegisTokenInteractionContract.approve(spenderAddress, amount);
        }
    }

    async stakeTeam() {
        const provider = this.state.provider;
		await provider.send("eth_requestAccounts", []);
        const signer = this.state.signer;
        const chainId = await signer.getChainId();
        if(chainId != 1) {
            // pop up error if network not ethereum
            // ALERT PLEASE SWITCH TO ETHEREUM NETWORK TO CONTINUE
        } else {
            let stakeAmount = 100000; //  amount to bet from input
            let poolId = 0  // 1 or 2 selected team from input
            this.state.aegisStakingInteractionContract.stake(poolId, stakeAmount);
        }
    }

    async getStakedBalance() {
        const teamAStakedBalance = this.state.aegisStakingContract.getUserStakedTokens(this.state.signerAddress,0);
        const teamBStakedBalance = this.state.aegisStakingContract.getUserStakedTokens(this.state.signerAddress,1);
        // const teamAStakedBalance = 2000;
        // const teamBStakedBalance = 3000;

        this.setState({
            teamAStakedBalance,
            teamBStakedBalance
        });
    }

    async getTeamOdds() {
        const poolAStakedTokens = ethers.utils.formatUnits(await this.state.aegisStakingContract.getPoolAStakedTokens());
        const poolBStakedTokens = ethers.utils.formatUnits(await this.state.aegisStakingContract.getPoolBStakedTokens());
        // const poolAStakedTokens = 22;
        // const poolBStakedTokens = 33;

        const teamAOdds = ((poolAStakedTokens/poolBStakedTokens) + 1).toFixed(2);
        const teamBOdds = ((poolBStakedTokens/poolAStakedTokens) + 1).toFixed(2);

        this.setState({
            teamAOdds,
            teamBOdds
        });
    }

    async getPotentialWinnings() {
        const teamAStakedBalance = this.state.teamAStakedBalance;
        const teamBStakedBalance = this.state.teamBStakedBalance;

        const teamAOdds = this.state.teamAOdds;
        const teamBOdds = this.state.teamBOdds;

        const teamAPotentialWinning = (teamAStakedBalance * teamAOdds).toFixed(2);
        const teamBPotentialWinning = (teamBStakedBalance * teamBOdds).toFixed(2);

        console.log(teamAPotentialWinning);
        console.log(teamBPotentialWinning)

        this.setState({
            teamAPotentialWinning,
            teamBPotentialWinning
        });
    }

    async claimPrize() {
        const provider = this.state.provider;
		await provider.send("eth_requestAccounts", []);
        const signer = this.state.signer;
        const chainId = await signer.getChainId();
        if(chainId != 1) {
            // pop up error if network not ethereum
            // ALERT PLEASE SWITCH TO ETHEREUM NETWORK TO CONTINUE
        }
        this.state.aegisStakingInteractionContract.claimPrize();
    }

    async unstake() {
        const provider = this.state.provider;
		await provider.send("eth_requestAccounts", []);
        const signer = this.state.signer;
        const chainId = await signer.getChainId();
        if(chainId != 1) {
            // pop up error if network not ethereum
            // ALERT PLEASE SWITCH TO ETHEREUM NETWORK TO CONTINUE
        } else {
            let unstakeAmount = 100000; //  amount to bet from input
            let poolId = 0  // 1 or 2 selected team from input
            this.state.aegisStakingInteractionContract.unstake(poolId, unstakeAmount);
        }
    }

    render() {
        return (
            <div>

            </div>
        )
    }

}

export default Home;