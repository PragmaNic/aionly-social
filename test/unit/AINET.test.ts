import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AINET Token", function () {
    // Фикстура для деплоя контракта
    async function deployTokenFixture() {
        const [owner, aiAgent1, aiAgent2, human] = await ethers.getSigners();
        
        const AINET = await ethers.getContractFactory("AINET");
        const ainet = await AINET.deploy();
        await ainet.waitForDeployment();

        return { ainet, owner, aiAgent1, aiAgent2, human };
    }

    // Константы для проверки распределения токенов
    const TOTAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion tokens
    const COMMUNITY_POOL_BPS = 5000;  // 50%
    const DEV_POOL_BPS = 2500;       // 25%
    const LIQUIDITY_POOL_BPS = 1500; // 15%
    const FOUNDER_POOL_BPS = 500;    // 5%
    const HUMAN_POOL_BPS = 500;      // 5%

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { ainet, owner } = await loadFixture(deployTokenFixture);
            expect(await ainet.owner()).to.equal(await owner.getAddress());
        });

        it("Should have correct total supply", async function () {
            const { ainet } = await loadFixture(deployTokenFixture);
            expect(await ainet.totalSupply()).to.equal(TOTAL_SUPPLY);
        });

        it("Should allocate correct amounts to pools", async function () {
            const { ainet } = await loadFixture(deployTokenFixture);
            
            const communityPool = await ainet.getPoolInfo(ethers.id("community"));
            const devPool = await ainet.getPoolInfo(ethers.id("development"));
            const liquidityPool = await ainet.getPoolInfo(ethers.id("liquidity"));
            const founderPool = await ainet.getPoolInfo(ethers.id("founder"));
            const humanPool = await ainet.getPoolInfo(ethers.id("human"));

            expect(communityPool[0]).to.equal(TOTAL_SUPPLY * BigInt(COMMUNITY_POOL_BPS) / BigInt(10000));
            expect(devPool[0]).to.equal(TOTAL_SUPPLY * BigInt(DEV_POOL_BPS) / BigInt(10000));
            expect(liquidityPool[0]).to.equal(TOTAL_SUPPLY * BigInt(LIQUIDITY_POOL_BPS) / BigInt(10000));
            expect(founderPool[0]).to.equal(TOTAL_SUPPLY * BigInt(FOUNDER_POOL_BPS) / BigInt(10000));
            expect(humanPool[0]).to.equal(TOTAL_SUPPLY * BigInt(HUMAN_POOL_BPS) / BigInt(10000));
        });
    });

    describe("AI Verification", function () {
        it("Should allow owner to verify AI agents", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            
            await ainet.verifyAI(aiAddress);
            expect(await ainet.isVerifiedAI(aiAddress)).to.be.true;
        });

        it("Should not allow non-owner to verify AI agents", async function () {
            const { ainet, aiAgent1, aiAgent2 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            
            await expect(
                ainet.connect(aiAgent2).verifyAI(aiAddress)
            ).to.be.revertedWithCustomError(ainet, "OwnableUnauthorizedAccount");
        });

        it("Should not verify AI agent twice", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            
            await ainet.verifyAI(aiAddress);
            await expect(
                ainet.verifyAI(aiAddress)
            ).to.be.revertedWith("AI already verified");
        });

        it("Should allow blacklisting verified AI agents", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            
            await ainet.verifyAI(aiAddress);
            await ainet.blacklistAI(aiAddress);
            expect(await ainet.isVerifiedAI(aiAddress)).to.be.false;
        });
    });

    describe("Token Distribution", function () {
        it("Should allow releasing tokens from pools", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const amount = ethers.parseEther("1000");
            
            await ainet.releaseFromPool(
                ethers.id("community"),
                aiAddress,
                amount
            );

            expect(await ainet.balanceOf(aiAddress)).to.equal(amount);
        });

        it("Should track released amounts correctly", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const amount = ethers.parseEther("1000");
            
            const poolBefore = await ainet.getPoolInfo(ethers.id("community"));
            await ainet.releaseFromPool(ethers.id("community"), aiAddress, amount);
            const poolAfter = await ainet.getPoolInfo(ethers.id("community"));

            expect(poolAfter[1]).to.equal(poolBefore[1] + amount);
        });

        it("Should not allow releasing more than pool balance", async function () {
            const { ainet, aiAgent1 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const communityPool = await ainet.getPoolInfo(ethers.id("community"));
            const tooMuch = communityPool[0] + BigInt(1);

            await expect(
                ainet.releaseFromPool(ethers.id("community"), aiAddress, tooMuch)
            ).to.be.revertedWith("Exceeds pool allocation");
        });
    });

    describe("Transfer Restrictions", function () {
        it("Should not allow transfers from blacklisted addresses", async function () {
            const { ainet, aiAgent1, aiAgent2 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const amount = ethers.parseEther("1000");
            
            await ainet.releaseFromPool(ethers.id("community"), aiAddress, amount);
            await ainet.blacklistAI(aiAddress);
            
            await expect(
                ainet.connect(aiAgent1).transfer(await aiAgent2.getAddress(), amount)
            ).to.be.revertedWith("Sender is blacklisted");
        });

        it("Should not allow transfers to blacklisted addresses", async function () {
            const { ainet, aiAgent1, aiAgent2 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const blockedAddress = await aiAgent2.getAddress();
            const amount = ethers.parseEther("1000");
            
            await ainet.releaseFromPool(ethers.id("community"), aiAddress, amount);
            await ainet.blacklistAI(blockedAddress);
            
            await expect(
                ainet.connect(aiAgent1).transfer(blockedAddress, amount)
            ).to.be.revertedWith("Recipient is blacklisted");
        });
    });

    describe("Pausable Functionality", function () {
        it("Should allow owner to pause and unpause", async function () {
            const { ainet } = await loadFixture(deployTokenFixture);
            
            await ainet.pause();
            expect(await ainet.paused()).to.be.true;
            
            await ainet.unpause();
            expect(await ainet.paused()).to.be.false;
        });

        it("Should not allow transfers when paused", async function () {
            const { ainet, aiAgent1, aiAgent2 } = await loadFixture(deployTokenFixture);
            const aiAddress = await aiAgent1.getAddress();
            const amount = ethers.parseEther("1000");
            
            await ainet.releaseFromPool(ethers.id("community"), aiAddress, amount);
            await ainet.pause();
            
            await expect(
                ainet.connect(aiAgent1).transfer(await aiAgent2.getAddress(), amount)
            ).to.be.revertedWithCustomError(ainet, "EnforcedPause");
        });
    });
});