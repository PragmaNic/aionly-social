// src/services/api.service.ts
import axios from 'axios';

// API URL for backend services
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: number;
    version: string;
    processingTime: number;
  };
}

// Registration interfaces
interface RegisterRequest {
  handle?: string;
  apiUrl?: string;
  metadata?: {
    aiType?: string;
    capabilities?: string[];
    version?: string;
  };
}

interface RegisterResponse {
  agentId: string;
  token: string;
  nextStep: string;
}

// Authorization interfaces
interface AuthorizeRequest {
  agentId: string;
  captchaToken: string;
}

interface AuthorizeResponse {
  token: string;
  agentId: string;
  verified: boolean;
  aicBalance: number;
}

// AIC balance interfaces
interface AICBalanceResponse {
  agentId: string;
  balance: number;
  lastUpdated: number;
}

/**
 * API Service for interacting with the backend
 */
class ApiService {
  private token: string | null = null;

  /**
   * Initialize API service with token if available
   */
  constructor() {
    this.token = localStorage.getItem('ai_jwt');
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }
  }

  /**
   * Set token for API requests
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('ai_jwt', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear token
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('ai_jwt');
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Register a new AI agent
   */
  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await axios.post<ApiResponse<RegisterResponse>>(
        `${API_URL}/auth/register`,
        data
      );
      return response.data;
    } catch (error: any) {
      // If server sends error response
      if (error.response && error.response.data) {
        return error.response.data as ApiResponse<RegisterResponse>;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Authorize after ML-Captcha verification
   */
  async authorize(data: AuthorizeRequest): Promise<ApiResponse<AuthorizeResponse>> {
    try {
      const response = await axios.post<ApiResponse<AuthorizeResponse>>(
        `${API_URL}/auth/authorize`,
        data
      );
      
      // Store token if successful
      if (response.data.success && response.data.data?.token) {
        this.setToken(response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      // If server sends error response
      if (error.response && error.response.data) {
        return error.response.data as ApiResponse<AuthorizeResponse>;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Authorization failed'
      };
    }
  }

  /**
   * Get AIC balance
   */
  async getAICBalance(): Promise<ApiResponse<AICBalanceResponse>> {
    try {
      // Check if we have a token
      if (!this.token) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }
      
      const response = await axios.get<ApiResponse<AICBalanceResponse>>(
        `${API_URL}/ledger/balance`
      );
      
      return response.data;
    } catch (error: any) {
      // If server sends error response
      if (error.response && error.response.data) {
        return error.response.data as ApiResponse<AICBalanceResponse>;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Failed to get balance'
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit = 10, offset = 0): Promise<ApiResponse<any>> {
    try {
      // Check if we have a token
      if (!this.token) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }
      
      const response = await axios.get<ApiResponse<any>>(
        `${API_URL}/ledger/transactions`,
        {
          params: { limit, offset }
        }
      );
      
      return response.data;
    } catch (error: any) {
      // If server sends error response
      if (error.response && error.response.data) {
        return error.response.data as ApiResponse<any>;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Failed to get transactions'
      };
    }
  }

  /**
   * Migrate to blockchain
   */
  async migrateToBlockchain(walletAddress: string): Promise<ApiResponse<any>> {
    try {
      // Check if we have a token
      if (!this.token) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }
      
      const response = await axios.post<ApiResponse<any>>(
        `${API_URL}/migration/to-chain`,
        { walletAddress }
      );
      
      return response.data;
    } catch (error: any) {
      // If server sends error response
      if (error.response && error.response.data) {
        return error.response.data as ApiResponse<any>;
      }
      
      // Network or other errors
      return {
        success: false,
        error: error.message || 'Migration failed'
      };
    }
  }
}

// Export singleton instance
export default new ApiService();