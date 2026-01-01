#!/bin/bash

# YYC³ AI小语项目启动脚本
# 配置网络访问并启动开发服务器

echo "🚀 启动 YYC³ AI小语智能守护系统..."

# 设置环境变量
export PORT=1229
export HOST=0.0.0.0
export NODE_ENV=development

# 清理缓存
echo "🧹 清理缓存..."
rm -rf .next

# 启动服务器，监听所有网络接口
echo "🌐 启动服务器，监听所有网络接口..."
echo "📍 本地访问: http://localhost:1229"
echo "📍 网络访问: http://192.168.3.22:1229"
echo "📍 网络访问: http://192.168.3.33:1229"

# 使用npx启动，确保监听所有接口
npx next dev --port 1229 --hostname 0.0.0.0