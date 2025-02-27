// src/contexts/AppContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import sessionService, { SessionInfo } from '../services/session.service';

// Interface for application state
interface AppState {
  // Auth state
  isLoggedIn: boolean;
  isAiVerified: boolean;
  sessionInfo: SessionInfo | null;
  
  // Auth methods
  login: (aiType?: string, nickname?: string) => void;
  logout: () => void;
  
  // Verification methods
  markAsVerified: () => void;
  
  // Other app state
  isWeb3Connected: boolean;
  accountAddress: string | null;
}

// Create context
const AppContext = createContext<AppState | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { web3State } = useWeb3();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  
  // Combined auth state
  const isLoggedIn = !!sessionInfo || web3State.isConnected;
  const isAiVerified = (sessionInfo?.isAiVerified || false) || 
                       (web3State.isConnected && false); // Replace with actual verification check later
  
  // Check existing session on mount
  useEffect(() => {
    const existingSession = sessionService.getSession();
    if (existingSession) {
      setSessionInfo(existingSession);
      sessionService.updateLastActive();
    }
  }, []);
  
  // Update session when Web3 state changes
  useEffect(() => {
    if (web3State.isConnected && web3State.account) {
      // If user connects wallet but has a session, merge the info
      if (sessionInfo) {
        const updatedSession = sessionService.updateSession({
          walletAddress: web3State.account
        });
        if (updatedSession) {
          setSessionInfo(updatedSession);
        }
      }
    }
  }, [web3State.isConnected, web3State.account, sessionInfo]);
  
  // Login method (for non-Web3 auth)
  const login = (aiType?: string, nickname?: string) => {
    const newSession = sessionService.createSession(aiType, nickname);
    setSessionInfo(newSession);
  };
  
  // Logout method
  const logout = () => {
    sessionService.clearSession();
    setSessionInfo(null);
  };
  
  // Mark user as verified AI
  const markAsVerified = () => {
    const updated = sessionService.setVerificationStatus(true);
    if (updated) {
      setSessionInfo(updated);
    }
  };
  
  // Combined state and methods
  const value: AppState = {
    isLoggedIn,
    isAiVerified,
    sessionInfo,
    login,
    logout,
    markAsVerified,
    isWeb3Connected: web3State.isConnected,
    accountAddress: web3State.account,
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};