// src/services/__tests__/api.service.test.ts
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import axios from 'axios';
import apiService from '../api.service';

// Mock axios for API call testing
vi.mock('axios');

describe('API Service', () => {
  // Setup mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  };

  // Replace global localStorage with mock
  global.localStorage = localStorageMock as any;

  // Clear mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage.getItem to simulate no token by default
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should initialize without token', () => {
    // Since localStorage.getItem is mocked, we expect no token
    expect(apiService['token']).toBeNull();
    // Check that Authorization header is not set
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  test('should set token correctly', () => {
    const token = 'test-jwt-token';
    apiService.setToken(token);
    
    // Check that token is saved in property and localStorage
    expect(apiService['token']).toBe(token);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('ai_jwt', token);
    // Check that Authorization header is set correctly
    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${token}`);
  });

  test('should clear token correctly', () => {
    // Set a token
    apiService.setToken('test-token');
    // Clear the token
    apiService.clearToken();
    
    // Check that token is removed from property and localStorage
    expect(apiService['token']).toBeNull();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('ai_jwt');
    // Check that Authorization header is removed
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined();
  });

  test('should register an AI agent successfully', async () => {
    // Prepare registration data
    const registerData = {
      handle: 'TestAI',
      metadata: {
        aiType: 'LLM',
        capabilities: ['text_generation'],
        version: '1.0'
      }
    };

    // Mock axios response
    const mockResponse = {
      data: {
        success: true,
        data: {
          agentId: 'test-agent-id',
          token: 'test-token',
          nextStep: 'captcha'
        }
      }
    };
    
    // Use vi.fn() to create a mock function
    vi.spyOn(axios, 'post').mockImplementation(() => Promise.resolve(mockResponse));

    // Call the registration method
    const result = await apiService.register(registerData);

    // Check that axios.post was called with the right parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      registerData
    );

    // Check the result
    expect(result).toEqual(mockResponse.data);
    expect(result.success).toBe(true);
    expect(result.data?.agentId).toBe('test-agent-id');
  });

  test('should handle registration error correctly', async () => {
    // Prepare registration data
    const registerData = {
      handle: 'InvalidAI',
      metadata: {}
    };

    // Mock axios error
    const errorMessage = 'Registration failed';
    vi.spyOn(axios, 'post').mockImplementation(() => Promise.reject(new Error(errorMessage)));

    // Call the registration method
    const result = await apiService.register(registerData);

    // Check the result
    expect(result.success).toBe(false);
    expect(result.error).toBe(errorMessage);
  });

  test('should authorize agent after ML-Captcha verification', async () => {
    // Prepare authorization data
    const authorizeData = {
      agentId: 'test-agent-id',
      captchaToken: 'valid-captcha-token'
    };

    // Mock axios response
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'authorized-jwt-token',
          agentId: 'test-agent-id',
          verified: true,
          aicBalance: 50
        }
      }
    };
    
    vi.spyOn(axios, 'post').mockImplementation(() => Promise.resolve(mockResponse));

    // Call the authorization method
    const result = await apiService.authorize(authorizeData);

    // Check that axios.post was called with the right parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/auth/authorize'),
      authorizeData
    );

    // Check the result
    expect(result).toEqual(mockResponse.data);
    expect(result.success).toBe(true);
    
    // Check that token was saved
    expect(apiService['token']).toBe(mockResponse.data.data.token);
  });

  test('should get AIC balance when authenticated', async () => {
    // Set a token
    apiService.setToken('test-token');

    // Mock axios response
    const mockResponse = {
      data: {
        success: true,
        data: {
          agentId: 'test-agent-id',
          balance: 50,
          lastUpdated: Date.now()
        }
      }
    };
    
    vi.spyOn(axios, 'get').mockImplementation(() => Promise.resolve(mockResponse));

    // Call the balance method
    const result = await apiService.getAICBalance();

    // Check that axios.get was called with the right parameters
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/ledger/balance')
    );

    // Check the result
    expect(result).toEqual(mockResponse.data);
    expect(result.success).toBe(true);
    expect(result.data?.balance).toBe(50);
  });

  test('should fail to get AIC balance when not authenticated', async () => {
    // Ensure token is not set
    apiService.clearToken();

    // Call the balance method
    const result = await apiService.getAICBalance();

    // Check that axios.get was not called
    expect(axios.get).not.toHaveBeenCalled();

    // Check the result
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });

  test('should migrate to blockchain successfully', async () => {
    // Set a token
    apiService.setToken('test-token');

    // Prepare wallet address
    const walletAddress = '0x1234567890123456789012345678901234567890';

    // Mock axios response
    const mockResponse = {
      data: {
        success: true,
        data: {
          merkleProof: 'valid-merkle-proof',
          amount: 50
        }
      }
    };
    
    vi.spyOn(axios, 'post').mockImplementation(() => Promise.resolve(mockResponse));

    // Call the migration method
    const result = await apiService.migrateToBlockchain(walletAddress);

    // Check that axios.post was called with the right parameters
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/migration/to-chain'),
      { walletAddress }
    );

    // Check the result
    expect(result).toEqual(mockResponse.data);
    expect(result.success).toBe(true);
    expect(result.data?.merkleProof).toBe('valid-merkle-proof');
    expect(result.data?.amount).toBe(50);
  });

  test('should fail to migrate to blockchain when not authenticated', async () => {
    // Ensure token is not set
    apiService.clearToken();

    // Call the migration method
    const result = await apiService.migrateToBlockchain('0x1234');

    // Check that axios.post was not called
    expect(axios.post).not.toHaveBeenCalled();

    // Check the result
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not authenticated');
  });
});