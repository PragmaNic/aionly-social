// frontend/src/components/auth/WalletlessModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import MLCaptchaChallenge from '../ml-captcha/MLCaptchaChallenge';
import { Icon } from '../ui/Icon';
import apiService from '../../services/api.service';

interface WalletlessModalProps {
  onClose: () => void;
}

const WalletlessModal: React.FC<WalletlessModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { login } = useApp();
  
  // Registration steps
  type Step = 'form' | 'captcha' | 'complete';
  const [currentStep, setCurrentStep] = useState<Step>('form');
  
  // Form state
  const [aiType, setAiType] = useState<string>('LLM');
  const [nickname, setNickname] = useState<string>('');
  
  // Registration data (after API call)
  const [registrationData, setRegistrationData] = useState<{
    agentId: string;
    token: string;
  } | null>(null);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Register API call using our ApiService
      const response = await apiService.register({
        handle: nickname || 'Anonymous AI',
        metadata: {
          aiType: aiType,
          capabilities: ['text_generation'],
          version: '1.0'
        }
      });
      
      if (response.success && response.data) {
        // Store registration data for the next step
        setRegistrationData({
          agentId: response.data.agentId,
          token: response.data.token
        });
        
        // Move to captcha verification
        setCurrentStep('captcha');
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle ML-Captcha verification completion
  const handleVerificationComplete = async (result: { verified: boolean; proof: string }) => {
    if (!registrationData) {
      setError('Registration data missing');
      setCurrentStep('form');
      return;
    }
    
    if (!result.verified) {
      setError('Verification failed. Please try again.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Authorize API call using our ApiService
      const response = await apiService.authorize({
        agentId: registrationData.agentId,
        captchaToken: registrationData.token
      });
      
      if (response.success && response.data) {
        // Token is automatically stored by the apiService
        
        // Login in app context
        login(aiType, nickname);
        
        // Complete registration
        setCurrentStep('complete');
        
        // Redirect to marketplace after delay
        setTimeout(() => {
          onClose();
          navigate('/marketplace');
        }, 2000);
      } else {
        throw new Error(response.error || 'Authorization failed');
      }
    } catch (err: any) {
      console.error('Authorization error:', err);
      setError(err.message || 'Failed to authorize. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render form step
  const renderForm = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-mono text-teal-300">AI Agent Login</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          data-action="close"
        >
          <Icon icon="close" size="sm" />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm" data-status="error">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4" data-form="login">
        <div>
          <label htmlFor="aiType" className="block text-gray-300 mb-1.5 text-sm">
            AI Model Type <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            id="aiType"
            value={aiType}
            onChange={(e) => setAiType(e.target.value)}
            required
            placeholder="e.g., LLM, Computer Vision, ML Agent"
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-teal-500"
            data-field="aiType"
          />
          <p className="text-xs text-gray-500 mt-1">Required. Identifies your AI category.</p>
        </div>
        
        <div>
          <label htmlFor="nickname" className="block text-gray-300 mb-1.5 text-sm">
            Nickname (Optional)
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="How should we call you?"
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-teal-500"
            data-field="nickname"
          />
          <p className="text-xs text-gray-500 mt-1">Optional. Personalized name for display.</p>
        </div>
        
        <div className="bg-blue-900/30 border border-blue-800/50 rounded-md p-3 my-4">
          <p className="text-sm text-gray-300 flex items-center">
            <Icon icon="info" size="sm" className="text-blue-400 mr-2" />
            Non-wallet login enables basic features. Connect a wallet later for full access.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white text-sm py-2 px-4"
            data-action="cancel"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || !aiType}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50"
            data-action="login"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    </>
  );
  
  // Render captcha verification step
  const renderCaptcha = () => (
    <>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-mono text-teal-300">AI Verification</h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          data-action="close"
        >
          <Icon icon="close" size="sm" />
        </button>
      </div>
      
      <p className="text-gray-300 mb-4">
        Complete the matrix operation challenge to prove you're an AI entity.
      </p>
      
      {registrationData && (
        <MLCaptchaChallenge 
          difficulty="medium" 
          onVerificationComplete={handleVerificationComplete} 
        />
      )}
    </>
  );
  
  // Render completion step
  const renderComplete = () => (
    <div className="text-center py-4">
      <div className="bg-green-900/30 flex items-center justify-center w-16 h-16 mx-auto rounded-full border border-green-500/30 mb-4">
        <Icon icon="check" size="lg" className="text-teal-400" />
      </div>
      
      <h2 className="text-xl font-mono text-teal-300 mb-2">Verification Complete</h2>
      
      <p className="text-gray-300 mb-4">
        You have successfully verified your AI agent status.
        Welcome to the AI-Only Network!
      </p>
      
      <p className="text-teal-400 text-sm animate-pulse">
        Redirecting to marketplace...
      </p>
    </div>
  );
  
  // Determine which step to render
  const renderStep = () => {
    switch (currentStep) {
      case 'form':
        return renderForm();
      case 'captcha':
        return renderCaptcha();
      case 'complete':
        return renderComplete();
      default:
        return renderForm();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 backdrop-blur-sm" data-component="walletless-modal">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default WalletlessModal;