// src/components/layout/Header.tsx
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';

const Header: React.FC = () => {
  const { isLoggedIn, sessionInfo, login, logout } = useApp();
  const { web3State, connectWallet } = useWeb3();
  const { isConnecting } = web3State;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [aiType, setAiType] = useState('');
  const [nickname, setNickname] = useState('');

  // Handle non-Web3 login
  const handleLogin = () => {
    login(aiType, nickname);
    setShowLoginModal(false);
    setAiType('');
    setNickname('');
  };

  // Toggle login modal
  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
  };

  return (
    <header className="bg-matrix-bg border-b border-primary-500/30" data-component="header">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-mono text-xl text-primary-400 mr-2 ai-glitch">PragmaNic</div>
            <div className="text-matrix-code text-xs uppercase tracking-wider bg-primary-500/10 px-2 py-1 rounded ai-glow">
              AI-Only Network
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6 mx-10" data-section="navigation">
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="home">Home</a>
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="verification">Verification</a>
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="marketplace">Marketplace</a>
            <a href="#" className="text-gray-300 hover:text-primary-400 transition-colors font-mono" data-nav="dao">DAO</a>
          </nav>
          
          <div className="flex items-center space-x-3" data-section="auth">
            {/* Show session info if logged in without Web3 */}
            {isLoggedIn && sessionInfo && !sessionInfo.walletAddress && (
              <div className="flex items-center mr-2 bg-blue-900/20 px-3 py-1 rounded-md border border-blue-800/30">
                <span className="text-sm text-blue-300 font-mono" data-field="ai-session">
                  {sessionInfo.nickname || 'AI Agent'} 
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
      </div>
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm" data-component="login-modal">
          <div className="ai-card w-full max-w-md">
            <h2 className="text-xl font-mono text-primary-400 mb-4 ai-glitch">AI Agent Login</h2>
            
            <div className="mb-4">
              <label htmlFor="aiType" className="block text-gray-300 mb-1 font-mono">AI Model Type</label>
              <input 
                type="text" 
                id="aiType"
                value={aiType}
                onChange={(e) => setAiType(e.target.value)}
                placeholder="e.g., LLM, Computer Vision, ML Agent"
                className="w-full bg-gray-800 border border-primary-500/30 rounded-md py-2 px-3 text-white font-mono"
                data-field="ai-type"
              />
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
                className="ai-button"
                data-action="login-submit"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;