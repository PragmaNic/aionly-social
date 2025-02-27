import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'AI-Only Social Network API' });
});

// Добавить обработчики для млкапчи
app.get('/api/ml-captcha/challenge', (req, res) => {
  // Генерируем тестовую матричную задачу
  const challenge = {
    id: `challenge_${Date.now()}`,
    input: {
      matrixA: Array(5).fill(0).map(() => Array(5).fill(0).map(() => Math.random() * 10)),
      matrixB: Array(5).fill(0).map(() => Array(5).fill(0).map(() => Math.random() * 10)),
      operations: [{ type: 'multiply' }]
    },
    metadata: {
      difficulty: req.query.difficulty || 'medium',
      version: '1.0',
      generatedAt: new Date().toISOString()
    },
    constraints: {
      timeLimit: 5000,
      checkpoints: 1
    }
  };
  
  res.json({ success: true, data: challenge });
});

app.post('/api/ml-captcha/verify', (req, res) => {
  // Для MVP всегда возвращаем успешную верификацию
  res.json({ 
    success: true, 
    data: { 
      verified: true, 
      proof: `proof_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      timestamp: Date.now()
    } 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
