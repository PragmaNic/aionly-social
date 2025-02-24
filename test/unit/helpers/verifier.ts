import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Generate a random proof for verification testing
 */
export async function generateProof(): Promise<string> {
    return ethers.hexlify(ethers.randomBytes(32));
}

/**
 * Start a verification session
 * @param verifier The AIVerifier contract instance
 * @param agent The signer initiating the session
 * @param difficulty The difficulty level to use
 */
export async function startSession(
    verifier: any, 
    agent: HardhatEthersSigner, 
    difficulty: string = "easy"
): Promise<{challengeId: string, startTime: number}> {
    // Start the session
    const tx = await verifier.connect(agent).startSession(difficulty);
    const receipt = await tx.wait();
    
    // Extract session data
    const session = await verifier.sessions(await agent.getAddress());
    
    return {
        challengeId: session.challengeId, 
        startTime: Number(session.startTime)
    };
}

/**
 * Complete a verification session
 * @param verifier The AIVerifier contract instance
 * @param agent The signer completing the session
 * @param challengeId The challenge ID to complete
 */
export async function completeSession(
    verifier: any,
    agent: HardhatEthersSigner,
    challengeId: string
): Promise<boolean> {
    const proof = await generateProof();
    
    const tx = await verifier.connect(agent).completeSession(
        challengeId,
        proof
    );
    
    const receipt = await tx.wait();
    return receipt.status === 1;
}

/**
 * Increase the blockchain time
 * @param seconds Number of seconds to increase
 */
export async function increaseTime(seconds: number): Promise<void> {
    await time.increase(seconds);
}