// src/services/__tests__/contract.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import ContractService, { CONTRACT_ADDRESSES } from '../../services/contract.service';

// Mock the ethers module
vi.mock('ethers', () => {
  return {
    Contract: vi.fn().mockImplementation(() => ({
      symbol: vi.fn().mockResolvedValue('AINET'),
      decimals: vi.fn().mockResolvedValue(18),
      balanceOf: vi.fn().mockResolvedValue(1000n),
      isVerifiedAI: vi.fn().mockResolvedValue(true)
    })),
    BrowserProvider: vi.fn().mockImplementation(() => ({
      getSigner: vi.fn().mockResolvedValue({
        getAddress: vi.fn().mockResolvedValue('0x1234567890123456789012345678901234567890')
      })
    })),
    formatUnits: vi.fn().mockReturnValue('1.0')
  };
});

describe('ContractService', () => {
  it('should have contract addresses defined', () => {
    expect(CONTRACT_ADDRESSES.AINET).toBeDefined();
    expect(CONTRACT_ADDRESSES.AIVERIFIER).toBeDefined();
  });
  
  it('should create an instance', () => {
    const mockProvider = { provider: 'mock' };
    const service = new ContractService(mockProvider as any);
    expect(service).toBeDefined();
  });
});