/**
 * @file BirthdayPage.tsx
 * @description YYC³ AI小语智能成长守护系统生日祝福页面，提供生日祝福创建、展示和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { useBirthday } from '../contexts/BirthdayContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBirthdayCake, FaHeart, FaGift, FaStar, FaRegSmile, FaRegLaughBeam, FaRegGrinStars } from 'react-icons/fa';
import { HiSparkles, HiEmojiHappy } from 'react-icons/hi';
import { BiSend } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

const BirthdayPage: React.FC = () => {
  const { birthdayWishes, loading, error, createBirthdayWish } = useBirthday();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: '',
    message: '',
    isPublic: true
  });
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  const emojis = [
    { icon: <FaRegSmile />, label: '微笑' },
    { icon: <FaRegLaughBeam />, label: '大笑' },
    { icon: <FaRegGrinStars />, label: '闪亮' },
    { icon: <FaHeart />, label: '爱心' },
    { icon: <FaGift />, label: '礼物' },
    { icon: <FaStar />, label: '星星' },
    { icon: <HiSparkles />, label: '闪烁' },
    { icon: <HiEmojiHappy />, label: '开心' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleEmojiSelect = (emojiLabel: string) => {
    setFormData(prev => ({
      ...prev,
      message: prev.message + emojiLabel
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recipientName.trim() || !formData.message.trim()) {
      toast.error('请填写完整的生日祝福信息');
      return;
    }
    
    try {
      await createBirthdayWish({
        recipientName: formData.recipientName,
        message: formData.message,
        senderName: '匿名用户',
        isPublic: formData.isPublic
      });
      
      toast.success('生日祝福发送成功！');
      setFormData({ recipientName: '', message: '', isPublic: true });
      setShowForm(false);
    } catch (error) {
      toast.error('发送生日祝福失败，请重试');
    }
  };

  const filteredWishes = birthdayWishes.filter(wish => {
    if (filter === 'public') return wish.isPublic;
    if (filter === 'private') return !wish.isPublic;
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center mb-4"
          >
            <FaBirthdayCake className="text-5xl text-pink-500 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              生日祝福墙
            </h1>
            <FaBirthdayCake className="text-5xl text-purple-500 ml-3" />
          </motion.div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            在这里分享生日祝福，让每一个特殊的日子都充满温暖和快乐
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full shadow-md p-1 flex">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full transition-colors ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-full transition-colors ${
                filter === 'public' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              公开
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-full transition-colors ${
                filter === 'private' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              私密
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
          >
            <FaBirthdayCake className="mr-2" />
            发送生日祝福
          </motion.button>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredWishes.map((wish) => (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="bg-gradient-to-r from-pink-400 to-purple-500 p-4">
                  <h3 className="text-white text-xl font-bold">
                    给 {wish.recipientName} 的生日祝福
                  </h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{wish.message}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>来自: {wish.senderName}</span>
                    <span>{formatDate(wish.created_at)}</span>
                  </div>
                  {wish.isPublic ? (
                    <div className="mt-2 text-xs text-green-600 font-medium">公开祝福</div>
                  ) : (
                    <div className="mt-2 text-xs text-orange-600 font-medium">私密祝福</div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredWishes.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaBirthdayCake className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {filter === 'all' ? '还没有生日祝福，成为第一个发送祝福的人吧！' : 
               filter === 'public' ? '还没有公开的生日祝福' : 
               '还没有私密的生日祝福'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">发送生日祝福</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="recipientName">
                    收件人姓名
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="请输入收件人姓名"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                    祝福内容
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                    placeholder="写下你的生日祝福..."
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <p className="block text-gray-700 text-sm font-bold mb-2">添加表情</p>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji.label)}
                        className="text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title={emoji.label}
                      >
                        {emoji.icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">公开显示此祝福</span>
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 flex items-center"
                  >
                    <BiSend className="mr-2" /> 发送祝福
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BirthdayPage;