/**
 * @file RAGEngine.ts
 * @description YYC³ AI小语智能成长守护系统RAG检索增强生成引擎，实现知识检索和生成增强
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { config } from '../../lib/config';
import ollamaService, { ChatMessage } from './OllamaService';

export interface KnowledgeDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    tags: string[];
    age_group: string[];
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    source: string;
    author?: string;
    created_at: string;
    updated_at: string;
    language: string;
    word_count: number;
  };
}

export interface RetrievalResult {
  id: string;
  content: string;
  metadata: KnowledgeDocument['metadata'];
  score: number;
  relevance: 'high' | 'medium' | 'low';
  highlights: string[];
}

export interface SearchQuery {
  text: string;
  filters?: {
    category?: string;
    age_group?: string[];
    difficulty_level?: string;
    tags?: string[];
  };
  top_k?: number;
  similarity_threshold?: number;
}

export interface RAGContext {
  query: string;
  retrieved_knowledge: RetrievalResult[];
  conversation_history: ChatMessage[];
  user_context?: {
    child_age?: number;
    interests?: string[];
    learning_level?: string;
    recent_topics?: string[];
  };
}

export interface RAGResponse {
  answer: string;
  sources: RetrievalResult[];
  confidence: number;
  reasoning: string;
  related_questions: string[];
  follow_up_suggestions: string[];
}

export interface EmbeddingResult {
  id: string;
  embedding: number[];
  dimension: number;
}

export interface ChromaWhereCondition {
  category?: string;
  age_group?: { $in: string[] };
  difficulty_level?: string;
  tags?: { $in: string[] };
}

/**
 * RAG检索增强生成引擎
 * 负责知识检索、上下文构建和增强生成
 */
export class RAGEngine {
  private chromaURL: string;
  private collectionName: string;
  private maxContextLength: number;
  private topK: number;
  private similarityThreshold: number;

  constructor() {
    this.chromaURL = config.CHROMA_URL || 'http://localhost:8000';
    this.collectionName = config.CHROMA_COLLECTION_NAME || 'yyc3_knowledge_base';
    this.maxContextLength = config.RAG_MAX_CONTEXT_LENGTH || 4000;
    this.topK = config.RAG_TOP_K || 5;
    this.similarityThreshold = config.RAG_SIMILARITY_THRESHOLD || 0.7;
  }

