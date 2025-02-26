// src/services/mlcaptcha.service.ts
import axios from 'axios';
import { MatrixChallenge, VerificationResult } from '../types';

// URL API для ML-Captcha
const API_BASE_URL = 'http://localhost:3000/api/ml-captcha';

// Сервис для взаимодействия с ML-Captcha API
class MLCaptchaService {
  // Получение нового captcha вызова
  public async getChallenge(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<MatrixChallenge> {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge`, {
        params: { difficulty },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get challenge');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching challenge:', error);
      throw new Error(error.message || 'Failed to fetch challenge');
    }
  }

  // Проверка решения
  public async verifyChallenge(
    challengeId: string,
    solution: number[][],
    timeTaken: number
  ): Promise<VerificationResult> {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify`, {
        challengeId,
        solution,
        timeTaken,
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Verification failed');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Error verifying challenge:', error);
      throw new Error(error.message || 'Verification failed');
    }
  }
}

// Экспортируем экземпляр сервиса
export default MLCaptchaService;