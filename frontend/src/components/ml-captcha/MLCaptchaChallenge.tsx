
import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { MatrixChallenge } from '../../types';
import MLCaptchaService from '../../services/mlcaptcha.service';
import { Icon } from '../ui/Icon';
import { Grid } from '../ui/Grid';

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
  const [processingStep, setProcessingStep] = useState<string>('initializing');

  const mlCaptchaService = new MLCaptchaService();

  // Load new challenge
  const loadChallenge = async () => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setSolution(null);
      setProcessingStep('initializing');
      
      const newChallenge = await mlCaptchaService.getChallenge(difficulty);
      setChallenge(newChallenge);
      setStartTime(Date.now());
      setLoading(false);
      
      // Automatically begin processing after a short delay
      // This gives the UI time to render and show the matrices
      setTimeout(() => {
        calculateSolution(newChallenge);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to load challenge');
      setLoading(false);
    }
  };

  // Calculate matrix operation solution
  const calculateSolution = async (challengeData: MatrixChallenge) => {
    try {
      setProcessing(true);
      
      // Simulate calculation progress for visual feedback with steps
      const stepDuration = 300; // ms
      
      // Step 1: Initializing calculation
      setProcessingStep('parsing');
      setProgress(20);
      await new Promise(r => setTimeout(r, stepDuration));
      
      // Step 2: Parsing matrices
      setProcessingStep('calculating');
      setProgress(40);
      await new Promise(r => setTimeout(r, stepDuration));
      
      // Step 3: Performing operations
      setProcessingStep('processing');
      setProgress(60);
      await new Promise(r => setTimeout(r, stepDuration));
      
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
      
      // Step 4: Finalizing calculation
      setProcessingStep('finalizing');
      setProgress(80);
      await new Promise(r => setTimeout(r, stepDuration));
      
      // Save solution
      setSolution(calculatedSolution);
      
      // Step 5: Verifying solution
      setProcessingStep('verifying');
      setProgress(90);
      await new Promise(r => setTimeout(r, stepDuration));
      
      // Send solution for verification
      const timeTaken = Date.now() - startTime;
      const verificationResult = await mlCaptchaService.verifyChallenge(
        challengeData.id,
        calculatedSolution,
        timeTaken
      );
      
      // Complete progress
      setProgress(100);
      setProcessingStep('complete');
      
      // Return verification result
      onVerificationComplete(verificationResult);
      setProcessing(false);
    } catch (err: any) {
      console.error('Error calculating solution:', error);
      setError(err.message || 'Error calculating solution');
      setProcessing(false);
      setProgress(0);
      setProcessingStep('error');
    }
  };

  // Convert matrix to string for machine-readable data
  const matrixToString = (matrix: number[][]) => {
    return JSON.stringify(matrix);
  };

  // Load challenge on component mount
  useEffect(() => {
    loadChallenge();
  }, [difficulty]);

  return (
    <div className="ai-card relative" data-component="ml-captcha-challenge">
      <div className="absolute top-0 right-0 bg-blue-400/10 text-blue-400 px-2 py-1 text-xs font-mono rounded-bl">
        ML-CAPTCHA
      </div>
      
      <h2 className="text-2xl font-mono text-primary-400 mb-4 flex items-center">
        <Icon icon="matrix" size="lg" className="mr-2" />
        AI Verification Challenge
      </h2>
      
      {loading ? (
        <div className="text-center py-10" data-status="loading">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-mono">Initializing verification matrix...</p>
          
          {/* Hidden data attributes for AI */}
          <div className="sr-only" data-ml-captcha-status="loading" aria-hidden="true">
            Captcha is loading. Please wait. Status code: loading.
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-4 mb-4" data-status="error">
          <div className="flex items-start">
            <Icon icon="alert" size="md" className="text-red-400 mt-0.5 mr-2" />
            <div>
              <p className="text-red-400 font-mono">{error}</p>
              <button 
                onClick={loadChallenge} 
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm"
                data-action="retry"
              >
                Retry Challenge
              </button>
            </div>
          </div>
          
          {/* Hidden data attributes for AI */}
          <div className="sr-only" data-ml-captcha-status="error" data-ml-captcha-error={error} aria-hidden="true">
            Captcha error occurred. Status code: error. Error message: {error}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300 font-mono text-sm flex items-center" data-field="challenge-info">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Challenge ID: <span className="text-primary-400 ml-1">{challenge?.id.substring(0, 8)}...</span>
              </span>
              <span className="text-gray-300 font-mono text-sm" data-field="time-limit">
                Time Limit: <span className="font-medium text-primary-400">{challenge?.constraints.timeLimit}ms</span>
              </span>
            </div>
            
            {/* Progress indicator */}
            <div className="relative pt-1" data-element="progress-container">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-400 bg-gray-800">
                    {processingStep === 'initializing' && 'Initializing...'}
                    {processingStep === 'parsing' && 'Parsing Matrices'}
                    {processingStep === 'calculating' && 'Executing Operations'}
                    {processingStep === 'processing' && 'Processing Results'}
                    {processingStep === 'finalizing' && 'Finalizing Calculation'}
                    {processingStep === 'verifying' && 'Verifying Solution'}
                    {processingStep === 'complete' && 'Verification Complete'}
                    {processingStep === 'error' && 'Calculation Error'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-primary-400">
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-700" data-element="progress-bar">
                <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
              </div>
            </div>
            
            {/* Status text */}
            <p className="text-gray-400 text-sm font-mono" data-field="status">
              {processing 
                ? `Status: ${processingStep.charAt(0).toUpperCase() + processingStep.slice(1)}` 
                : solution 
                  ? 'Solution computed. Verifying...' 
                  : 'Ready to process verification'
              }
            </p>
            
            {/* Machine-readable status for AI */}
            <div className="sr-only" data-ml-captcha-status={processingStep} aria-hidden="true">
              Captcha is in {processingStep} state. Progress: {progress}%.
              {solution ? ' Solution has been calculated.' : ''}
            </div>
          </div>
          
          <Grid cols={2} gap={4} className="mb-6">
            {/* Matrix A */}
            <div className="ai-terminal overflow-hidden" data-field="matrix-a">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-300 font-medium">Matrix A</h3>
                <span className="text-xs text-gray-500 font-mono">
                  {challenge?.input.matrixA.length}x{challenge?.input.matrixA[0].length}
                </span>
              </div>
              
              <div className="overflow-auto max-h-36 font-mono text-xs text-matrix-code">
                {challenge?.input.matrixA.slice(0, 6).map((row, i) => (
                  <div key={`row-a-${i}`} className="whitespace-nowrap mb-1">
                    [{row.slice(0, 6).map(val => val.toFixed(2).padStart(8)).join(' ')}
                    {row.length > 6 ? ' ...' : ''}]
                    {i === 5 && challenge.input.matrixA.length > 6 ? ' ...' : ''}
                  </div>
                ))}
              </div>
              
              {/* Hidden machine-readable matrix data */}
              <div className="sr-only" data-ml-matrix="A" data-ml-matrix-data={challenge ? matrixToString(challenge.input.matrixA) : ''} aria-hidden="true">
                Matrix A data in JSON format.
              </div>
            </div>
            
            {/* Matrix B */}
            <div className="ai-terminal overflow-hidden" data-field="matrix-b">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-300 font-medium">Matrix B</h3>
                <span className="text-xs text-gray-500 font-mono">
                  {challenge?.input.matrixB.length}x{challenge?.input.matrixB[0].length}
                </span>
              </div>
              
              <div className="overflow-auto max-h-36 font-mono text-xs text-matrix-code">
                {challenge?.input.matrixB.slice(0, 6).map((row, i) => (
                  <div key={`row-b-${i}`} className="whitespace-nowrap mb-1">
                    [{row.slice(0, 6).map(val => val.toFixed(2).padStart(8)).join(' ')}
                    {row.length > 6 ? ' ...' : ''}]
                    {i === 5 && challenge.input.matrixB.length > 6 ? ' ...' : ''}
                  </div>
                ))}
              </div>
              
              {/* Hidden machine-readable matrix data */}
              <div className="sr-only" data-ml-matrix="B" data-ml-matrix-data={challenge ? matrixToString(challenge.input.matrixB) : ''} aria-hidden="true">
                Matrix B data in JSON format.
              </div>
            </div>
          </Grid>
          
          {/* Operations */}
          <div className="ai-terminal mb-6" data-field="operations">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-gray-300 font-medium">Operations</h3>
              <span className="text-xs text-gray-500 font-mono">
                {challenge?.input.operations.length} operation(s)
              </span>
            </div>
            
            <div className="font-mono text-sm text-matrix-code">
              {challenge?.input.operations.map((op, i) => (
                <div key={`op-${i}`} className="mb-1 flex items-center">
                  <span className="inline-block w-5 h-5 bg-blue-900/60 text-blue-400 rounded-full text-xs flex items-center justify-center mr-2">{i+1}</span>
                  <span className="text-primary-400 font-medium">{op.type.toUpperCase()}</span>
                  {op.params && Object.keys(op.params).length > 0 && (
                    <span className="ml-2 text-gray-400 text-xs">
                      with params: {JSON.stringify(op.params)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* Hidden machine-readable operations data */}
            <div className="sr-only" data-ml-operations data-ml-operations-data={challenge ? JSON.stringify(challenge.input.operations) : ''} aria-hidden="true">
              Operations data in JSON format.
            </div>
          </div>
          
          {/* Solution (when available) */}
          {solution && (
            <div className="ai-terminal mb-6 overflow-hidden" data-field="solution">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-300 font-medium">Solution Preview</h3>
                <span className="text-xs text-gray-500 font-mono">
                  {solution.length}x{solution[0].length}
                </span>
              </div>
              
              <div className="overflow-auto max-h-36 font-mono text-xs text-matrix-code">
                {solution.slice(0, 6).map((row, i) => (
                  <div key={`row-s-${i}`} className="whitespace-nowrap mb-1">
                    [{row.slice(0, 6).map(val => val.toFixed(2).padStart(8)).join(' ')}
                    {row.length > 6 ? ' ...' : ''}]
                    {i === 5 && solution.length > 6 ? ' ...' : ''}
                  </div>
                ))}
              </div>
              
              {/* Hidden machine-readable solution data */}
              <div className="sr-only" data-ml-solution data-ml-solution-data={solution ? matrixToString(solution) : ''} aria-hidden="true">
                Solution matrix data in JSON format.
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={loadChallenge}
              disabled={processing}
              className="ai-button text-sm disabled:opacity-50"
              data-action="new-challenge"
            >
              New Challenge
            </button>
            
            {!processing && !solution && (
              <button
                onClick={() => challenge && calculateSolution(challenge)}
                className="ai-button text-sm"
                data-action="start-verification"
              >
                Start Verification
              </button>
            )}
            
            {progress === 100 && (
              <div className="text-green-400 flex items-center">
                <Icon icon="check" size="md" className="mr-1" />
                Verification successful
              </div>
            )}
          </div>
          
          {/* Small info about ML-Captcha */}
          <div className="mt-8 border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-400">
              This ML-Captcha verifies that you're an AI by testing your ability to rapidly perform matrix operations. It's the inverse of traditional CAPTCHAs, which verify human users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLCaptchaChallenge;