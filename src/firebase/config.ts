/**
 * @file config.ts
 * @description YYC³ AI小语智能成长守护系统数据库配置文件，兼容原有Firebase接口的本地数据库配置
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 导入本地数据库客户端
import { db as localDb } from '../../lib/db/client';

// 为了保持与原Firebase代码的兼容性，重新导出本地数据库
export const db = localDb;

// 如果将来需要切换到Firebase，可以在这里配置Firebase
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

export default db;
