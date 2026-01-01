/**
 * @file BirthdayTestPage.tsx
 * @description YYC³ AI小语智能成长守护系统生日祝福测试页面，提供生日祝福功能的测试和演示
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, TextField, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CakeIcon from '@mui/icons-material/Cake';
import { useAuth } from '../contexts/AuthContext';
import { useBirthday } from '../contexts/BirthdayContext';

interface BirthdayWish {
  id: string;
  recipientName: string;
  message: string;
  senderName: string;
  createdAt: string;
  isPublic: boolean;
}

const BirthdayTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    birthdayWishes, 
    loading, 
    error, 
    createBirthdayWish, 
    fetchBirthdayWishes,
    updateBirthdayWish,
    deleteBirthdayWish
  } = useBirthday();

  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchBirthdayWishes();
  }, [fetchBirthdayWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !message.trim()) {
      return;
    }

    setSubmitting(true);
    setSuccessMessage('');

    try {
      await createBirthdayWish({
        recipientName: recipientName.trim(),
        message: message.trim(),
        senderName: user?.displayName || '匿名用户',
        isPublic
      });

      setRecipientName('');
      setMessage('');
      setIsPublic(true);
      setSuccessMessage('生日祝福发送成功！');
    } catch (err) {
      console.error('发送生日祝福失败:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWish = async (wishId: string) => {
    try {
      await deleteBirthdayWish(wishId);
      setSuccessMessage('祝福已删除');
    } catch (err) {
      console.error('删除祝福失败:', err);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          返回
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <CakeIcon sx={{ mr: 1 }} />
          生日祝福测试
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            发送生日祝福
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="收件人姓名"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="祝福语"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                type="button"
                variant={isPublic ? 'contained' : 'outlined'}
                onClick={() => setIsPublic(true)}
                sx={{ mr: 1 }}
              >
                公开
              </Button>
              <Button
                type="button"
                variant={!isPublic ? 'contained' : 'outlined'}
                onClick={() => setIsPublic(false)}
              >
                私密
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? '发送中...' : '发送祝福'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            生日祝福列表
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : birthdayWishes.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              暂无生日祝福
            </Typography>
          ) : (
            birthdayWishes.map((wish: BirthdayWish) => (
              <Card key={wish.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        致 {wish.recipientName}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {wish.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        来自: {wish.senderName} | {new Date(wish.createdAt).toLocaleString()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color={wish.isPublic ? 'primary' : 'secondary'}>
                          {wish.isPublic ? '公开' : '私密'}
                        </Typography>
                      </Box>
                    </Box>
                    {user && (wish.senderName === user.displayName || user.email === 'admin@yyc3.cn') && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteWish(wish.id)}
                      >
                        删除
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BirthdayTestPage;
