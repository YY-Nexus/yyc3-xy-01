/**
 * @file FixedAIWidget.tsx
 * @description YYC³ AI小语智能成长守护系统AI小语助手组件，提供智能对话和交互功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { characterManager } from '@/lib/character-manager';
import { useChildrenMock } from '@/hooks/useChildren-mock';

// 类型定义
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WidgetState {
  isVisible: boolean;
  isMinimized: boolean;
  position: WidgetPosition;
}

// 生成唯一ID
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 获取初始位置
const getInitialPosition = (): WidgetPosition => {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0, width: 350, height: 500 };
  }
  
  const margin = 20;
  const width = 350;
  const height = 500;
  
  return {
    x: window.innerWidth - width - margin,
    y: window.innerHeight - height - margin,
    width,
    height
  };
};

const FixedAIWidget: React.FC = () => {
  const { currentChild } = useChildrenMock();
  
  const [state, setState] = useState<WidgetState>({
    isVisible: true,
    isMinimized: false,
    position: getInitialPosition()
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: '您好！我是AI小语，您的智能成长伙伴。有什么我可以帮助您的吗？',
      timestamp: Date.now()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自动滚动到最新消息
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 发送消息
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);
    
    try {
      // 模拟AI响应延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 添加AI回复
      const responses = [
        '感谢您的提问！我会尽快为您提供相关信息。',
        '这是一个很好的问题，让我帮您分析一下。',
        '根据我的理解，您可能需要考虑以下几个方面...',
        '我已记录您的需求，将为您制定相应的解决方案。',
        '为了更好地帮助您，请提供更多详细信息。'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: randomResponse,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，处理您的请求时出现了问题。请稍后再试。',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputValue]);
  
  // 切换最小化状态
  const toggleMinimize = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized
    }));
  }, []);
  
  // 关闭组件
  const handleClose = useCallback(() => {
    setState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);
  
  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 如果不可见则不渲染
  if (!state.isVisible) return null;
  
  return (
    <div
      className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        state.isMinimized 
          ? 'w-60 h-12 bottom-4 right-4' 
          : 'bottom-4 right-4'
      }`}
      style={{
        width: state.isMinimized ? undefined : state.position.width,
        height: state.isMinimized ? undefined : state.position.height,
        zIndex: 1000
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <img 
            src={characterManager.getAIAvatarPath(currentChild?.gender || 'female')} 
            alt="AI小语助手" 
            className="w-8 h-8 rounded-full object-cover border-2 border-white"
          />
          <span className="font-medium">AI小语助手</span>
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={toggleMinimize}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label={state.isMinimized ? "最大化" : "最小化"}
          >
            {state.isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      {!state.isMinimized && (
        <div className="flex flex-col h-[calc(100%-3rem)]">
          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* 输入区域 */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="输入您的问题..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={2}
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isProcessing}
                className="self-end px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 最小化状态下的显示 */}
      {state.isMinimized && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <MessageCircle size={18} />
            <span className="font-medium truncate">AI小语助手</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedAIWidget;