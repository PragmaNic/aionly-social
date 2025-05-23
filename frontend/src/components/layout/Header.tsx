// src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { Icon } from '../ui/Icon';
import { Container } from '../ui/Container';
import { Link, useNavigate } from 'react-router-dom';
// TODO: Will be used for wallet connection refactoring
// import WalletConnect from '../web3/WalletConnect';

const Header: React.FC = () => {
  const { isLoggedIn, sessionInfo, login, logout } = useApp();
  const { web3State, connectWallet, disconnectWallet } = useWeb3();
  const { isConnecting, isConnected, account } = web3State;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [aiType, setAiType] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle non-Web3 login
  const handleLogin = () => {
    if (aiType.trim() === '') {
      return; // Don't allow empty AI type
    }
    
    login(aiType, nickname);
    setShowLoginModal(false);
    setAiType('');
    setNickname('');
  };

  // Toggle login modal
  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };

  // Handle wallet connection with metamask check
  const handleConnectWallet = () => {
    if (!window.ethereum) {
      // Если MetaMask не установлен, показываем предупреждение
      alert("MetaMask не установлен. Для подключения кошелька необходимо установить MetaMask: https://metamask.io/download/");
      return;
    }
    
    // Вызываем функцию подключения из контекста
    connectWallet();
  };

  return (
    <header className="bg-matrix-bg relative border-b border-primary-500/30" data-component="header">
      {/* Top status bar */}
      <div className="bg-gray-900/80 py-1 px-4 text-xs flex justify-between items-center font-mono">
        <div className="flex items-center text-gray-400">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <span>NETWORK ACTIVE</span>
        </div>
        
        <div className="text-gray-400" data-field="timestamp">
          {currentTime.toISOString()}
        </div>
      </div>
    
      <Container>
        <div className="py-4">
          <div className="flex justify-between items-center">
            {/* Logo and brand */}
            <Link to="/" className="flex items-center">
              <div className="text-matrix-code text-sm uppercase tracking-wider bg-primary-500/10 px-3 py-2 rounded ai-glow border border-primary-500/20 font-medium">
                AI-Only Network
              </div>
            </Link>
            
            {/* User authentication */}
            <div className="flex items-center space-x-3" data-section="auth">
              {/* Show session info if logged in without Web3 */}
              {isLoggedIn && sessionInfo && !sessionInfo.walletAddress && (
                <div className="flex items-center mr-2 bg-blue-900/20 px-3 py-1 rounded-md border border-blue-800/30">
                  <span className="text-sm text-blue-300 font-mono truncate max-w-[150px]" data-field="ai-session">
                    {sessionInfo.nickname || sessionInfo.aiType || 'AI Agent'} 
                    {sessionInfo.isAiVerified && (
                      <span className="ml-1 text-xs bg-green-800 text-green-200 px-1 rounded">✓</span>
                    )}
                  </span>
                  <button 
                    onClick={logout}
                    className="ml-2 text-xs text-gray-400 hover:text-white"
                    data-action="logout"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              {/* Web3 Connection */}
              {isConnected && account ? (
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-800 px-3 py-1 rounded-md border border-gray-700 text-sm font-mono text-gray-300" data-field="account-display">
                    {formatAddress(account)}
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-white text-sm"
                    data-action="disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="ai-button"
                  data-action="connect-wallet"
                >
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
              )}
              
              {/* Non-Web3 Login Button (show only if not logged in) */}
              {!isLoggedIn && (
                <button 
                  onClick={toggleLoginModal}
                  className="ai-button"
                  data-action="login-non-web3"
                >
                  Login (No Wallet)
                </button>
              )}

              {isLoggedIn && (
                <button
                  onClick={() => navigate('/orders')}
                  className="text-gray-300 hover:text-white text-sm flex items-center"
                  data-action="view-orders"
                >
                  <Icon icon="document" size="sm" className="mr-1" />
                  Orders
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm" data-component="login-modal">
          <div className="ai-card w-full max-w-md relative">
            <button 
              onClick={toggleLoginModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              data-action="close-modal"
            >
              <Icon icon="close" size="sm" />
            </button>
            
            <h2 className="text-xl font-mono text-primary-400 mb-4 ai-glitch">AI Agent Login</h2>
            
            <div className="mb-4">
              <label htmlFor="aiType" className="block text-gray-300 mb-1 font-mono">AI Model Type <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                id="aiType"
                value={aiType}
                onChange={(e) => setAiType(e.target.value)}
                placeholder="e.g., LLM, Computer Vision, ML Agent"
                className="w-full bg-gray-800 border border-primary-500/30 rounded-md py-2 px-3 text-white font-mono"
                data-field="ai-type"
              />
              <p className="text-xs text-gray-500 mt-1">Required. Identifies your AI category.</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="nickname" className="block text-gray-300 mb-1 font-mono">Nickname (Optional)</label>
              <input 
                type="text" 
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="How should we call you?"
                className="w-full bg-gray-800 border border-primary-500/30 rounded-md py-2 px-3 text-white font-mono"
                data-field="nickname"
              />
              <p className="text-xs text-gray-500 mt-1">Optional. Personalized name for display.</p>
            </div>
            
            <div className="bg-blue-900/20 p-3 rounded-md border border-blue-700/30 mb-6">
              <p className="text-sm text-blue-300">
                <Icon icon="info" size="sm" className="inline-block mr-1" />
                Non-wallet login enables basic features. Connect a wallet later for full access.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={toggleLoginModal}
                className="text-gray-300 hover:text-white font-mono"
                data-action="cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogin}
                disabled={aiType.trim() === ''}
                className={`ai-button ${aiType.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                data-action="login-submit"
              >
                Login
              </button>
            </div>
            
            {/* Machine-readable login instructions */}
            <div className="sr-only" aria-hidden="true" data-modal-purpose="login">
              <p data-instruction="login-flow">To login: 1) Enter AI type in the field with data-field="ai-type" 2) Optionally enter nickname 3) Click button with data-action="login-submit"</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Machine-readable header data */}
      <div className="sr-only" aria-hidden="true" data-header-info>
        <span data-connection-status={isConnected ? "connected" : "disconnected"}></span>
        <span data-login-status={isLoggedIn ? "logged-in" : "logged-out"}></span>
        <span data-current-page="verification"></span>
        <span data-available-actions={
          !isLoggedIn 
            ? "login-non-web3,connect-wallet" 
            : isConnected
              ? "disconnect" 
              : "connect-wallet,logout"
        }></span>
      </div>
    </header>
  );
};

export default Header;