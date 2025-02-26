import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';
import { MatrixChallenge } from '../../types';
import MLCaptchaService from '../../services/mlcaptcha.service';

interface MLCaptchaChallengeProps {
  difficulty?: 'easy' | 'medium' | 'hard';
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

  // Загрузка нового вызова
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
      
      // Автоматически начинаем решение
      calculateSolution(newChallenge);
    } catch (err: any) {
      setError(err.message || 'Failed to load challenge');
      setLoading(false);
    }
  };

  // Вычисление решения матричной операции
  const calculateSolution = async (challengeData: MatrixChallenge) => {
    try {
      setProcessing(true);
      
      // Имитируем прогресс вычислений
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      // Извлекаем данные из вызова
      const { matrixA, matrixB } = challengeData.input;
      
      // Для простоты MVP используем только умножение матриц
      // В реальном приложении будет более сложная логика в зависимости от типа операции
// Получаем результат умножения матриц
const mathResult = math.multiply(matrixA, matrixB);

// Функция для обеспечения правильного формата матрицы
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

// Преобразуем результат в правильный формат матрицы
const calculatedSolution = ensureMatrix(mathResult);
      
      // Завершаем прогресс
      clearInterval(progressInterval);
      setProgress(100);
      
      // Сохраняем решение
      setSolution(calculatedSolution);
      
      // Отправляем решение на проверку
      const timeTaken = Date.now() - startTime;
      const verificationResult = await mlCaptchaService.verifyChallenge(
        challengeData.id,
        calculatedSolution,
        timeTaken
      );
      
      // Возвращаем результат верификации
      onVerificationComplete(verificationResult);
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || 'Error calculating solution');
      setProcessing(false);
      setProgress(0);
    }
  };

  // Загружаем вызов при монтировании компонента
  useEffect(() => {
    loadChallenge();
  }, [difficulty]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">AI Verification Challenge</h2>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading challenge...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={loadChallenge} 
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Difficulty: <span className="font-medium">{challenge?.metadata.difficulty}</span></span>
              <span className="text-gray-300">Time Limit: <span className="font-medium">{challenge?.constraints.timeLimit}ms</span></span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-gray-400 text-sm mt-1">
              {processing 
                ? 'Processing matrix operations...' 
                : solution 
                  ? 'Solution computed. Verifying...' 
                  : 'Ready to start verification'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded-md">
              <h3 className="text-gray-300 font-medium mb-2">Matrix A</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-gray-400">
                {challenge?.input.matrixA.slice(0, 5).map((row, i) => (
                  <div key={`row-a-${i}`} className="whitespace-nowrap">
                    [{row.slice(0, 5).map(val => val.toFixed(2)).join(', ')}
                    {row.length > 5 ? ', ...' : ''}]
                    {i === 4 && challenge.input.matrixA.length > 5 ? ' ...' : ''}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-900 p-4 rounded-md">
              <h3 className="text-gray-300 font-medium mb-2">Matrix B</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-gray-400">
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
          
          <div className="bg-gray-900 p-4 rounded-md mb-6">
            <h3 className="text-gray-300 font-medium mb-2">Operations</h3>
            <div className="font-mono text-sm text-gray-400">
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
            <div className="bg-gray-900 p-4 rounded-md mb-6">
              <h3 className="text-gray-300 font-medium mb-2">Solution Preview</h3>
              <div className="overflow-auto max-h-32 font-mono text-xs text-gray-400">
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
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white disabled:opacity-50"
            >
              New Challenge
            </button>
            
            {!processing && !solution && (
              <button
                onClick={() => calculateSolution(challenge!)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white"
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