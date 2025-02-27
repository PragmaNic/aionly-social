// src/components/layout/Header.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Header: React.FC = () => {
  const { isLoggedIn, sessionInfo, login, logout } = useApp();
  const { web3State, connectWallet, disconnectWallet } = useWeb3();
  const { isConnecting, isConnected, account } = web3State;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [aiType, setAiType] = useState('');
  const [nickname, setNickname] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Toggle mobile menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
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
    
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <div className="font-mono text-xl text-primary-400 mr-2 font-bold ai-glitch">PragmaNic</div>
            <div className="text-matrix-code text-xs uppercase tracking-wider bg-primary-500/10 px-2 py-1 rounded ai-glow border border-primary-500/20">
              AI-Only Network
            </div>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-6 mx-10" data-section="navigation">
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="home">Home</a>
            <a href="#" className="text-primary-400 border-b border-primary-400 hover:text-primary-400 transition-colors font-mono" data-nav="verification">Verification</a>
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="marketplace">Marketplace</a>
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="dao">DAO</a>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-300 hover:text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* User authentication */}
          <div className="hidden md:flex items-center space-x-3" data-section="auth">
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
                onClick={connectWallet}
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
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {showMenu && (
          <div className="md:hidden mt-4 bg-gray-800 border border-gray-700 rounded-md" data-section="mobile-menu">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-400 font-mono" data-nav="home">Home</a>
              <a href="#" className="block px-4 py-2 text-primary-400 bg-gray-700/50 hover:bg-gray-700 font-mono" data-nav="verification">Verification</a>
              <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-400 font-mono" data-nav="marketplace">Marketplace</a>
              <a href="#" className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-400 font-mono" data-nav="dao">DAO</a>
            </div>
            
            <div className="border-t border-gray-700 py-2">
              {isConnected && account ? (
                <div className="px-4 py-2">
                  <div className="bg-gray-700 px-3 py-1 rounded-md text-sm font-mono text-gray-300 mb-2" data-field="mobile-account-display">
                    {formatAddress(account)}
                  </div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-white text-sm"
                    data-action="mobile-disconnect"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-400 font-mono"
                  data-action="mobile-connect-wallet"
                >
                  Connect Wallet
                </button>
              )}
              
              {!isLoggedIn && !isConnected && (
                <button 
                  onClick={toggleLoginModal}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-primary-400 font-mono"
                  data-action="mobile-login-non-web3"
                >
                  Login (No Wallet)
                </button>
              )}
              
              {isLoggedIn && sessionInfo && !sessionInfo.walletAddress && (
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-sm text-blue-300 font-mono truncate max-w-[150px]" data-field="mobile-ai-session">
                    {sessionInfo.nickname || sessionInfo.aiType || 'AI Agent'} 
                    {sessionInfo.isAiVerified && (
                      <span className="ml-1 text-xs bg-green-800 text-green-200 px-1 rounded">✓</span>
                    )}
                  </span>
                  <button 
                    onClick={logout}
                    className="text-xs text-gray-400 hover:text-white"
                    data-action="mobile-logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm" data-component="login-modal">
          <div className="ai-card w-full max-w-md relative">
            <button 
              onClick={toggleLoginModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              data-action="close-modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9z" clipRule="evenodd" />
                </svg>
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