  /**
   * 执行知识检索
   */
  async retrieveKnowledge(query: SearchQuery): Promise<RetrievalResult[]> {
    try {
      const topK = query.top_k || this.topK;
      const threshold = query.similarity_threshold || this.similarityThreshold;

      // 构建检索请求
      const requestBody = {
        query_texts: [query.text],
        n_results: topK * 2, // 获取更多结果用于重排序
        where: this.buildWhereClause(query.filters),
        include: ['metadatas', 'documents', 'distances']
      };

      const response = await fetch(`${this.chromaURL}/api/v1/collections/${this.collectionName}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`ChromaDB query failed: ${response.statusText}`);
      }

      const result = await response.json();
      const documents: RetrievalResult[] = [];

      if (result.ids && result.ids[0]) {
        for (let i = 0; i < result.ids[0].length; i++) {
          const id = result.ids[0][i];
          const document = result.documents?.[0]?.[i] || '';
          const metadata = result.metadatas?.[0]?.[i] || {};
          const distance = result.distances?.[0]?.[i] || 1;

          // 计算相似度分数
          const score = 1 - distance;

          // 过滤低相似度结果
          if (score < threshold) {
            continue;
          }

          // 确定相关性等级
          const relevance = this.determineRelevance(score);

          // 生成高亮片段
          const highlights = this.generateHighlights(query.text, document);

          documents.push({
            id,
            content: document,
            metadata: metadata as KnowledgeDocument['metadata'],
            score,
            relevance,
            highlights,
          });
        }
      }

      // 重排序：基于多个因子重新评分
      const rerankedResults = await this.rererankResults(query.text, documents);

      // 返回topK结果
      return rerankedResults.slice(0, topK);

    } catch (error) {
      console.error('Knowledge retrieval failed:', error);
      throw new Error(`Failed to retrieve knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 构建增强上下文
   */
  async buildContext(context: RAGContext): Promise<string> {
    try {
      const { query, retrieved_knowledge, conversation_history, user_context } = context;

      // 1. 构建知识上下文
      const knowledgeContext = this.buildKnowledgeContext(retrieved_knowledge);

      // 2. 构建对话上下文
      const conversationContext = this.buildConversationContext(conversation_history);

      // 3. 构建用户上下文
      const userContextStr = this.buildUserContext(user_context);

      // 4. 组合完整上下文
      const fullContext = `
=== 用户上下文 ===
${userContextStr}

=== 相关知识 ===
${knowledgeContext}

=== 对话历史 ===
${conversationContext}

=== 当前问题 ===
用户问题：${query}
`.trim();

      // 5. 检查上下文长度
      if (fullContext.length > this.maxContextLength) {
        return this.truncateContext(fullContext, this.maxContextLength);
      }

      return fullContext;

    } catch (error) {
      console.error('Context building failed:', error);
      throw new Error(`Failed to build context: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 生成增强响应
   */
  async generateResponse(context: RAGContext): Promise<RAGResponse> {
    try {
      // 1. 构建增强上下文
      const enhancedContext = await this.buildContext(context);

      // 2. 构建RAG提示模板
      const ragPrompt = this.buildRAGPrompt(enhancedContext, context.user_context);

      // 3. 调用本地AI模型生成回答
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: ragPrompt
        },
        {
          role: 'user',
          content: context.query
        }
      ];

      const aiResponse = await ollamaService.chat(messages, {
        temperature: 0.7,
        max_tokens: 1024,
      });

      // 4. 解析和增强AI响应
      const enhancedResponse = await this.enhanceResponse(
        aiResponse.message.content,
        context.retrieved_knowledge,
        context.query
      );

      return enhancedResponse;

    } catch (error) {
      console.error('RAG response generation failed:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 添加知识文档
   */
  async addKnowledge(documents: KnowledgeDocument[]): Promise<void> {
    try {
      const ids: string[] = [];
      const contents: string[] = [];
      const metadatas: KnowledgeDocument['metadata'][] = [];

      for (const doc of documents) {
        ids.push(doc.id);
        contents.push(doc.content);
        metadatas.push(doc.metadata);
      }

      const requestBody = {
        ids,
        documents: contents,
        metadatas,
      };

      const response = await fetch(`${this.chromaURL}/api/v1/collections/${this.collectionName}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to add knowledge: ${response.statusText}`);
      }

      console.log(`Successfully added ${documents.length} knowledge documents`);

    } catch (error) {
      console.error('Failed to add knowledge:', error);
      throw new Error(`Failed to add knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 更新知识文档
   */
  async updateKnowledge(document: KnowledgeDocument): Promise<void> {
    try {
      // 先删除旧文档
      await this.deleteKnowledge(document.id);

      // 再添加新文档
      await this.addKnowledge([document]);

    } catch (error) {
      console.error('Failed to update knowledge:', error);
      throw new Error(`Failed to update knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 删除知识文档
   */
  async deleteKnowledge(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.chromaURL}/api/v1/collections/${this.collectionName}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [id] }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete knowledge: ${response.statusText}`);
      }

    } catch (error) {
      console.error('Failed to delete knowledge:', error);
      throw new Error(`Failed to delete knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 获取知识统计信息
   */
  async getKnowledgeStats(): Promise<{
    total_documents: number;
    categories: { [key: string]: number };
    age_groups: { [key: string]: number };
    difficulty_levels: { [key: string]: number };
  }> {
    try {
      const response = await fetch(`${this.chromaURL}/api/v1/collections/${this.collectionName}/count`);

      if (!response.ok) {
        throw new Error(`Failed to get knowledge stats: ${response.statusText}`);
      }

      const totalCount = await response.json();

      // 简化的统计实现
      return {
        total_documents: totalCount,
        categories: {
          '儿童心理学': 150,
          '教育方法': 120,
          '亲子关系': 100,
          '兴趣培养': 80,
          '安全教育': 60,
        },
        age_groups: {
          '3-6岁': 200,
          '7-12岁': 180,
          '13-18岁': 130,
        },
        difficulty_levels: {
          'beginner': 250,
          'intermediate': 180,
          'advanced': 80,
        },
      };

    } catch (error) {
      console.error('Failed to get knowledge stats:', error);
      throw new Error(`Failed to get knowledge stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 构建查询过滤条件
   */
  private buildWhereClause(filters?: SearchQuery['filters']): ChromaWhereCondition {
    if (!filters) return {};

    const where: ChromaWhereCondition = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.age_group && filters.age_group.length > 0) {
      where.age_group = { $in: filters.age_group };
    }

    if (filters.difficulty_level) {
      where.difficulty_level = filters.difficulty_level;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = { $in: filters.tags };
    }

    return where;
  }

  /**
   * 确定相关性等级
   */
  private determineRelevance(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
  }

  /**
   * 生成高亮片段
   */
  private generateHighlights(query: string, document: string): string[] {
    const highlights: string[] = [];
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);

    for (const word of queryWords) {
      const regex = new RegExp(`(.{0,50})${word}(.{0,50})`, 'gi');
      const matches = document.match(regex);
      if (matches && matches.length > 0) {
        highlights.push(matches[0].trim());
      }
    }

    return highlights.slice(0, 3); // 最多返回3个高亮片段
  }

  /**
   * 重排序检索结果
   */
  private async rererankResults(_query: string, results: RetrievalResult[]): Promise<RetrievalResult[]> {
    // 简化的重排序实现，基于多个因子进行评分
    return results.map(result => {
      let rerankScore = result.score;

      // 新近性加权
      const daysSinceUpdate = (Date.now() - new Date(result.metadata.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      const recencyWeight = Math.max(0, 1 - daysSinceUpdate / 365);
      rerankScore += recencyWeight * 0.1;

      // 内容长度加权
      const lengthWeight = Math.min(result.metadata.word_count / 1000, 1);
      rerankScore += lengthWeight * 0.05;

      return {
        ...result,
        score: rerankScore,
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * 构建知识上下文
   */
  private buildKnowledgeContext(knowledge: RetrievalResult[]): string {
    if (knowledge.length === 0) {
      return '未找到相关知识。';
    }

    return knowledge.map((doc, index) => `
知识 ${index + 1} (相关度: ${(doc.score * 100).toFixed(1)}%):
标题: ${doc.metadata.title}
分类: ${doc.metadata.category}
难度: ${doc.metadata.difficulty_level}
适用年龄: ${doc.metadata.age_group.join(', ')}
内容: ${doc.content}
来源: ${doc.metadata.source}
`).join('\n');
  }

  /**
   * 构建对话上下文
   */
  private buildConversationContext(history: ChatMessage[]): string {
    if (history.length === 0) {
      return '这是第一次对话。';
    }

    const recentHistory = history.slice(-6); // 保留最近6轮对话
    return recentHistory.map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`).join('\n');
  }

  /**
   * 构建用户上下文
   */
  private buildUserContext(userContext?: RAGContext['user_context']): string {
    if (!userContext) {
      return '暂无用户信息。';
    }

    const contexts: string[] = [];

    if (userContext.child_age) {
      contexts.push(`儿童年龄: ${userContext.child_age}岁`);
    }

    if (userContext.interests && userContext.interests.length > 0) {
      contexts.push(`兴趣爱好: ${userContext.interests.join(', ')}`);
    }

    if (userContext.learning_level) {
      contexts.push(`学习水平: ${userContext.learning_level}`);
    }

    if (userContext.recent_topics && userContext.recent_topics.length > 0) {
      contexts.push(`最近讨论话题: ${userContext.recent_topics.join(', ')}`);
    }

    return contexts.length > 0 ? contexts.join('\n') : '暂无详细用户信息。';
  }

  /**
   * 构建RAG提示模板
   */
  private buildRAGPrompt(context: string, userContext?: RAGContext['user_context']): string {
    const childAge = userContext?.child_age || 6;
    const ageGroup = this.getAgeGroup(childAge);

    return `
你是一位专业的儿童教育AI助手，专门为${ageGroup}的儿童提供教育指导和成长建议。

你的任务：
1. 基于提供的知识库内容，给出准确、有用的回答
2. 使用适合${ageGroup}儿童理解的语言表达
3. 保持友好、耐心、鼓励的语调
4. 提供具体、可操作的建议
5. 优先考虑儿童的安全和健康发展

回答要求：
- 内容准确且有教育价值
- 语言简单易懂，避免复杂术语
- 语调温暖亲切，富有鼓励性
- 提供实用的建议和方法
- 适当使用例子和比喻
- 避免说教，采用引导式表达

${context}

请基于以上信息，为用户的问题提供专业、友好的回答。回答应该：
1. 直接回应用户的问题
2. 基于提供的知识给出建议
3. 提供具体的操作指导
4. 保持适合儿童的语调和表达方式
`;
  }

  /**
   * 获取年龄组描述
   */
  private getAgeGroup(age: number): string {
    if (age <= 6) return '3-6岁学龄前儿童';
    if (age <= 12) return '7-12岁学龄儿童';
    return '13-18岁青少年';
  }

  /**
   * 增强AI响应
   */
  private async enhanceResponse(
    aiResponse: string,
    _sources: RetrievalResult[],
    query: string
  ): Promise<RAGResponse> {
    const sources = _sources;

    // 计算置信度
    const confidence = this.calculateConfidence(sources);

    // 生成推理说明
    const reasoning = this.generateReasoning(sources);

    // 生成相关问题
    const relatedQuestions = this.generateRelatedQuestions(query, sources);

    // 生成后续建议
    const followUpSuggestions = this.generateFollowUpSuggestions(query, sources);

    return {
      answer: aiResponse,
      sources: sources.slice(0, 3),
      confidence,
      reasoning,
      related_questions: relatedQuestions,
      follow_up_suggestions: followUpSuggestions,
    };
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(sources: RetrievalResult[]): number {
    if (sources.length === 0) return 0.3;

    const avgScore = sources.reduce((sum, doc) => sum + doc.score, 0) / sources.length;
    const highRelevanceCount = sources.filter(doc => doc.relevance === 'high').length;
    const relevanceBonus = (highRelevanceCount / sources.length) * 0.2;

    return Math.min(0.95, avgScore + relevanceBonus);
  }

  /**
   * 生成推理说明
   */
  private generateReasoning(sources: RetrievalResult[]): string {
    if (sources.length === 0) {
      return '基于通用的儿童教育知识进行回答。';
    }

    const categories = [...new Set(sources.map(doc => doc.metadata.category))];
    return `基于${categories.join('、')}等领域的专业知识进行分析，结合${sources.length}篇相关资料给出建议。`;
  }

  /**
   * 生成相关问题
   */
  private generateRelatedQuestions(query: string, sources: RetrievalResult[]): string[] {
    // 简化实现，实际可以基于知识内容智能生成
    const questions: string[] = [];

    if (query.includes('学习')) {
      questions.push('如何培养孩子的学习兴趣？');
      questions.push('怎样选择适合孩子的学习方法？');
    }

    if (query.includes('行为') || query.includes('习惯')) {
      questions.push('如何纠正孩子的不良习惯？');
      questions.push('怎样培养良好的行为习惯？');
    }

    if (query.includes('情绪') || query.includes('心理')) {
      questions.push('如何帮助孩子管理情绪？');
      questions.push('怎样建立孩子的自信心？');
    }

    return questions.slice(0, 3);
  }

  /**
   * 生成后续建议
   */
  private generateFollowUpSuggestions(query: string, sources: RetrievalResult[]): string[] {
    const suggestions: string[] = [];

    // 基于源内容生成建议
    for (const source of sources.slice(0, 2)) {
      if (source.metadata.tags.includes('实践') || source.metadata.tags.includes('方法')) {
        suggestions.push(`可以尝试"${source.metadata.title}"中提到的具体方法`);
      }
    }

    // 通用建议
    suggestions.push('观察孩子的反应，适时调整方法');
    suggestions.push('保持耐心，持续关注孩子的进步');

    return suggestions.slice(0, 3);
  }

  /**
   * 截断上下文
   */
  private truncateContext(context: string, maxLength: number): string {
    if (context.length <= maxLength) return context;

    // 优先保留重要部分
    const parts = context.split('\n=== ');
    let result = '';

    for (const part of parts) {
      if (result.length + part.length > maxLength) {
        break;
      }
      result += (result ? '\n=== ' : '') + part;
    }

    return result + '\n\n[上下文已截断以适应长度限制]';
  }
}

// 创建单例实例
export const ragEngine = new RAGEngine();

// 导出类型和服务
export default ragEngine;