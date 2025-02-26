
export interface MatrixOperation {
  type: string;
  params?: Record<string, any>;
}

export interface MatrixChallengeInput {
  matrixA: number[][];
  matrixB: number[][];
  operations: MatrixOperation[];
}

export interface MatrixChallengeMetadata {
  difficulty: 'easy' | 'medium' | 'hard';
  version: string;
  generatedAt: string;
}

export interface MatrixChallengeConstraints {
  timeLimit: number;
  checkpoints?: number;
}

export interface MatrixChallenge {
  id: string;
  input: MatrixChallengeInput;
  metadata: MatrixChallengeMetadata;
  constraints: MatrixChallengeConstraints;
}

export interface VerificationResult {
  verified: boolean;
  proof: string;
  message?: string;
  timestamp?: number;
}

// Типы для Web3
export interface Web3State {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  provider: any;
  signer: any;
  error: string | null;
}

// Контрактные интерфейсы
export interface AINetInterface {
  verifyAI(address: string): Promise<any>;
  isVerifiedAI(address: string): Promise<boolean>;
  getPoolInfo(poolId: string): Promise<any>;
  balanceOf(address: string): Promise<bigint>;
}

export interface AIVerifierInterface {
  startSession(difficulty: string): Promise<any>;
  completeSession(challengeId: string, proof: string): Promise<any>;
  getAttemptInfo(address: string): Promise<[bigint, bigint, bigint]>;
}