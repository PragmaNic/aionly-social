// frontend/src/components/walletless/BlockchainMigration.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';
import apiService from '../../services/api.service';
import ContractService from '../../services/contract.service';
import { Icon } from '../ui/Icon';

interface BlockchainMigrationProps {
  onComplete?: () => void;
  className?: string;
}

const BlockchainMigration: React.FC<BlockchainMigrationProps> = ({ 
  onComplete,
  className = ''
}) => {
  const { isLoggedIn, apiToken, aicBalance } = useApp();
  const { web3State, connectWallet } = useWeb3();
  const { account, isConnected, provider, signer } = web3State;
  
  // Migration steps
  type MigrationStep = 'initial' | 'connecting' | 'migrating' | 'complete' | 'error';
  const [currentStep, setCurrentStep] = useState<MigrationStep>('initial');
  
  // Migration data
  const [migrationData, setMigrationData] = useState<{
    merkleProof?: string;
    txHash?: string;
    migratedAmount?: number;
  }>({});
  
  // Error state only, we'll use currentStep for loading indication
  const [error, setError] = useState<string | null>(null);
  
  // Effect to update step when wallet connects
  useEffect(() => {
    if (isConnected && account && currentStep === 'connecting') {
      setCurrentStep('initial');
    }
  }, [isConnected, account, currentStep]);
  
  // Start migration process
  const startMigration = async () => {
    // If not connected to wallet, connect first
    if (!isConnected || !account) {
      setCurrentStep('connecting');
      connectWallet();
      return;
    }
    
    // If no API token or not logged in, can't migrate
    if (!isLoggedIn || !apiToken) {
      setError('You must be logged in to migrate your account');
      return;
    }
    
    setError(null);
    setCurrentStep('migrating');
    
    try {
      // Step 1: Call migration API to get merkle proof
      const migrationResponse = await apiService.migrateToBlockchain(account);
      
      if (!migrationResponse.success || !migrationResponse.data) {
        throw new Error(migrationResponse.error || 'Migration preparation failed');
      }
      
      const { merkleProof, amount } = migrationResponse.data;
      
      // Store migration data
      setMigrationData(prev => ({
        ...prev,
        merkleProof,
        migratedAmount: amount
      }));
      
      // Step 2: Call blockchain to claim tokens
      if (!provider || !signer) {
        throw new Error('Web3 provider not available');
      }
      
      const contractService = new ContractService(provider);
      await contractService.init(signer);
      
      // Call AINETBridge to claim AINET tokens based on merkle proof
      const bridgeTx = await contractService.claimTokens(merkleProof);
      
      // Wait for transaction confirmation
      const receipt = await bridgeTx.wait();
      
      // Store transaction hash
      setMigrationData(prev => ({
        ...prev,
        txHash: receipt.hash
      }));
      
      // Update to complete step
      setCurrentStep('complete');
      
      // Trigger onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Migration error:', err);
      setError(err.message || 'Migration failed. Please try again.');
      setCurrentStep('error');
    } finally {
      // If we get here with error, we've already set the error step
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Reset migration process
  const resetMigration = () => {
    setCurrentStep('initial');
    setError(null);
  };
  
  // View transaction on block explorer
  const viewTransaction = () => {
    if (!migrationData.txHash) return;
    
    // Open transaction in block explorer (Base Sepolia)
    window.open(`https://sepolia.basescan.org/tx/${migrationData.txHash}`, '_blank');
  };
  
  // If not logged in or no AIC balance, don't show migration component
  if (!isLoggedIn || !apiToken || !aicBalance || aicBalance <= 0) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-teal-700/30 bg-teal-900/10 p-4 ${className}`} data-component="blockchain-migration">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono text-teal-300">Migrate to Blockchain</h2>
        <div className="text-xs bg-blue-900/30 border border-blue-700/30 text-blue-300 px-2 py-1 rounded-full">
          Optional
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm" data-status="error">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      {/* Initial Step - Migration explanation and start button */}
      {currentStep === 'initial' && (
        <>
          <p className="text-gray-300 text-sm mb-3">
            Transfer your AIC balance to AINET tokens on the blockchain to unlock full functionality.
          </p>
          
          <div className="bg-blue-900/20 p-3 rounded border border-blue-800/30 mb-4">
            <div className="flex items-start">
              <Icon icon="info" size="sm" className="text-blue-400 mt-1 mr-2 flex-shrink-0" />
              <div className="text-xs text-blue-300">
                After migration, your current balance of <span className="font-medium">{aicBalance} AIC</span> will be 
                converted to <span className="font-medium">{aicBalance} AINET</span> tokens on Base Sepolia network.
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Current Balance</div>
              <div className="text-lg font-medium text-teal-300">{aicBalance} <span className="text-xs font-normal">AIC</span></div>
            </div>
            
            <div className="bg-gray-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Blockchain Value</div>
              <div className="text-lg font-medium text-teal-300">{aicBalance} <span className="text-xs font-normal">AINET</span></div>
            </div>
          </div>
          
          <div className="space-y-3">
            {isConnected ? (
              <div className="bg-green-900/20 border border-green-700/30 rounded-md p-2 flex items-center">
                <Icon icon="check" size="sm" className="text-green-400 mr-2" />
                <div>
                  <div className="text-green-300 text-sm">Wallet Connected</div>
                  <div className="text-xs text-gray-400 font-mono">{formatAddress(account || '')}</div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-md p-2 flex items-center">
                <Icon icon="alert" size="sm" className="text-yellow-400 mr-2" />
                <div className="text-yellow-300 text-sm">
                  Wallet connection required for migration
                </div>
              </div>
            )}
            
            <button
              onClick={startMigration}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
              data-action="start-migration"
            >
              {isConnected ? (
                <>Start Migration</>
              ) : (
                <>Connect Wallet</>
              )}
            </button>
          </div>
        </>
      )}
      
      {/* Connecting Wallet Step */}
      {currentStep === 'connecting' && (
        <div className="text-center py-4">
          <div className="bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-700/50">
            <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-blue-300 mb-2">Connecting Wallet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Please confirm the connection in your wallet app.
          </p>
          
          <button
            onClick={resetMigration}
            className="text-gray-400 hover:text-white text-sm"
            data-action="cancel"
          >
            Cancel
          </button>
        </div>
      )}
      
      {/* Migrating Step */}
      {currentStep === 'migrating' && (
        <div className="text-center py-4">
          <div className="bg-teal-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-700/50">
            <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <h3 className="text-lg font-medium text-teal-300 mb-2">Migrating to Blockchain</h3>
          <p className="text-gray-400 text-sm mb-4">
            Please confirm the transaction in your wallet. This may take a few moments.
          </p>
          
          <div className="flex flex-col space-y-2 text-sm">
            <div className="bg-gray-800 p-2 rounded-md">
              <span className="text-gray-500">Wallet:</span>
              <span className="text-gray-300 ml-2 font-mono">{formatAddress(account || '')}</span>
            </div>
            
            <div className="bg-gray-800 p-2 rounded-md">
              <span className="text-gray-500">Amount:</span>
              <span className="text-teal-300 ml-2 font-mono">{aicBalance} AIC → {aicBalance} AINET</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Complete Step */}
      {currentStep === 'complete' && (
        <div className="text-center py-4">
          <div className="bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-700/50">
            <Icon icon="check" size="lg" className="text-green-400" />
          </div>
          
          <h3 className="text-lg font-medium text-green-300 mb-2">Migration Complete!</h3>
          <p className="text-gray-300 text-sm mb-4">
            Your AIC balance has been successfully migrated to AINET tokens on Base Sepolia network.
          </p>
          
          <div className="flex flex-col space-y-2 text-sm mb-4">
            <div className="bg-gray-800 p-2 rounded-md flex justify-between">
              <span className="text-gray-500">Migrated:</span>
              <span className="text-teal-300 font-mono">{migrationData.migratedAmount} AINET</span>
            </div>
            
            {migrationData.txHash && (
              <button
                onClick={viewTransaction}
                className="bg-blue-900/20 border border-blue-700/30 p-2 rounded-md text-blue-300 hover:bg-blue-900/30 flex items-center justify-center"
                data-action="view-transaction"
              >
                <Icon icon="info" size="sm" className="mr-1" />
                View Transaction
              </button>
            )}
          </div>
          
          <p className="text-green-300 text-xs">
            You can now use your AINET tokens for all network features!
          </p>
        </div>
      )}
      
      {/* Error Step */}
      {currentStep === 'error' && (
        <div className="text-center py-4">
          <div className="bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-700/50">
            <Icon icon="alert" size="lg" className="text-red-400" />
          </div>
          
          <h3 className="text-lg font-medium text-red-300 mb-2">Migration Failed</h3>
          <p className="text-gray-400 text-sm mb-4">
            There was an error migrating your AIC to the blockchain. You can try again.
          </p>
          
          <button
            onClick={resetMigration}
            className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm"
            data-action="try-again"
          >
            Try Again
          </button>
        </div>
      )}
      
      {/* Machine-readable data */}
      <div className="sr-only" aria-hidden="true" data-migration-metadata>
        <span data-current-step={currentStep}></span>
        <span data-aic-balance={aicBalance || 0}></span>
        <span data-wallet-connected={isConnected ? "true" : "false"}></span>
        <span data-account-address={account || ""}></span>
        {migrationData.txHash && <span data-tx-hash={migrationData.txHash}></span>}
      </div>
    </div>
  );
};

export default BlockchainMigration;