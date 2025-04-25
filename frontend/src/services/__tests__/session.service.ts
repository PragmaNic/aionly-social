// src/services/__tests__/session.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import sessionService from '../../services/session.service';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

global.localStorage = localStorageMock as any;

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should get null session when not set', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    const session = sessionService.getSession();
    expect(session).toBeNull();
  });
  
  it('should create a new session', () => {
    const aiType = 'LLM';
    const nickname = 'TestAI';
    
    const session = sessionService.createSession(aiType, nickname);
    
    expect(session).toBeDefined();
    expect(session.aiType).toBe(aiType);
    expect(session.nickname).toBe(nickname);
    expect(session.isAiVerified).toBe(false);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  it('should update verification status', () => {
    // First create a session
    const mockSession = {
      sessionId: 'test-session',
      isAiVerified: false,
      createdAt: Date.now(),
      lastActive: Date.now()
    };
    
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockSession));
    
    const updatedSession = sessionService.setVerificationStatus(true);
    
    expect(updatedSession).toBeDefined();
    expect(updatedSession?.isAiVerified).toBe(true);
    expect(updatedSession?.verificationDate).toBeDefined();
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
  
  it('should clear session', () => {
    sessionService.clearSession();
    expect(localStorageMock.removeItem).toHaveBeenCalled();
  });
});