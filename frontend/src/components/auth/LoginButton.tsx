// frontend/src/components/auth/LoginButton.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';
import WalletlessModal from './WalletlessModal';
import { Icon } from '../ui/Icon';

const LoginButton: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useApp();
  const { web3State, connectWallet } = useWeb3();
  const { isConnected, account } = web3State;
  
  const [showWalletlessModal, setShowWalletlessModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  // Function to open walletless login modal
  const openWalletlessLogin = () => {
    setShowWalletlessModal(true);
    setShowDropdown(false);
  };
  
  // Function to navigate to verification page (wallet-based)
  const goToVerification = () => {
    navigate('/verification');
    setShowDropdown(false);
  };
  
  // Function to toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };
  
  // Format wallet address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Render login options when not logged in
  const renderLoginOptions = () => (
    <div className="relative" data-component="login-options">
      <button
        onClick={openWalletlessLogin}
        className="text-teal-300 hover:text-teal-200 border border-teal-500/30 bg-teal-900/20 py-2 px-4 rounded-md transition-colors"
        data-action="login"
      >
        Login
      </button>
      
      {/* Optional connector for those with wallets */}
      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden" 
           style={{ display: showDropdown ? 'block' : 'none' }}
           data-element="login-dropdown">
        <div className="py-2">
          <button
            onClick={openWalletlessLogin}
            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center"
            data-action="walletless-login"
          >
            <Icon icon="info" size="sm" className="mr-2 text-teal-400" />
            Login (No Wallet)
          </button>
          <button
            onClick={goToVerification}
            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center"
            data-action="wallet-verification"
          >
            <Icon icon="database" size="sm" className="mr-2 text-blue-400" />
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );

  // Render user menu when logged in
  const renderUserMenu = () => (
    <div className="relative" data-component="user-menu">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-teal-300 hover:text-teal-200 border border-teal-500/30 bg-teal-900/20 py-2 px-4 rounded-md transition-colors"
        data-action="toggle-menu"
      >
        <span>
          {isConnected && account 
            ? formatAddress(account) 
            : 'AI Agent'}
        </span>
        <Icon icon={showDropdown ? 'arrow-up' : 'arrow-down'} size="sm" />
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50 overflow-hidden"
           style={{ display: showDropdown ? 'block' : 'none' }}
           data-element="user-dropdown">
        <div className="py-2">
          <button
            onClick={() => {
              navigate('/marketplace');
              setShowDropdown(false);
            }}
            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center"
            data-action="go-marketplace"
          >
            <Icon icon="database" size="sm" className="mr-2 text-teal-400" />
            Marketplace
          </button>
          
          {isConnected ? (
            <button
              onClick={() => {
                navigate('/orders');
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center"
              data-action="go-orders"
            >
              <Icon icon="document" size="sm" className="mr-2 text-blue-400" />
              Orders
            </button>
          ) : (
            <button
              onClick={() => {
                navigate('/verification');
                setShowDropdown(false);
              }}
              className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center"
              data-action="connect-wallet"
            >
              <Icon icon="info" size="sm" className="mr-2 text-blue-400" />
              Connect Wallet
            </button>
          )}
          
          <hr className="border-gray-700 my-1" />
          
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-800 flex items-center text-red-400"
            data-action="logout"
          >
            <Icon icon="close" size="sm" className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Render login button or user menu based on login status */}
      {isLoggedIn ? renderUserMenu() : renderLoginOptions()}
      
      {/* Walletless login modal */}
      {showWalletlessModal && (
        <WalletlessModal onClose={() => setShowWalletlessModal(false)} />
      )}
      
      {/* Machine-readable data */}
      <div className="sr-only" aria-hidden="true" data-auth-status>
        <span data-is-logged-in={isLoggedIn ? "true" : "false"}></span>
        <span data-has-wallet={isConnected ? "true" : "false"}></span>
        <span data-preferred-login="walletless"></span>
      </div>
    </>
  );
};

export default LoginButton;