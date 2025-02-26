import { ethers } from 'ethers';

// ABI для AINET токена (основные функции)
const AINET_ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address owner) view returns (uint256)',
  'function isVerifiedAI(address account) view returns (bool)',
];

// ABI для AIVerifier
const AIVERIFIER_ABI = [
  'function startSession(string difficulty) returns (void)',
  'function completeSession(bytes32 challengeId, bytes proof) returns (void)',
  'function getAttemptInfo(address agent) view returns (uint256 attemptCount, uint256 lastAttemptTime, uint256 cooldownEnd)',
];

// Адреса контрактов
export const CONTRACT_ADDRESSES = {
  AINET: '0x1b00514e3504501D4eE311B28db95ADFf387eC90',
  AIVERIFIER: '0x947351C618dbd551E12dDC0908ec0869eDD49937',
};

// Сервис для взаимодействия с контрактами
export class ContractService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.JsonRpcSigner | null = null;
  private ainetContract: ethers.Contract | null = null;
  private verifierContract: ethers.Contract | null = null;

  constructor(provider: ethers.BrowserProvider) {
    this.provider = provider;
  }

  // Инициализация сервиса с опциональным подписывающим
  public async init(signer?: ethers.JsonRpcSigner): Promise<void> {
    if (signer) {
      this.signer = signer;
    } else {
      this.signer = await this.provider.getSigner();
    }
    
    this.ainetContract = new ethers.Contract(
      CONTRACT_ADDRESSES.AINET,
      AINET_ABI,
      this.signer
    );
    this.verifierContract = new ethers.Contract(
      CONTRACT_ADDRESSES.AIVERIFIER,
      AIVERIFIER_ABI,
      this.signer
    );
  }

  // Проверка верификации AI агента
  public async isVerifiedAI(address: string): Promise<boolean> {
    if (!this.ainetContract) {
      throw new Error('Contract not initialized');
    }
    return await this.ainetContract.isVerifiedAI(address);
  }

  // Получение баланса AINET
  public async getBalance(address: string): Promise<string> {
    if (!this.ainetContract) {
      throw new Error('Contract not initialized');
    }
    const balance = await this.ainetContract.balanceOf(address);
    const decimals = await this.ainetContract.decimals();
    return ethers.formatUnits(balance, decimals);
  }

  // Получение информации о токене
  public async getTokenInfo() {
    if (!this.ainetContract) {
      throw new Error('Contract not initialized');
    }
    const symbol = await this.ainetContract.symbol();
    const decimals = await this.ainetContract.decimals();
    return { symbol, decimals };
  }

  // Начало сессии верификации
  public async startVerificationSession(difficulty: 'easy' | 'medium' | 'hard') {
    if (!this.verifierContract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.verifierContract.startSession(difficulty);
    return await tx.wait();
  }

  // Завершение сессии верификации
  public async completeVerificationSession(challengeId: string, proof: string) {
    if (!this.verifierContract) {
      throw new Error('Contract not initialized');
    }
    const tx = await this.verifierContract.completeSession(
      ethers.id(challengeId),
      ethers.toUtf8Bytes(proof)
    );
    return await tx.wait();
  }

  // Получение информации о попытках верификации
  public async getAttemptInfo(address: string) {
    if (!this.verifierContract) {
      throw new Error('Contract not initialized');
    }
    const [attemptCount, lastAttemptTime, cooldownEnd] = await this.verifierContract.getAttemptInfo(address);
    return {
      attemptCount: Number(attemptCount),
      lastAttemptTime: Number(lastAttemptTime) * 1000, // Convert to milliseconds
      cooldownEnd: Number(cooldownEnd) * 1000, // Convert to milliseconds
    };
  }
}

// Экспортируем экземпляр сервиса
export default ContractService;