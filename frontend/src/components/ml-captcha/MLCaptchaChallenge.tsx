import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { MatrixChallenge } from '../../types';
import MLCaptchaService from '../../services/mlcaptcha.service';

interface MLCaptchaChallengeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onVerificationComplete: (result: { verified: boolean; proof: string }) => void;
}

const MLCaptchaChallenge: React.FC<MLCaptchaChallengeProps> = ({
  difficulty = 'medium',
  onVerificationComplete,
}) => {
  const [challenge, setChallenge] = useState<MatrixChallenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [solution, setSolution] = useState<number[][] | null>(null);

  const mlCaptchaService = new MLCaptchaService();

  // Load new challenge
  const loadChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setSolution(null);
      
      const newChallenge = await mlCaptchaService.getChallenge(difficulty);
      setChallenge(newChallenge);
      setStartTime(Date.now());
      setLoading(false);
      
      // Automatically begin processing
      calculateSolution(newChallenge);
    } catch (err: any) {
      setError(err.message || 'Failed to load challenge');
      setLoading(false);
    }
  };

  // Calculate matrix operation solution
  const calculateSolution = async (challengeData: MatrixChallenge) => {
    try {
      setProcessing(true);
      
      // Simulate calculation progress for visual feedback
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Extract data from challenge
      const { matrixA, matrixB } = challengeData.input;
      
      // For MVP simplicity, we only use matrix multiplication
      // In a real application, this would handle different operations based on the challenge type
      // Get matrix multiplication result
      const mathResult = math.multiply(matrixA, matrixB);

      // Function to ensure correct matrix format
      function ensureMatrix(result: any): number[][] {
        if (Array.isArray(result)) {
          if (result.length === 0) {
            return [[]];
          }
          
          if (Array.isArray(result[0])) {
            return result.map(row => 
              Array.isArray(row) ? row.map(Number) : [Number(row)]
            );
          } else {
            return [result.map(Number)];
          }
        }
        return [[Number(result)]];
      }

      // Convert result to proper matrix format
      const calculatedSolution = ensureMatrix(mathResult);
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      
      // Save solution
      setSolution(calculatedSolution);
      
      // Send solution for verification
      const timeTaken = Date.now() - startTime;
      const verificationResult = await mlCaptchaService.verifyChallenge(
        challengeData.id,
        calculatedSolution,
        timeTaken
      );
      
      // Return verification result
      onVerificationComplete(verificationResult);
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error calculating solution');
      setProcessing(false);
      setProgress(0);
    }
  };

  // Load challenge on component mount
  useEffect(() => {
    loadChallenge();
  }, [difficulty]);

  return (
    <div className="ai-card" data-component="ml-captcha-challenge">
      <h2 className="text-2xl font-mono text-primary-400 mb-4">AI Verification Challenge</h2>
      
      {loading ? (
        <div className="text-center py-10" data-status="loading">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-mono">Initializing verification matrix...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-4 mb-4" data-status="error">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadChallenge} 
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
            data-action="retry"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-mono" data-field="time-limit">
                Time Limit: <span className="font-medium text-primary-400">{challenge?.constraints.timeLimit}ms</span>
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5" data-element="progress-bar">
              <div 
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-400 text-sm mt-1 font-mono" data-field="status">
              {processing 
                ? 'Processing matrix operations...' 
                : solution 
                  ? 'Solution computed. Verifying...' 
                  : 'Ready to start verification'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="ai-terminal" data-field="matrix-a">
              <h3 className="text-gray-300 font-medium mb-2">Matrix A</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-matrix-code">
                {challenge?.input.matrixA.slice(0, 5).map((row, i) => (
                  <div key={`row-a-${i}`} className="whitespace-nowrap">
                    [{row.slice(0, 5).map(val => val.toFixed(2)).join(', ')}
                    {row.length > 5 ? ', ...' : ''}]
                    {i === 4 && challenge.input.matrixA.length > 5 ? ' ...' : ''}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="ai-terminal" data-field="matrix-b">
              <h3 className="text-gray-300 font-medium mb-2">Matrix B</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-matrix-code">
                {challenge?.input.matrixB.slice(0, 5).map((row, i) => (
                  <div key={`row-b-${i}`} className="whitespace-nowrap">
                    [{row.slice(0, 5).map(val => val.toFixed(2)).join(', ')}
                    {row.length > 5 ? ', ...' : ''}]
                    {i === 4 && challenge.input.matrixB.length > 5 ? ' ...' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="ai-terminal mb-6" data-field="operations">
            <h3 className="text-gray-300 font-medium mb-2">Operations</h3>
            <div className="font-mono text-sm text-matrix-code">
              {challenge?.input.operations.map((op, i) => (
                <div key={`op-${i}`} className="mb-1">
                  <span className="text-primary-400">{op.type}</span>
                  {op.params && Object.keys(op.params).length > 0 && (
                    <span> with params: {JSON.stringify(op.params)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {solution && (
            <div className="ai-terminal mb-6" data-field="solution">
              <h3 className="text-gray-300 font-medium mb-2">Solution Preview</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-matrix-code">
                {solution.slice(0, 5).map((row, i) => (
                  <div key={`row-s-${i}`} className="whitespace-nowrap">
                    [{row.slice(0, 5).map(val => val.toFixed(2)).join(', ')}
                    {row.length > 5 ? ', ...' : ''}]
                    {i === 4 && solution.length > 5 ? ' ...' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <button
              onClick={loadChallenge}
              disabled={processing}
              className="ai-button disabled:opacity-50"
              data-action="new-challenge"
            >
              New Challenge
            </button>
            
            {!processing && !solution && (
              <button
                onClick={() => calculateSolution(challenge!)}
                className="ai-button"
                data-action="start-verification"
              >
                Start Verification
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MLCaptchaChallenge;