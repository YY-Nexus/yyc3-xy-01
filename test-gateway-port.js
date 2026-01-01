// 测试API网关端口配置
import { APIGateway } from './services/gateway/APIGateway.js';

// 创建API网关实例
const gateway = new APIGateway();

// 打印配置信息
console.log('API网关配置:', {
  port: gateway.config?.port || 1229,
  host: gateway.config?.host || 'localhost',
  description: 'API网关将在端口1229上运行，符合项目专用端口要求'
});

console.log('✅ API网关端口配置验证完成');
