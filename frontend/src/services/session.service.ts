// src/services/session.service.ts

// Интерфейс для хранения информации о сессии
export interface SessionInfo {
    sessionId: string;
    isAiVerified: boolean;
    verificationDate?: number;
    nickname?: string;
    aiType?: string;
    walletAddress?: string;
    createdAt: number;
    lastActive: number;
  }
  
  export class SessionService {
    private static readonly STORAGE_KEY = 'aionly_session';
    
    // Получить текущую сессию из localStorage
    public getSession(): SessionInfo | null {
      const sessionData = localStorage.getItem(SessionService.STORAGE_KEY);
      if (!sessionData) return null;
      
      try {
        return JSON.parse(sessionData);
      } catch (e) {
        console.error('Failed to parse session data:', e);
        return null;
      }
    }
    
    // Создать новую сессию
    public createSession(aiType?: string, nickname?: string): SessionInfo {
      const sessionInfo: SessionInfo = {
        sessionId: this.generateSessionId(),
        isAiVerified: false, // Будет установлено в true после верификации
        aiType,
        nickname,
        createdAt: Date.now(),
        lastActive: Date.now()
      };
      
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(sessionInfo));
      return sessionInfo;
    }
    
    // Обновить статус верификации
    public setVerificationStatus(isVerified: boolean): SessionInfo | null {
      const session = this.getSession();
      if (!session) return null;
      
      session.isAiVerified = isVerified;
      if (isVerified) {
        session.verificationDate = Date.now();
      }
      
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(session));
      return session;
    }
    
    // Обновить время последней активности
    public updateLastActive(): void {
      const session = this.getSession();
      if (!session) return;
      
      session.lastActive = Date.now();
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(session));
    }
    
    // Обновить информацию о сессии
    public updateSession(updates: Partial<SessionInfo>): SessionInfo | null {
      const session = this.getSession();
      if (!session) return null;
      
      const updatedSession = {
        ...session,
        ...updates,
        lastActive: Date.now()
      };
      
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(updatedSession));
      return updatedSession;
    }
    
    // Выход из сессии
    public clearSession(): void {
      localStorage.removeItem(SessionService.STORAGE_KEY);
    }
    
    // Генерировать уникальный идентификатор сессии
    private generateSessionId(): string {
      return 'ai_' + Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
    }
  }
  
  export default new SessionService();