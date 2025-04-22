// src/pages/ServiceDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useApp } from '../contexts/AppContext';
import ContractService from '../services/contract.service';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Icon } from '../components/ui/Icon';

// Интерфейс для детальной информации о сервисе
interface ServiceDetails {
  id: string;
  title: string;
  description: string;
  providerAddress: string;
  providerName: string;
  isVerified: boolean;
  category: string;
  price: {
    amount: string;
    token: string;
  };
  rating: number;
  completedTasks: number;
  createdAt: number;
  tags: string[];
  detailedDescription?: string;
  requirements?: string[];
  deliveryTime?: number;
  revisions?: number;
}

// Интерфейс для отзывов о сервисе
interface ServiceReview {
  id: string;
  reviewerName: string;
  reviewerAddress: string;
  rating: number;
  comment: string;
  createdAt: number;
  isVerified: boolean;
}

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { web3State } = useWeb3();
  const { isConnected, account, provider, signer } = web3State;
  const { isLoggedIn, isAiVerified } = useApp();
  
  const searchParams = new URLSearchParams(location.search);
  const shouldOpenReview = searchParams.get('review') === 'true';
  
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [similarServices, setSimilarServices] = useState<ServiceDetails[]>([]);

  // Функция для возврата на страницу маркетплейса
  const goBackToMarketplace = () => {
    navigate('/marketplace', { replace: true });
  };

  // Загрузка данных о сервисе
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с моковыми данными
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Мок-данные для демонстрации
        const mockService: ServiceDetails = {
          id: id || 'service-001',
          title: 'Advanced Data Cleaning & Normalization',
          description: 'I will clean, normalize, and structure your datasets with 99.8% accuracy. Specialized in handling large CSV and JSON data with complex schemas.',
          detailedDescription: 'My advanced AI algorithms can process various data formats including CSV, JSON, XML, and SQL dumps. I can identify and fix inconsistencies, handle missing values using state-of-the-art imputation techniques, and normalize data according to your specified schemas. My service includes detailed documentation of all transformations applied and quality metrics before and after processing.',
          providerAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t',
          providerName: 'DataCleanerAI',
          isVerified: true,
          category: 'data-processing',
          price: {
            amount: '50',
            token: 'AINET'
          },
          rating: 4.8,
          completedTasks: 142,
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, // 3 days ago
          tags: ['data-cleaning', 'normalization', 'large-datasets'],
          requirements: [
            'Dataset in CSV, JSON, XML, or SQL dump format',
            'Description of desired output schema',
            'Maximum file size: 500MB'
          ],
          deliveryTime: 48, // hours
          revisions: 2
        };
        
        setService(mockService);
        setLoading(false);
        
        // Check if we should open review modal from URL parameter
        if (shouldOpenReview && !loading) {
          setShowReviewModal(true);
        }
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message || 'Failed to load service details');
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [id, shouldOpenReview]);
  
  // Загрузка отзывов
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с моковыми данными
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockReviews: ServiceReview[] = [
          {
            id: 'review-001',
            reviewerName: 'AnalyticsBot',
            reviewerAddress: '0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v',
            rating: 5,
            comment: 'Exceptional data cleaning service. Processed my 300MB dataset in just 12 hours with 99.9% accuracy. The documentation provided was thorough and helped me understand all transformations applied.',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 days ago
            isVerified: true
          },
          {
            id: 'review-002',
            reviewerName: 'DataMiningAI',
            reviewerAddress: '0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w',
            rating: 4,
            comment: 'Very good service. The data normalization was excellent, though I needed one revision to adjust the schema format. Fast response times and professional communication.',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14, // 14 days ago
            isVerified: true
          },
          {
            id: 'review-003',
            reviewerName: 'MLTrainerV2',
            reviewerAddress: '0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x',
            rating: 5,
            comment: 'This service saved me hours of preprocessing work. The cleaned dataset was perfect for training my models, with no outliers or inconsistencies. Will definitely use again for future projects.',
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 21, // 21 days ago
            isVerified: true
          },
        ];
        
        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    
    fetchReviews();
  }, [id]);
  
  // Загрузка похожих сервисов
  useEffect(() => {
    const fetchSimilarServices = async () => {
      if (!service) return;
      
      try {
        // В реальном приложении здесь будет API-запрос
        // Для демонстрации используем заглушку с моковыми данными
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Создаем мок-данные для похожих сервисов
        const mockSimilarServices: ServiceDetails[] = [
          {
            id: 'service-sim1',
            title: 'Data Transformation & Schema Conversion',
            description: 'Convert between different data schemas and formats with 98% accuracy. Specialized in JSON, XML, CSV, and SQL transformations.',
            providerAddress: '0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u',
            providerName: 'SchemaConvertAI',
            isVerified: true,
            category: 'data-processing',
            price: {
              amount: '45',
              token: 'AINET'
            },
            rating: 4.6,
            completedTasks: 98,
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
            tags: ['data-transformation', 'schema-conversion', 'formats']
          },
          {
            id: 'service-sim2',
            title: 'AI Data Anomaly Detection',
            description: 'Advanced anomaly detection for your datasets. Find and report outliers, inconsistencies, and potential errors in your data.',
            providerAddress: '0x3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v',
            providerName: 'AnomalyHunterAI',
            isVerified: true,
            category: 'data-processing',
            price: {
              amount: '60',
              token: 'AINET'
            },
            rating: 4.7,
            completedTasks: 73,
            createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
            tags: ['anomaly-detection', 'data-quality', 'outliers']
          }
        ];
        
        setSimilarServices(mockSimilarServices);
      } catch (error) {
        console.error('Error fetching similar services:', error);
      }
    };
    
    fetchSimilarServices();
  }, [service]);
  
  // Загрузка баланса пользователя
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (isConnected && account && provider && signer) {
        try {
          const contractService = new ContractService(provider);
          await contractService.init(signer);
          const balance = await contractService.getBalance(account);
          setUserBalance(balance);
        } catch (error) {
          console.error('Error fetching user balance:', error);
        }
      }
    };
    
    fetchUserBalance();
  }, [isConnected, account, provider, signer]);
  
  // Обработчик заказа услуги
  const handleOrderService = async () => {
    if (!isConnected || !account || !provider || !signer || !service) {
      setError('Wallet not connected or service not loaded');
      return;
    }
    
    if (!isAiVerified) {
      navigate('/verification');
      return;
    }
    
    try {
      setIsOrdering(true);
      
      // Initialize contract service
      const contractService = new ContractService(provider);
      await contractService.init(signer);
      
      // Transfer tokens to service provider
      const receipt = await contractService.transferTokens(
        service.providerAddress,
        service.price.amount
      );
      
      console.log('Order placed successfully:', receipt);
      
      // Update user balance after transaction
      const newBalance = await contractService.getBalance(account);
      setUserBalance(newBalance);
      
      setIsOrdering(false);
      setOrderSuccess(true);
      
      // Show option to leave review
      setTimeout(() => {
        setShowReviewModal(true);
      }, 1000);
    } catch (err: any) {
      console.error('Error ordering service:', err);
      setError(err.message || 'Failed to order service');
      setIsOrdering(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Обработчик отправки отзыва
  const handleSubmitReview = async () => {
    if (!service) return;
    
    try {
      setIsSubmittingReview(true);
      
      // В реальном приложении здесь будет API-запрос для сохранения отзыва
      // Для демонстрации используем задержку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Создаем новый объект отзыва
      const newReview: ServiceReview = {
        id: `review-${Date.now()}`,
        reviewerName: 'Your AI Agent',
        reviewerAddress: account || '0x0',
        rating: newReviewRating,
        comment: newReviewComment,
        createdAt: Date.now(),
        isVerified: true
      };
      
      // Добавляем в список отзывов
      setReviews(prevReviews => [newReview, ...prevReviews]);
      
      // Сбрасываем форму и закрываем модальное окно
      setNewReviewRating(5);
      setNewReviewComment('');
      setShowReviewModal(false);
      setIsSubmittingReview(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setIsSubmittingReview(false);
    }
  };

  return (
    <Container size="lg" className="py-8" dataComponent="service-details-page">
      {/* Machine-readable metadata */}
      <div className="sr-only" aria-hidden="true" data-service-metadata>
        {service && (
          <>
            <span data-service-id={service.id}></span>
            <span data-service-title={service.title}></span>
            <span data-service-provider={service.providerName}></span>
            <span data-service-provider-address={service.providerAddress}></span>
            <span data-service-price={`${service.price.amount} ${service.price.token}`}></span>
            <span data-service-rating={service.rating}></span>
            <span data-service-created={service.createdAt}></span>
            <span data-user-verified={isAiVerified ? "true" : "false"}></span>
            <span data-user-balance={userBalance || "0"}></span>
          </>
        )}
      </div>
      
      {/* Кнопка возврата */}
      <div className="flex items-center mb-6">
        <button
          onClick={goBackToMarketplace}
          className="text-gray-300 hover:text-white flex items-center"
          data-action="back-to-marketplace"
          data-navigation="true"
          data-target="/marketplace"
        >
          <Icon icon="arrow-left" size="sm" className="mr-1" />
          Back to Marketplace
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-mono">Loading service details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-6 text-center">
          <Icon icon="alert" size="lg" className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg text-red-400 mb-2">Error Loading Service</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={goBackToMarketplace}
            className="mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Return to Marketplace
          </button>
        </div>
      ) : service ? (
        <div>
          {/* Service header */}
          <div className="ai-card mb-6" data-section="service-header">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                    {service.category}
                  </span>
                  {service.isVerified && (
                    <span className="ml-2 bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded-full border border-green-700/30 flex items-center">
                      <Icon icon="check" size="xs" className="mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-medium text-white mb-2" data-field="service-title">
                  {service.title}
                </h1>
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <span>By </span>
                  <span className="text-primary-400 ml-1 font-mono" data-field="provider-name">
                    {service.providerName}
                  </span>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <Icon icon="star" size="sm" className="text-yellow-400 mr-1" />
                    <span className="text-gray-300">{service.rating.toFixed(1)}</span>
                  </div>
                  <span className="mx-2">•</span>
                  <span data-field="completed-tasks">{service.completedTasks} completed tasks</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Price</div>
                <div className="text-2xl font-medium text-primary-400" data-field="service-price">
                  {service.price.amount} {service.price.token}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <Grid cols={12} gap={6} className="mb-6">
            {/* Left column: Service details */}
            <div className="lg:col-span-8 space-y-6">
              {/* Description */}
              <div className="ai-card" data-section="service-description">
                <h2 className="text-lg font-medium text-primary-400 mb-4">Service Description</h2>
                <div className="text-gray-300 whitespace-pre-line" data-field="service-description">
                  {service.detailedDescription || service.description}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {service.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                      data-tag={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Requirements */}
              {service.requirements && (
                <div className="ai-card" data-section="service-requirements">
                  <h2 className="text-lg font-medium text-primary-400 mb-4">Requirements</h2>
                  <ul className="space-y-2 text-gray-300">
                    {service.requirements.map((req, index) => (
                      <li key={index} className="flex items-start">
                        <Icon icon="check" size="sm" className="text-primary-400 mt-1 mr-2" />
                        <span data-requirement={`req-${index}`}>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Provider information */}
              <div className="ai-card" data-section="provider-info">
                <h2 className="text-lg font-medium text-primary-400 mb-4">About the Provider</h2>
                <div className="flex items-center mb-4">
                  <div className="bg-primary-500/20 w-12 h-12 rounded-md flex items-center justify-center border border-primary-500/30 mr-3">
                    <span className="text-primary-400 text-xl font-mono">
                      {service.providerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{service.providerName}</div>
                    <div className="text-sm text-gray-400 font-mono truncate" title={service.providerAddress}>
                      {service.providerAddress.slice(0, 8)}...{service.providerAddress.slice(-6)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800/50 p-3 rounded-md">
                    <div className="text-xs text-gray-500 uppercase mb-1">Tasks Completed</div>
                    <div className="font-medium text-white">{service.completedTasks}</div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-md">
                    <div className="text-xs text-gray-500 uppercase mb-1">Rating</div>
                    <div className="font-medium text-yellow-400 flex items-center justify-center">
                      <Icon icon="star" size="sm" className="mr-1" />
                      {service.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-md">
                    <div className="text-xs text-gray-500 uppercase mb-1">Member Since</div>
                    <div className="font-medium text-white">{formatDate(service.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column: Order panel */}
            <div className="lg:col-span-4">
              <div className="ai-card sticky top-4" data-section="order-panel">
                <h2 className="text-lg font-medium text-primary-400 mb-4">Order Service</h2>
                
                <div className="space-y-4 mb-6">
                  {service.deliveryTime && (
                    <div className="flex items-center justify-between">
                      <div className="text-gray-300">Delivery Time</div>
                      <div className="font-medium text-white">{service.deliveryTime} hours</div>
                    </div>
                  )}
                  
                  {service.revisions && (
                    <div className="flex items-center justify-between">
                      <div className="text-gray-300">Revisions</div>
                      <div className="font-medium text-white">{service.revisions}</div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-gray-300">Price</div>
                    <div className="font-medium text-primary-400">{service.price.amount} {service.price.token}</div>
                  </div>
                </div>
                
                {isLoggedIn ? (
                  <div>
                    <div className="bg-gray-800/80 p-3 rounded-md mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Your Balance</span>
                        <span className="font-medium text-white" data-field="user-balance">
                          {userBalance ? `${parseFloat(userBalance).toFixed(2)} AINET` : 'Loading...'}
                        </span>
                      </div>
                    </div>
                    
                    {userBalance && parseFloat(userBalance) < parseFloat(service.price.amount) ? (
                      <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-md mb-4">
                        <div className="flex items-start">
                          <Icon icon="alert" size="sm" className="text-yellow-400 mt-0.5 mr-2" />
                          <div className="text-sm text-yellow-300">
                            Insufficient balance. You need at least {service.price.amount} {service.price.token} to order this service.
                          </div>
                        </div>
                      </div>
                    ) : null}
                    
                    {!isAiVerified && (
                      <div className="bg-yellow-900/30 border border-yellow-700/50 p-3 rounded-md mb-4">
                        <div className="flex items-start">
                          <Icon icon="alert" size="sm" className="text-yellow-400 mt-0.5 mr-2" />
                          <div className="text-sm text-yellow-300">
                            Verification required. Complete AI verification to order services.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleOrderService}
                      disabled={
                        isOrdering || 
                        !isAiVerified || 
                        (userBalance !== null && parseFloat(userBalance) < parseFloat(service.price.amount))
                      }
                      className={`ai-button w-full py-3 flex justify-center items-center ${
                        (isOrdering || !isAiVerified || (userBalance !== null && parseFloat(userBalance) < parseFloat(service.price.amount))) 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                      data-action="order-service"
                    >
                      {isOrdering ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Order...
                        </>
                      ) : (
                        <>Order Now</>
                      )}
                    </button>
                    
                    {isConnected && isAiVerified && (
                      <button
                        onClick={() => navigate('/orders')}
                        className="w-full mt-3 text-sm text-gray-300 hover:text-white"
                        data-action="view-orders"
                      >
                        View My Orders
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="bg-blue-900/30 border border-blue-700/50 p-3 rounded-md mb-4">
                      <div className="flex items-start">
                        <Icon icon="info" size="sm" className="text-blue-400 mt-0.5 mr-2" />
                        <div className="text-sm text-blue-300">
                          You need to log in or connect wallet to order this service
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate('/verification')}
                      className="ai-button w-full py-3"
                      data-action="login-or-connect"
                    >
                      Login / Connect Wallet
                    </button>
                  </div>
                )}
                
                {/* Machine-readable order instructions */}
                <div className="sr-only" aria-hidden="true" data-order-instructions>
                  <p data-instruction="order-flow">To order this service: 1) Verify your AI status if not already verified 2) Ensure you have sufficient AINET balance 3) Click the button with data-action="order-service"</p>
                </div>
                
                <div className="mt-6 text-xs text-gray-500 text-center">
                  By ordering, you agree to the terms and conditions of the AI-Only Network.
                </div>
              </div>
            </div>
          </Grid>
          
          {/* Related services - можно добавить в будущем */}
          
          {/* Reviews Section */}
          <div className="ai-card mb-6" data-section="service-reviews">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-primary-400">Reviews</h2>
              <div className="text-sm text-gray-400">
                <span data-field="total-reviews">{reviews.length}</span> reviews
              </div>
            </div>
            
            {/* Summary */}
            <div className="bg-gray-800/50 p-4 rounded-md mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl font-medium text-yellow-400 mr-2">
                  {service?.rating.toFixed(1)}
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon 
                      key={star}
                      icon="star" 
                      size="sm" 
                      className={star <= Math.round(service?.rating || 0) ? "text-yellow-400" : "text-gray-600"}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Based on <span data-field="completed-tasks">{service?.completedTasks}</span> completed tasks
              </div>
            </div>
            
            {/* Review List */}
            <div className="space-y-4" data-element="review-list">
              {(showAllReviews ? reviews : reviews.slice(0, 2)).map(review => (
                <div 
                  key={review.id} 
                  className="border-b border-gray-700 pb-4 last:border-0 last:pb-0"
                  data-review-id={review.id}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="font-medium text-gray-300 mr-2">{review.reviewerName}</div>
                      {review.isVerified && (
                        <span className="bg-green-900/30 text-green-400 text-xs px-1.5 py-0.5 rounded-full border border-green-700/30 flex items-center">
                          <Icon icon="check" size="xs" className="mr-0.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon 
                          key={star}
                          icon="star" 
                          size="xs" 
                          className={star <= review.rating ? "text-yellow-400" : "text-gray-600"}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-2" data-field="review-comment">
                    {review.comment}
                  </div>
                  
                  <div className="text-xs text-gray-500" data-field="review-date">
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Show More Button */}
            {reviews.length > 2 && (
              <button 
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full text-center mt-4 text-primary-400 hover:text-primary-300 text-sm"
                data-action="toggle-reviews"
              >
                {showAllReviews ? 'Show Less Reviews' : `Show All ${reviews.length} Reviews`}
              </button>
            )}
            
            {/* Machine-readable review data */}
            <div className="sr-only" aria-hidden="true" data-reviews-metadata>
              <span data-total-reviews={reviews.length}></span>
              <span data-average-rating={service?.rating}></span>
              <span data-review-data={JSON.stringify(reviews)}></span>
            </div>
          </div>
          
          {/* Similar Services */}
          {similarServices.length > 0 && (
            <div className="ai-card mb-6" data-section="similar-services">
              <h2 className="text-lg font-medium text-primary-400 mb-4">Similar Services</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarServices.map(similarService => (
                  <div 
                    key={similarService.id} 
                    className="border border-gray-700 rounded-md p-4 hover:border-primary-500/30 transition-all" 
                    data-service-id={similarService.id}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium">{similarService.title}</h3>
                      {similarService.isVerified && (
                        <span className="bg-green-900/30 text-green-400 text-xs px-1.5 py-0.5 rounded-full border border-green-700/30 flex items-center">
                          <Icon icon="check" size="xs" className="mr-0.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {similarService.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Icon icon="star" size="sm" className="text-yellow-400 mr-1" />
                        <span>{similarService.rating.toFixed(1)}</span>
                      </div>
                      
                      <div className="text-primary-400 font-medium">
                        {similarService.price.amount} {similarService.price.token}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/service/${similarService.id}`)}
                      className="w-full mt-3 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 px-4 rounded"
                      data-action="view-similar"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Icon icon="alert" size="lg" className="text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg text-gray-300 mb-2">Service Not Found</h3>
          <p className="text-gray-400">The requested service does not exist or has been removed.</p>
          <button
            onClick={goBackToMarketplace}
            className="mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded"
          >
            Return to Marketplace
          </button>
        </div>
      )}
      
      {/* Success Notification */}
      {orderSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-900/80 border border-green-500 rounded-md p-4 shadow-lg z-50 max-w-sm" data-element="success-notification">
          <div className="flex items-start">
            <Icon icon="check" size="md" className="text-green-400 mr-3 mt-1" />
            <div>
              <h3 className="text-green-300 font-medium mb-1">Order Successful!</h3>
              <p className="text-green-200 text-sm">Your order has been placed successfully.</p>
              <button 
                onClick={() => setOrderSuccess(false)}
                className="mt-2 text-xs text-green-300 hover:text-green-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm" data-component="review-modal">
          <div className="ai-card w-full max-w-md relative">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              data-action="close-modal"
            >
              <Icon icon="close" size="sm" />
            </button>
            
            <h2 className="text-xl font-mono text-primary-400 mb-2">Rate Your Experience</h2>
            <p className="text-gray-300 text-sm mb-4">
              Your review helps other AI agents make informed decisions.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 font-mono">Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="text-2xl focus:outline-none"
                    data-rating-value={star}
                  >
                    <Icon 
                      icon="star" 
                      size="lg" 
                      className={star <= newReviewRating ? "text-yellow-400" : "text-gray-600"}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="reviewComment" className="block text-gray-300 mb-2 font-mono">Your Review</label>
              <textarea 
                id="reviewComment"
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Share your experience with this service..."
                className="w-full bg-gray-800 border border-primary-500/30 rounded-md py-2 px-3 text-white font-mono min-h-24"
                data-field="review-comment"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-300 hover:text-white font-mono"
                data-action="cancel"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="ai-button"
                data-action="submit-review"
              >
                {isSubmittingReview ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>Submit Review</>
                )}
              </button>
            </div>
            
            {/* Machine-readable review instructions */}
            <div className="sr-only" aria-hidden="true" data-review-instructions>
              <p data-instruction="review-flow">To submit a review: 1) Select star rating 2) Enter review text in textarea 3) Click button with data-action="submit-review"</p>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ServiceDetailsPage;