import React from 'react';
import { useWeb3 } from '../../contexts/Web3Context';

const WalletConnect: React.FC = () => {
  const { web3State, connectWallet, disconnectWallet } = useWeb3();
  const { account, isConnected, isConnecting, error } = web3State;

  // Форматирование адреса кошелька
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center">
      {error && (
        <div className="text-red-500 mr-4 text-sm">{error}</div>
      )}
      
      {isConnected && account ? (
        <div className="flex items-center space-x-3">
          <div className="hidden md:block">
            <span className="text-sm text-gray-400 mr-2">Connected:</span>
            <span className="font-mono text-sm text-white py-1 px-2 bg-gray-800 rounded-md">
              {formatAddress(account)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-70"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M16 14V8" />
                <path d="M12 14V10" />
                <path d="M8 14v-3" />
              </svg>
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;