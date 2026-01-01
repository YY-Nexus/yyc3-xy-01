import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase/config';

interface BirthdayWish {
  id: string;
  recipientName: string;
  message: string;
  senderName: string;
  created_at: string;  // 改为 created_at 以匹配数据库字段
  isPublic: boolean;
}

interface BirthdayContextType {
  birthdayWishes: BirthdayWish[];
  loading: boolean;
  error: string | null;
  createBirthdayWish: (wish: Omit<BirthdayWish, 'id' | 'created_at'>) => Promise<void>;
  fetchBirthdayWishes: () => Promise<void>;
  updateBirthdayWish: (id: string, updates: Partial<BirthdayWish>) => Promise<void>;
  deleteBirthdayWish: (id: string) => Promise<void>;
}

const BirthdayContext = createContext<BirthdayContextType | undefined>(undefined);

export const useBirthday = () => {
  const context = useContext(BirthdayContext);
  if (!context) {
    throw new Error('useBirthday must be used within a BirthdayProvider');
  }
  return context;
};

interface BirthdayProviderProps {
  children: ReactNode;
}

export const BirthdayProvider: React.FC<BirthdayProviderProps> = ({ children }) => {
  const [birthdayWishes, setBirthdayWishes] = useState<BirthdayWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBirthdayWishes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const birthdayWishes = await db.findMany<BirthdayWish>('birthdayWishes');
      setBirthdayWishes(birthdayWishes);
    } catch (err) {
      console.error('获取生日祝福失败:', err);
      setError('获取生日祝福失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const createBirthdayWish = async (wish: Omit<BirthdayWish, 'id' | 'created_at'>) => {
    try {
        const newWish = await db.create('birthdayWishes', wish);
        setBirthdayWishes(prev => [newWish, ...prev]);
      } catch (err) {
        console.error('创建生日祝福失败:', err);
        setError('创建生日祝福失败，请稍后再试');
      }
  };

  const updateBirthdayWish = async (id: string, updates: Partial<BirthdayWish>) => {
    try {
      // 转换字段名以匹配数据库格式
      const dbUpdates: any = { ...updates };
      if ('created_at' in updates) {
        dbUpdates.created_at = updates.created_at;
      }
      
      await db.update('birthdayWishes', id, dbUpdates);
      setBirthdayWishes(prev => 
        prev.map(wish => wish.id === id ? { ...wish, ...updates } : wish)
      );
    } catch (err) {
      console.error('更新生日祝福失败:', err);
      setError('更新生日祝福失败，请稍后再试');
    }
  };

    const deleteBirthdayWish = async (id: string) => {
      try {
        await db.delete('birthdayWishes', id);
        setBirthdayWishes(prev => prev.filter(wish => wish.id !== id));
      } catch (err) {
        console.error('删除生日祝福失败:', err);
        setError('删除生日祝福失败，请稍后再试');
      }
    };

  useEffect(() => {
    fetchBirthdayWishes();
  }, []);

  const value: BirthdayContextType = {
    birthdayWishes,
    loading,
    error,
    createBirthdayWish,
    fetchBirthdayWishes,
    updateBirthdayWish,
    deleteBirthdayWish
  };

  return (
    <BirthdayContext.Provider value={value}>
      {children}
    </BirthdayContext.Provider>
  );
};

export default BirthdayContext;
