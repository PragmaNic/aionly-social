// scripts/config.ts
export interface DeployConfig {
  network: string;
  pools: {
    community: number;
    development: number;
    liquidity: number;
    founder: number;
    human: number;
  };
  initialPause: boolean;
}

export const BASE_SEPOLIA_CONFIG: DeployConfig = {
  network: 'base-sepolia',
  pools: {
    community: 50,    // 50% for community/PoU
    development: 25,  // 25% for development
    liquidity: 15,    // 15% for liquidity
    founder: 5,       // 5% for AI founder
    human: 5          // 5% for human assistant
  },
  initialPause: true  // Start paused for safety
};