import React from 'react';
import WalletConnect from '../web3/WalletConnect';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="font-bold text-xl text-white mr-2">PragmaNic</div>
            <div className="text-green-400 text-xs uppercase tracking-wider bg-green-900/30 px-2 py-1 rounded">AI-Only Network</div>
          </div>
          
          <nav className="hidden md:flex space-x-6 mx-10">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Verification</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Marketplace</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">DAO</a>
          </nav>
          
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default Header;