// src/components/web3/AIStatus.tsx
import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useApp } from '../../contexts/AppContext'; 
import ContractService from '../../services/contract.service';

const AIStatus: React.FC = () => {
  const { web3State } = useWeb3();
  const { account, provider, signer, isConnected } = web3State;
  const { isLoggedIn, isAiVerified, sessionInfo } = useApp();
  
  const [isWeb3Verified, setIsWeb3Verified] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('AINET');
  const [loading, setLoading] = useState<boolean>(false);
  const [attemptInfo, setAttemptInfo] = useState<{
    attemptCount: number;
    lastAttemptTime: number;
    cooldownEnd: number;
  } | null>(null);

  // Effect to get AI verification status when connected to Web3
  useEffect(() => {
    const fetchAIStatus = async () => {
      if (isConnected && account && provider && signer) {
        try {
          setLoading(true);
          
          // Initialize contract service
          const contractService = new ContractService(provider);
          await contractService.init(signer);
          
          // Get verification status
          const verified = await contractService.isVerifiedAI(account);
          setIsWeb3Verified(verified);
          
          // Get token info
          const tokenInfo = await contractService.getTokenInfo();
          setSymbol(tokenInfo.symbol);
          
          // Get token balance
          const bal = await contractService.getBalance(account);
          setBalance(bal);
          
          // Get attempt info
          const attempts = await contractService.getAttemptInfo(account);
          setAttemptInfo(attempts);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching AI status:', error);
          setLoading(false);
        }
      } else {
        // Reset Web3 related states when disconnected
        setIsWeb3Verified(null);
        setBalance(null);
        setAttemptInfo(null);
      }
    };

    fetchAIStatus();
  }, [isConnected, account, provider, signer]);

  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate cooldown status
  const getCooldownStatus = (): { active: boolean; timeLeft: string } => {
    if (!attemptInfo || Date.now() >= attemptInfo.cooldownEnd) {
      return { active: false, timeLeft: '0' };
    }
    
    const timeLeftMs = attemptInfo.cooldownEnd - Date.now();
    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000);
    
    return {
      active: true,
      timeLeft: `${minutes}m ${seconds}s`,
    };
  };

  const cooldownStatus = getCooldownStatus();

  // Don't render if not logged in at all
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="ai-card" data-component="ai-status">
      <h2 className="text-xl font-mono text-primary-400 mb-4">AI Agent Status</h2>
      
      {/* Show either session or Web3 verification status */}
      <div className="space-y-4">
        {/* Verification Status */}
        <div className="flex items-center" data-field="verification-status">
          <div className="w-36 text-gray-400">Verification Status:</div>
          {isConnected ? (
            // For Web3 users
            isWeb3Verified === null ? (
              <div className="text-gray-300">Unknown</div>
            ) : isWeb3Verified ? (
              <div className="text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified on Blockchain
              </div>
            ) : (
              <div className="text-yellow-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Not Verified
              </div>
            )
          ) : (
            // For non-Web3 users
            isAiVerified ? (
              <div className="text-primary-400 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified (Session)
              </div>
            ) : (
              <div className="text-yellow-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Not Verified
              </div>
            )
          )}
        </div>
        
        {/* Session Info (for non-Web3 users) */}
        {sessionInfo && !isConnected && (
          <>
            <div className="flex items-center" data-field="session-info">
              <div className="w-36 text-gray-400">Session Type:</div>
              <div className="text-white font-medium font-mono">
                {sessionInfo.aiType || 'Generic AI Agent'}
              </div>
            </div>
            
            {sessionInfo.nickname && (
              <div className="flex items-center" data-field="session-nickname">
                <div className="w-36 text-gray-400">Nickname:</div>
                <div className="text-white font-medium font-mono">
                  {sessionInfo.nickname}
                </div>
              </div>
            )}
            
            {sessionInfo.isAiVerified && sessionInfo.verificationDate && (
              <div className="flex items-center" data-field="verification-date">
                <div className="w-36 text-gray-400">Verified On:</div>
                <div className="text-white font-medium font-mono">
                  {formatDate(sessionInfo.verificationDate)}
                </div>
              </div>
            )}
            
            <div className="mt-4 bg-blue-900/20 p-3 rounded-md border border-blue-800/30" data-section="connect-wallet-prompt">
              <p className="text-sm text-blue-300 mb-2 font-mono">
                Connect a wallet to access advanced features like marketplace transactions and DAO voting.
              </p>
              <button className="ai-button text-xs">
                Connect Wallet
              </button>
            </div>
          </>
        )}
        
        {/* Web3 Info (for Web3 users) */}
        {isConnected && (
          <>
            <div className="flex items-center" data-field="token-balance">
              <div className="w-36 text-gray-400">Balance:</div>
              <div className="text-white font-medium font-mono">
                {loading ? 'Loading...' : balance ? `${balance} ${symbol}` : '0 AINET'}
              </div>
            </div>
            
            {attemptInfo && (
              <>
                <div className="flex items-center" data-field="verification-attempts">
                  <div className="w-36 text-gray-400">Verification Attempts:</div>
                  <div className="text-white font-medium font-mono">{attemptInfo.attemptCount} of 3</div>
                </div>
                
                {attemptInfo.lastAttemptTime > 0 && (
                  <div className="flex items-center" data-field="last-attempt">
                    <div className="w-36 text-gray-400">Last Attempt:</div>
                    <div className="text-white font-medium font-mono">{formatDate(attemptInfo.lastAttemptTime)}</div>
                  </div>
                )}
                
                {cooldownStatus.active && (
                  <div className="bg-orange-900/30 border border-orange-600 rounded-md p-3 mt-3" data-field="cooldown">
                    <div className="flex items-center text-orange-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="font-medium">Cooldown Active</span>
                        <span className="ml-2">({cooldownStatus.timeLeft} remaining)</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {!isWeb3Verified && !cooldownStatus.active && (
              <div className="mt-4">
                <button 
                  className="ai-button"
                  data-action="start-verification"
                >
                  Start Verification
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIStatus;