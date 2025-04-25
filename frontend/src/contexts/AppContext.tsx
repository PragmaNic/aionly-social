// src/contexts/AppContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWeb3 } from './Web3Context';
import sessionService, { SessionInfo } from '../services/session.service';
import axios from 'axios';

// API URL for backend services
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

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
  
  // Walletless API
  apiToken: string | null;
  aicBalance: number | null;
  
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
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [aicBalance, setAicBalance] = useState<number | null>(null);
  
  // Combined auth state
  const isLoggedIn = !!sessionInfo || web3State.isConnected || !!apiToken;
  const isAiVerified = (sessionInfo?.isAiVerified || false) || 
                       (web3State.isConnected && false) || // Replace with actual verification check later
                       !!apiToken; // If we have API token, we're verified
  
  // Check existing session on mount
  useEffect(() => {
    // Check for session-based authentication
    const existingSession = sessionService.getSession();
    if (existingSession) {
      setSessionInfo(existingSession);
      sessionService.updateLastActive();
    }
    
    // Check for JWT token (API-based auth)
    const token = localStorage.getItem('ai_jwt');
    if (token) {
      setApiToken(token);
      
      // Configure axios to use token for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get AIC balance if token exists
      fetchAICBalance(token);
    }
  }, []);
  
  // Fetch AIC balance from API
  const fetchAICBalance = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/ledger/balance`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success && response.data.data) {
        setAicBalance(response.data.data.balance);
      }
    } catch (error) {
      console.error('Error fetching AIC balance:', error);
    }
  };
  
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
    // Create or update session info
    const newSession = sessionService.createSession(aiType, nickname);
    setSessionInfo(newSession);
    
    // Refresh AIC balance if we have an API token
    if (apiToken) {
      fetchAICBalance(apiToken);
    }
  };
  
  // Logout method
  const logout = () => {
    // Clear session-based auth
    sessionService.clearSession();
    setSessionInfo(null);
    
    // Clear API-based auth
    localStorage.removeItem('ai_jwt');
    setApiToken(null);
    setAicBalance(null);
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  };
  
  // Mark user as verified AI
  const markAsVerified = () => {
    // Update session-based verification
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
    apiToken,
    aicBalance,
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