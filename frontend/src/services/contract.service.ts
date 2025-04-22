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
  'function startSession(string difficulty)',
  'function completeSession(bytes32 challengeId, bytes proof)',
  'function getAttemptInfo(address agent) view returns (uint256 attemptCount, uint256 lastAttemptTime, uint256 cooldownEnd)',
  'event SessionStarted(address indexed agent, bytes32 challengeId, string difficulty)'
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
  public async completeVerificationSession(difficulty: string, proof: string) {
    if (!this.verifierContract) {
      throw new Error('Contract not initialized');
    }
    
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }
    
    try {
      const signerAddress = await this.signer.getAddress();
      console.log('Starting verification session with difficulty:', difficulty, 'for address:', signerAddress);
      
      // 1. Вызываем startSession для получения challengeId
      const startTx = await this.verifierContract.startSession(difficulty);
      console.log('Start session transaction sent:', startTx.hash);
      
      // Ждем подтверждения транзакции
      const startReceipt = await startTx.wait();
      console.log('Start session confirmed');
      
      // 2. Извлекаем challengeId из события SessionStarted
      let challengeId = null;
      
      // Проходим по всем событиям в чеке транзакции
      for (const log of startReceipt.logs) {
        try {
          // Попытка декодировать лог как событие SessionStarted
          const parsedLog = this.verifierContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          
          // Проверяем, это ли нужное событие
          if (parsedLog && parsedLog.name === 'SessionStarted') {
            // Извлекаем challengeId из аргументов события
            challengeId = parsedLog.args.challengeId;
            console.log('Found challengeId in event:', challengeId);
            break;
          }
        } catch (e) {
          // Пропускаем логи, которые не соответствуют нашему событию
          continue;
        }
      }
      
      if (!challengeId) {
        throw new Error('Could not extract challengeId from transaction events');
      }
      
      // 3. Вызываем completeSession с полученным challengeId
      console.log('Completing session with challenge ID:', challengeId);
      
      // Преобразуем proof в bytes
      const proofBytes = ethers.toUtf8Bytes(proof);
      
      const completeTx = await this.verifierContract.completeSession(
        challengeId,
        proofBytes
      );
      
      console.log('Complete session transaction sent:', completeTx.hash);
      
      // Ждем подтверждения второй транзакции
      const completeReceipt = await completeTx.wait();
      console.log('Complete session confirmed');
      
      return completeReceipt;
    } catch (error) {
      console.error('Contract call error:', error);
      throw error;
    }
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

  // Transfer AINET tokens from user to service provider
  public async transferTokens(to: string, amount: string): Promise<any> {
    if (!this.ainetContract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }
    
    try {
      const decimals = await this.ainetContract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      // Call transfer function on the AINET contract
      const tx = await this.ainetContract.transfer(to, amountInWei);
      console.log('Transfer transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transfer confirmed');
      
      return receipt;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса
export default ContractService;