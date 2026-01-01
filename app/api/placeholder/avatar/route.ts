/**
 * @file avatar/route.ts
 * @description YYC³ AI小语智能成长守护系统头像占位符API，提供默认头像占位符图像
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // 创建一个简单的SVG头像
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#avatarGradient)"/>
      <text x="50" y="55" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">AI</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400', // 缓存一天
    },
  });
}