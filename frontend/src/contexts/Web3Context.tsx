import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3State } from '../types';

// Начальное состояние
const initialState: Web3State = {
  account: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  provider: null,
  signer: null,
  error: null,
};

// Интерфейс контекста
interface Web3ContextType {
  web3State: Web3State;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

// Создаем контекст
const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// Константы для сети Base Sepolia
const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_PARAMS = {
  chainId: '0x14A34',
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
};

// Провайдер контекста
export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [web3State, setWeb3State] = useState<Web3State>(initialState);

  // Проверяем подключение при загрузке
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Проверяем текущее соединение
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);

            setWeb3State({
              account: accounts[0],
              chainId,
              isConnected: true,
              isConnecting: false,
              provider,
              signer,
              error: null,
            });
          }
        } catch (error) {
          console.error('Failed to check Ethereum connection:', error);
        }
      }
    };

    checkConnection();

    // Слушаем события смены аккаунта и сети
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // Пользователь отключился
          setWeb3State(initialState);
        } else {
          setWeb3State((prev) => ({
            ...prev,
            account: accounts[0],
          }));
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setWeb3State((prev) => ({
          ...prev,
          chainId,
        }));
      });
    }

    return () => {
      // Очистка слушателей
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Подключить кошелек
  const connectWallet = async () => {
    if (!window.ethereum) {
      setWeb3State((prev) => ({
        ...prev,
        error: 'Metamask не установлен. Пожалуйста, установите Metamask.',
      }));
      return;
    }

    try {
      setWeb3State((prev) => ({
        ...prev,
        isConnecting: true,
      }));

      // Запрос на подключение кошелька
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Проверяем и переключаем сеть при необходимости
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        try {
          // Пытаемся переключиться на Base Sepolia
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14A34' }], // Base Sepolia chainId в hex
          });
        } catch (switchError: any) {
          // Если сеть не добавлена, добавляем её
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [BASE_SEPOLIA_PARAMS],
              });
            } catch (addError) {
              throw new Error('Не удалось добавить сеть Base Sepolia');
            }
          } else {
            throw switchError;
          }
        }
      }

      // Обновляем провайдер и сеть после переключения
      const updatedProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await updatedProvider.getSigner();
      const updatedNetwork = await updatedProvider.getNetwork();
      const updatedChainId = Number(updatedNetwork.chainId);

      setWeb3State({
        account: accounts[0],
        chainId: updatedChainId,
        isConnected: true,
        isConnecting: false,
        provider: updatedProvider,
        signer,
        error: null,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      setWeb3State((prev) => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Ошибка подключения кошелька',
      }));
    }
  };

  // Отключить кошелек
  const disconnectWallet = () => {
    setWeb3State(initialState);
  };

  return (
    <Web3Context.Provider value={{ web3State, connectWallet, disconnectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};

// Хук для использования контекста
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};