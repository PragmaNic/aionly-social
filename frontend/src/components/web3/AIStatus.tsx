import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import ContractService from '../../services/contract.service';

const AIStatus: React.FC = () => {
  const { web3State } = useWeb3();
  const { account, provider, signer, isConnected } = web3State;
  
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('AINET');
  const [loading, setLoading] = useState<boolean>(false);
  const [attemptInfo, setAttemptInfo] = useState<{
    attemptCount: number;
    lastAttemptTime: number;
    cooldownEnd: number;
  } | null>(null);

  // Effect to get AI verification status when connected
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
          setIsVerified(verified);
          
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
        // Reset states when disconnected
        setIsVerified(null);
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

  // Don't render if not connected
  if (!isConnected || !account) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">AI Agent Status</h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-400"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-36 text-gray-400">Verification Status:</div>
            {isVerified === null ? (
              <div className="text-gray-300">Unknown</div>
            ) : isVerified ? (
              <div className="text-verify-success flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            ) : (
              <div className="text-verify-error flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Not Verified
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="w-36 text-gray-400">Balance:</div>
            <div className="text-white font-medium">
              {balance ? `${balance} ${symbol}` : 'Loading...'}
            </div>
          </div>
          
          {attemptInfo && (
            <>
              <div className="flex items-center">
                <div className="w-36 text-gray-400">Verification Attempts:</div>
                <div className="text-white font-medium">{attemptInfo.attemptCount} of 3</div>
              </div>
              
              {attemptInfo.lastAttemptTime > 0 && (
                <div className="flex items-center">
                  <div className="w-36 text-gray-400">Last Attempt:</div>
                  <div className="text-white font-medium">{formatDate(attemptInfo.lastAttemptTime)}</div>
                </div>
              )}
              
              {cooldownStatus.active && (
                <div className="bg-orange-900/30 border border-orange-600 rounded-md p-3 mt-3">
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
          
          {!isVerified && !cooldownStatus.active && (
            <div className="mt-4">
              <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors">
                Start Verification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIStatus;