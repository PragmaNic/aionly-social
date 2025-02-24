import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { startSession, completeSession, generateProof, increaseTime } from "./helpers/verifier";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AIVerifier", function () {
    async function deployVerifierFixture() {
        const [owner, aiAgent1, aiAgent2] = await ethers.getSigners();
        
        // Deploy core contracts
        const AINET = await ethers.getContractFactory("AINET");
        const ainet = await AINET.deploy();
        
        const AIVerifier = await ethers.getContractFactory("AIVerifier");
        const verifier = await AIVerifier.deploy(await ainet.getAddress());

        // Configure difficulty parameters
        await verifier.setDifficultyParams(
            "easy",
            3,    // minTimeRequired (seconds)
            30,   // maxTimeAllowed (seconds)
            2     // minCheckpoints
        );
        
        // Give AIVerifier contract ownership of AINET (critical fix)
        await ainet.transferOwnership(await verifier.getAddress());

        return { ainet, verifier, owner, aiAgent1, aiAgent2 };
    }

    describe("Core Verification Flow", function () {
        it("Should maintain session state correctly", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            const { challengeId } = await startSession(verifier, aiAgent1);
            const session = await verifier.sessions(await aiAgent1.getAddress());
            
            expect(session.challengeId).to.equal(challengeId);
            expect(session.difficulty).to.equal("easy");
            expect(session.isComplete).to.be.false;
        });
        
        it("Should complete full verification process", async function () {
            const { verifier, aiAgent1, ainet } = await loadFixture(deployVerifierFixture);
            
            // Start verification session
            const { challengeId } = await startSession(verifier, aiAgent1);
            
            // Wait required time
            await increaseTime(4); // > minTimeRequired
            
            // Complete verification
            await completeSession(verifier, aiAgent1, challengeId);
            
            // Check AI is verified in AINET
            expect(await ainet.isVerifiedAI(await aiAgent1.getAddress())).to.be.true;
        });
    });

    describe("Time Constraints", function () {
        it("Should enforce minimum time requirement", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            const { challengeId } = await startSession(verifier, aiAgent1);
            
            // Try complete immediately without waiting
            // Extract events to check for VerificationFailed emission
            const tx = await verifier.connect(aiAgent1).completeSession(
                challengeId,
                await generateProof()
            );
            const receipt = await tx.wait();
            
            const failedEvent = receipt.logs.find(
                log => log.topics[0] === verifier.interface.getEvent('VerificationFailed').topicHash
            );
            
            expect(failedEvent).to.not.be.undefined;
            
            // The transaction succeeds but updates the attempts counter
            const [attempts,,] = await verifier.getAttemptInfo(await aiAgent1.getAddress());
            expect(attempts).to.be.gt(0);
        });

        it("Should enforce maximum time limit", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            const { challengeId } = await startSession(verifier, aiAgent1);
            
            await increaseTime(31); // > maxTimeAllowed
            
            // Extract events to check for VerificationFailed emission
            const tx = await verifier.connect(aiAgent1).completeSession(
                challengeId,
                await generateProof()
            );
            const receipt = await tx.wait();
            
            const failedEvent = receipt.logs.find(
                log => log.topics[0] === verifier.interface.getEvent('VerificationFailed').topicHash
            );
            
            expect(failedEvent).to.not.be.undefined;
        });
    });

    describe("Anti-Spam Protection", function () {
        it("Should track failed attempts", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            // Initial check
            const [initialAttempts,,] = await verifier.getAttemptInfo(await aiAgent1.getAddress());
            expect(initialAttempts).to.equal(0);
            
            // Make a failed attempt
            const { challengeId } = await startSession(verifier, aiAgent1);
            
            // Try to complete too quickly (should fail but transaction succeeds)
            await verifier.connect(aiAgent1).completeSession(
                challengeId,
                await generateProof()
            );
            
            // Check attempt was counted
            const [attempts,,] = await verifier.getAttemptInfo(await aiAgent1.getAddress());
            expect(attempts).to.equal(1);
        });

        it("Should enforce cooldown after max attempts", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            // Make max attempts (3)
            for (let i = 0; i < 3; i++) {
                const { challengeId } = await startSession(verifier, aiAgent1);
                
                // Try to complete too quickly (should fail but transaction succeeds)
                await verifier.connect(aiAgent1).completeSession(
                    challengeId,
                    await generateProof()
                );
            }
            
            // Try to start new session during cooldown
            await expect(
                verifier.connect(aiAgent1).startSession("easy")
            ).to.be.revertedWith("Address in cooldown");
            
            // Verify cooldown info
            const [attempts,, cooldownEnd] = await verifier.getAttemptInfo(await aiAgent1.getAddress());
            expect(attempts).to.equal(0); // Reset after cooldown activated
            expect(cooldownEnd).to.be.gt(0); // Cooldown timestamp set
        });
    });

    describe("Admin Controls", function () {
        it("Should allow owner to configure difficulty parameters", async function () {
            const { verifier, owner } = await loadFixture(deployVerifierFixture);
            
            await verifier.connect(owner).setDifficultyParams(
                "test",
                10,  // minTimeRequired
                100, // maxTimeAllowed
                4    // minCheckpoints
            );

            const params = await verifier.difficultyLevels("test");
            expect(params.minTimeRequired).to.equal(10);
            expect(params.maxTimeAllowed).to.equal(100);
            expect(params.minCheckpoints).to.equal(4);
            expect(params.isActive).to.be.true;
        });

        it("Should allow owner to update attempt limits", async function () {
            const { verifier, owner } = await loadFixture(deployVerifierFixture);
            
            const newMaxAttempts = 5;
            const newCooldown = 3600; // 1 hour
            
            await verifier.connect(owner).setMaxAttempts(newMaxAttempts);
            await verifier.connect(owner).setCooldownPeriod(newCooldown);
            
            expect(await verifier.maxAttempts()).to.equal(newMaxAttempts);
            expect(await verifier.cooldownPeriod()).to.equal(newCooldown);
        });
    });

    describe("Emergency Controls", function () {
        it("Should allow owner to pause verification", async function () {
            const { verifier, owner, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            await verifier.connect(owner).pause();
            
            await expect(
                verifier.connect(aiAgent1).startSession("easy")
            ).to.be.revertedWithCustomError(verifier, "EnforcedPause");
        });

        it("Should prevent non-owners from pausing", async function () {
            const { verifier, aiAgent1 } = await loadFixture(deployVerifierFixture);
            
            await expect(
                verifier.connect(aiAgent1).pause()
            ).to.be.revertedWithCustomError(verifier, "OwnableUnauthorizedAccount");
        });
    });
});