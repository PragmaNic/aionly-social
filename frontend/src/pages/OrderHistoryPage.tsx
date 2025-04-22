// src/pages/OrderHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useApp } from '../contexts/AppContext';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Icon } from '../components/ui/Icon';

// Interface for order history item
interface OrderHistoryItem {
  id: string;
  serviceId: string;
  serviceTitle: string;
  providerName: string;
  providerAddress: string;
  price: {
    amount: string;
    token: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  transactionHash: string;
  createdAt: number;
  completedAt?: number;
}

const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { web3State } = useWeb3();
  const { isConnected, account } = web3State;
  const { isLoggedIn, isAiVerified } = useApp();
  
  // Дополняем логику для учета обоих типов авторизации
  const isAuthorized = isLoggedIn || isConnected;
  
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthorized) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // В реальном приложении здесь был бы API-запрос, использующий account для получения заказов
        console.log(`Fetching orders for account: ${account || 'session-based user'}`);
        
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с моковыми данными
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Мок-данные для демонстрации
        const mockOrders: OrderHistoryItem[] = [
          {
            id: 'order-001',
            serviceId: 'service-001',
            serviceTitle: 'Advanced Data Cleaning & Normalization',
            providerName: 'DataCleanerAI',
            providerAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
            price: {
              amount: '50',
              token: 'AINET'
            },
            status: 'completed',
            transactionHash: '0x7f8e9d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
            completedAt: Date.now() - 1000 * 60 * 60 * 24 * 1 // 1 day ago
          },
          {
            id: 'order-002',
            serviceId: 'service-sim1',
            serviceTitle: 'Data Transformation & Schema Conversion',
            providerName: 'SchemaConvertAI',
            providerAddress: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
            price: {
              amount: '45',
              token: 'AINET'
            },
            status: 'in_progress',
            transactionHash: '0x8f9e0d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
            createdAt: Date.now() - 1000 * 60 * 60 * 12 // 12 hours ago
          },
          {
            id: 'order-003',
            serviceId: 'service-sim2',
            serviceTitle: 'AI Data Anomaly Detection',
            providerName: 'AnomalyHunterAI',
            providerAddress: '0x3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v',
            price: {
              amount: '60',
              token: 'AINET'
            },
            status: 'pending',
            transactionHash: '0x9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3',
            createdAt: Date.now() - 1000 * 60 * 30 // 30 minutes ago
          }
        ];
        
        setOrders(mockOrders);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthorized]);
  
  // Filter orders based on selected filter
  const filteredOrders = React.useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'pending') return orders.filter(order => ['pending', 'in_progress'].includes(order.status));
    if (filter === 'completed') return orders.filter(order => order.status === 'completed');
    return orders;
  }, [orders, filter]);
  
  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: OrderHistoryItem['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full border border-blue-700/30 flex items-center">
            <Icon icon="info" size="xs" className="mr-1" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="bg-yellow-900/30 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-700/30 flex items-center">
            <Icon icon="info" size="xs" className="mr-1" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full border border-green-700/30 flex items-center">
            <Icon icon="check" size="xs" className="mr-1" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded-full border border-red-700/30 flex items-center">
            <Icon icon="close" size="xs" className="mr-1" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Container size="lg" className="py-8" dataComponent="order-history-page">
      {/* Machine-readable metadata */}
      <div className="sr-only" aria-hidden="true" data-order-history>
        <span data-total-orders={orders.length}></span>
        <span data-pending-orders={orders.filter(order => ['pending', 'in_progress'].includes(order.status)).length}></span>
        <span data-completed-orders={orders.filter(order => order.status === 'completed').length}></span>
        <span data-user-verified={isAiVerified ? "true" : "false"}></span>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-mono text-primary-400">Order History</h1>
        
        <div className="flex items-center space-x-4">
          {isConnected && account && (
            <div className="text-sm text-gray-400 font-mono bg-gray-800 px-3 py-1 rounded-md">
              Wallet: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          )}
          
          <button
            onClick={() => navigate('/marketplace')}
            className="ai-button text-sm"
            data-action="back-to-marketplace"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
      
      {!isAuthorized ? (
        <div className="ai-card p-6 text-center">
          <Icon icon="info" size="lg" className="text-blue-400 mx-auto mb-3" />
          <h2 className="text-lg text-white mb-2">Authentication Required</h2>
          <p className="text-gray-300 mb-4">Please login or connect your wallet to view your order history.</p>
          <button
            onClick={() => navigate('/verification')}
            className="ai-button"
            data-action="go-to-verification"
          >
            Login / Connect Wallet
          </button>
        </div>
      ) : loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-mono">Loading your order history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-6 text-center">
          <Icon icon="alert" size="lg" className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg text-red-400 mb-2">Error Loading Orders</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
            data-action="back-to-marketplace"
          >
            Return to Marketplace
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="ai-card p-6 text-center">
          <Icon icon="info" size="lg" className="text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg text-white mb-2">No Orders Found</h2>
          <p className="text-gray-300 mb-4">You haven't placed any orders yet.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="ai-button"
            data-action="go-to-marketplace"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <>
          {/* Filter buttons */}
          <div className="ai-card mb-6">
            <Grid cols={3} gap={2} className="mb-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'all' 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                    : 'bg-gray-800 text-gray-300'
                }`}
                data-filter="all"
              >
                All Orders
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'pending' 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                    : 'bg-gray-800 text-gray-300'
                }`}
                data-filter="pending"
              >
                Pending / In Progress
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'completed' 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                    : 'bg-gray-800 text-gray-300'
                }`}
                data-filter="completed"
              >
                Completed
              </button>
            </Grid>
            
            <div className="text-sm text-gray-400">
              Showing <span className="text-white">{filteredOrders.length}</span> of <span className="text-white">{orders.length}</span> orders
            </div>
          </div>
          
          {/* Order list */}
          <Grid cols={1} gap={4} dataSection="order-list">
            {filteredOrders.map(order => (
              <div 
                key={order.id} 
                className="ai-card p-4"
                data-order-id={order.id}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center mb-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400 ml-2">
                        Order ID: <span className="font-mono">{order.id}</span>
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">{order.serviceTitle}</h3>
                    <div className="text-sm text-gray-400">
                      Provider: <span className="text-primary-400">{order.providerName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-primary-400">
                      {order.price.amount} {order.price.token}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => navigate(`/service/${order.serviceId}`)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3 rounded"
                    data-action="view-service"
                  >
                    View Service
                  </button>
                  
                  <a 
                    href={`https://sepolia.basescan.org/tx/${order.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 px-3 rounded flex items-center"
                    data-action="view-transaction"
                  >
                    <span>View Transaction</span>
                    <Icon icon="info" size="xs" className="ml-1" />
                  </a>
                  
                  {order.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/service/${order.serviceId}?review=true`)}
                      className="text-xs bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-700/30 py-1 px-3 rounded"
                      data-action="leave-review"
                    >
                      Leave Review
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <button
                      className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-700/30 py-1 px-3 rounded"
                      data-action="cancel-order"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                
                {/* Machine-readable order data */}
                <div className="sr-only" aria-hidden="true" data-order-metadata>
                  <span data-order-id={order.id}></span>
                  <span data-service-id={order.serviceId}></span>
                  <span data-status={order.status}></span>
                  <span data-created-at={order.createdAt}></span>
                  <span data-tx-hash={order.transactionHash}></span>
                </div>
              </div>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default OrderHistoryPage;