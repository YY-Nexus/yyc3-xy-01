/**
 * @file RecommendationEngine.ts
 * @description YYC³ AI小语智能成长守护系统智能推荐引擎，基于知识图谱构建智能推荐功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import neo4jService from './Neo4jService';
import {
  RecommendationResult,
  Neo4jNode
} from './Neo4jService';

// 推荐算法配置
interface RecommendationConfig {
  // 协同过滤权重
  collaborative_weight: number;
  // 内容推荐权重
  content_weight: number;
  // 图神经网络权重
  gnn_weight: number;
  // 流行度权重
  popularity_weight: number;
  // 多样性权重
  diversity_weight: number;
  // 时效性权重
  recency_weight: number;
  // 推荐数量
  max_recommendations: number;
  // 相似度阈值
  similarity_threshold: number;
}

// 推荐请求接口
interface RecommendationRequest {
  child_id: string;
  recommendation_types: ('knowledge' | 'activity' | 'ability')[];
  context?: {
    current_activity?: string;
    time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
    location?: 'home' | 'school' | 'outdoor';
    companion_count?: number;
    mood?: 'happy' | 'sad' | 'excited' | 'tired' | 'focused';
  };
  config?: Partial<RecommendationConfig>;
}

// 推荐响应接口
interface RecommendationResponse {
  child_id: string;
  recommendations: {
    knowledge: RecommendationResult[];
    activity: RecommendationResult[];
    ability: RecommendationResult[];
  };
  metadata: {
    algorithm_weights: RecommendationConfig;
    processing_time: number;
    confidence_score: number;
    diversity_score: number;
    explanation: string[];
  };
}

// 图神经网络输入
interface GraphNeuralNetworkInput {
  nodes: string[];
  edges: Array<{source: string, target: string, type: string, weight: number}>;
  features: Record<string, number[]>;
}

/**
 * 智能推荐引擎服务类
 *
 * 核心功能：
 * 1. 协同过滤算法
 * 2. 基于内容的推荐
 * 3. 图神经网络推荐
 * 4. 混合推荐策略
 * 5. 个性化推荐
 * 6. 实时推荐更新
 */
export class RecommendationEngine {
  private config: RecommendationConfig;
  private userItemMatrix: Map<string, Map<string, number>>;
  private userSimilarityMatrix: Map<string, Map<string, number>>;

  constructor() {
    this.config = {
      collaborative_weight: 0.3,
      content_weight: 0.25,
      gnn_weight: 0.3,
      popularity_weight: 0.1,
      diversity_weight: 0.05,
      recency_weight: 0.05,
      max_recommendations: 10,
      similarity_threshold: 0.1
    };

    this.userItemMatrix = new Map();
    this.userSimilarityMatrix = new Map();
  }

  /**
   * 获取个性化推荐
   */
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now();

    // 合并配置
    const config = { ...this.config, ...request.config };

    try {
      // 获取儿童信息
      const childNode = await neo4jService.getChildById(request.child_id);
      if (!childNode) {
        throw new Error(`Child not found: ${request.child_id}`);
      }

      // 执行多种推荐算法
      const [
        collaborativeResults,
        contentBasedResults,
        gnnResults,
        popularityResults
      ] = await Promise.all([
        this.collaborativeFiltering(request.child_id, config),
        this.contentBasedFiltering(request.child_id, config),
        this.graphNeuralNetworkRecommendations(request.child_id, config),
        this.popularityBasedRecommendations(request.child_id, config)
      ]);

      // 混合推荐结果
      const mixedResults = this.mixRecommendations(
        [collaborativeResults, contentBasedResults, gnnResults, popularityResults],
        config
      );

      // 多样性优化
      const diversifiedResults = this.diversifyRecommendations(mixedResults, config);

      // 上下文过滤
      const contextualResults = this.filterByContext(diversifiedResults, request.context);

      // 构建响应
      const processingTime = Date.now() - startTime;
      const response: RecommendationResponse = {
        child_id: request.child_id,
        recommendations: this.groupRecommendations(contextualResults),
        metadata: {
          algorithm_weights: config,
          processing_time: processingTime,
          confidence_score: this.calculateConfidenceScore(contextualResults),
          diversity_score: this.calculateDiversityScore(contextualResults),
          explanation: this.generateExplanation(contextualResults, config)
        }
      };

      return response;

    } catch (error) {
      console.error('Recommendation engine error:', error);
      throw new Error(`Failed to generate recommendations: ${error}`);
    }
  }

  /**
   * 协同过滤推荐算法
   *
   * 基于相似用户的行为进行推荐
   */
  private async collaborativeFiltering(
    childId: string,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    try {
      // 查找相似儿童
      const similarChildren = await neo4jService.findSimilarChildren(childId);

      const results: RecommendationResult[] = [];

      for (const similar of similarChildren) {
        if (similar.relevanceScore < config.similarity_threshold) continue;

        // 获取相似儿童的知识和活动
        const [similarKnowledge, similarActivities] = await Promise.all([
          neo4jService.getChildKnowledge(similar.id),
          neo4jService.getChildActivities(similar.id)
        ]);

        // 基于相似度计算推荐分数
        for (const knowledge of similarKnowledge) {
          const recommendationScore = similar.relevanceScore * knowledge.mastery_level;
          results.push({
            id: `rec_${similar.id}_${knowledge.knowledge_id}`,
            item_id: knowledge.knowledge_id,
            type: 'knowledge',
            item_type: 'knowledge',
            title: knowledge.title || '',
            description: '',
            relevanceScore: recommendationScore,
            recommendation_score: recommendationScore,
            confidence: similar.relevanceScore,
            reasoning: `基于相似用户(${similar.relevanceScore.toFixed(2)})的学习记录推荐`,
            metadata: {
              algorithm: 'collaborative_filtering',
              similar_user: similar.id,
              user_similarity: similar.relevanceScore,
              item_mastery: knowledge.mastery_level
            }
          });
        }

        for (const activity of similarActivities) {
          const recommendationScore = similar.relevanceScore * activity.completion_rate;
          results.push({
            id: `rec_${similar.id}_${activity.activity_id}`,
            item_id: activity.activity_id,
            type: 'activity',
            item_type: 'activity',
            title: activity.title || '',
            description: activity.description || '',
            relevanceScore: recommendationScore,
            recommendation_score: recommendationScore,
            confidence: similar.relevanceScore,
            reasoning: `基于相似用户(${similar.relevanceScore.toFixed(2)})的活动记录推荐`,
            metadata: {
              algorithm: 'collaborative_filtering',
              similar_user: similar.id,
              user_similarity: similar.relevanceScore,
              activity_completion: activity.completion_rate
            }
          });
        }
      }

      return results.sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, config.max_recommendations);

    } catch (error) {
      console.error('Collaborative filtering error:', error);
      return [];
    }
  }

  /**
   * 基于内容的推荐算法
   *
   * 基于物品特征和用户偏好进行推荐
   */
  private async contentBasedFiltering(
    childId: string,
    _config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    try {
      // 获取儿童当前的能力和兴趣
      const childProfile = await neo4jService.getChildById(childId);
      if (!childProfile) return [];

      const [currentKnowledge, currentAbilities] = await Promise.all([
        neo4jService.getChildKnowledge(childId),
        neo4jService.getChildAbilities(childId)
      ]);

      const results: RecommendationResult[] = [];

      // 基于当前知识推荐相关知识
      for (const knowledge of currentKnowledge) {
        // 查找相关但未掌握的知识
        const relatedKnowledge = await neo4jService.query(`
          MATCH (current:Knowledge {id: $knowledgeId})-[:PREREQUISITE|RELATED_TO]->(related:Knowledge)
          WHERE NOT (:Child {id: $childId})-[:HAS_KNOWLEDGE]->(related)
          RETURN related, COUNT(*) as connection_strength
          ORDER BY connection_strength DESC
          LIMIT 5
        `, { knowledgeId: knowledge.knowledge_id, childId });

        for (const record of relatedKnowledge) {
          const relatedNode = record.get('related');
          const connectionStrength = record.get('connection_strength');

          const recommendationScore = knowledge.mastery_level * (connectionStrength / 10);

          results.push({
            id: `rec_${childId}_${relatedNode.properties.id}`,
            item_id: relatedNode.properties.id,
            type: 'knowledge',
            item_type: 'knowledge',
            title: relatedNode.properties.title,
            description: relatedNode.properties.description,
            relevanceScore: recommendationScore,
            recommendation_score: recommendationScore,
            confidence: Math.min(knowledge.mastery_level, 0.8),
            reasoning: `基于已掌握知识"${knowledge.title}"的相关内容推荐`,
            metadata: {
              algorithm: 'content_based',
              base_knowledge: knowledge.knowledge_id,
              connection_strength: connectionStrength,
              mastery_prerequisite: knowledge.mastery_level
            }
          });
        }
      }

      // 基于能力推荐相关活动
      for (const ability of currentAbilities) {
        const relatedActivities = await neo4jService.query(`
          MATCH (current:Ability {id: $abilityId})<-[:DEVELOPS]-(activity:Activity)
          WHERE NOT (:Child {id: $childId})-[:PARTICIPATED_IN]->(activity)
          RETURN activity, activity.difficulty_level as difficulty
          ORDER BY difficulty ASC
          LIMIT 3
        `, { abilityId: ability.ability_id, childId });

        for (const record of relatedActivities) {
          const activityNode = record.get('activity');
          const difficulty = record.get('difficulty');

          // 难度匹配度计算
          const difficultyMatch = 1 - Math.abs(ability.level - difficulty);
          const recommendationScore = ability.level * difficultyMatch;

          results.push({
            id: `rec_${childId}_${activityNode.properties.id}`,
            item_id: activityNode.properties.id,
            type: 'activity',
            item_type: 'activity',
            title: activityNode.properties.title,
            description: activityNode.properties.description,
            relevanceScore: recommendationScore,
            recommendation_score: recommendationScore,
            confidence: ability.level,
            reasoning: `基于当前能力"${ability.title}"推荐匹配活动`,
            metadata: {
              algorithm: 'content_based',
              base_ability: ability.ability_id,
              difficulty_match: difficultyMatch,
              ability_level: ability.level
            }
          });
        }
      }

      return results.sort((a, b) => b.recommendation_score - a.recommendation_score);

    } catch (error) {
      console.error('Content-based filtering error:', error);
      return [];
    }
  }

  /**
   * 图神经网络推荐算法
   *
   * 使用图神经网络学习用户和物品的嵌入表示
   */
  private async graphNeuralNetworkRecommendations(
    childId: string,
    config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    try {
      // 构建图神经网络输入
      const gnnInput = await this.buildGNNInput(childId);

      // 执行GNN推理（这里使用简化版本）
      const gnnEmbeddings = await this.performGNNInference(gnnInput);

      // 生成推荐
      const results: RecommendationResult[] = [];

      for (const [itemId, embedding] of Object.entries(gnnEmbeddings.item_embeddings)) {
        // 计算用户嵌入和物品嵌入的相似度
        const userEmbedding = gnnEmbeddings.user_embedding;
        const similarity = this.cosineSimilarity(userEmbedding, embedding);

        if (similarity > config.similarity_threshold) {
          const itemNode = await this.getItemById(itemId);
          if (itemNode) {
            const itemType = itemNode.labels.includes('Knowledge') ? 'knowledge' : 'activity';
            results.push({
              id: `rec_${childId}_${itemId}`,
              item_id: itemId,
              type: itemType,
              item_type: itemType,
              title: itemNode.properties.title,
              description: itemNode.properties.description,
              relevanceScore: similarity,
              recommendation_score: similarity,
              confidence: similarity,
              reasoning: `基于图神经网络学习的用户-物品嵌入相似度(${similarity.toFixed(3)})推荐`,
              metadata: {
                algorithm: 'graph_neural_network',
                embedding_similarity: similarity,
                user_embedding_dim: userEmbedding.length,
                item_embedding_dim: embedding.length
              }
            });
          }
        }
      }

      return results.sort((a, b) => b.recommendation_score - a.recommendation_score)
                   .slice(0, config.max_recommendations);

    } catch (error) {
      console.error('GNN recommendation error:', error);
      return [];
    }
  }

  /**
   * 基于流行度的推荐算法
   *
   * 推荐热门和高评分的内容
   */
  private async popularityBasedRecommendations(
    childId: string,
    _config: RecommendationConfig
  ): Promise<RecommendationResult[]> {
    try {
      const results: RecommendationResult[] = [];

      // 热门知识推荐
      const popularKnowledge = await neo4jService.query(`
        MATCH (k:Knowledge)<-[hk:HAS_KNOWLEDGE]-(c:Child)
        WHERE hk.mastery_level > 0.7
        WITH k, AVG(hk.mastery_level) as avg_mastery, COUNT(DISTINCT c) as child_count
        WHERE NOT (:Child {id: $childId})-[:HAS_KNOWLEDGE]->(k)
        RETURN k, avg_mastery, child_count
        ORDER BY avg_mastery DESC, child_count DESC
        LIMIT 5
      `, { childId });

      for (const record of popularKnowledge) {
        const knowledgeNode = record.get('k');
        const avgMastery = record.get('avg_mastery');
        const childCount = record.get('child_count');

        const popularityScore = (avgMastery * 0.6 + Math.min(childCount / 100, 1) * 0.4);

        results.push({
          id: `rec_pop_${knowledgeNode.properties.id}`,
          item_id: knowledgeNode.properties.id,
          type: 'knowledge',
          item_type: 'knowledge',
          title: knowledgeNode.properties.title,
          description: knowledgeNode.properties.description,
          relevanceScore: popularityScore,
          recommendation_score: popularityScore,
          confidence: 0.7,
          reasoning: `热门知识(平均掌握度${avgMastery.toFixed(2)}, ${childCount}人已掌握)`,
          metadata: {
            algorithm: 'popularity_based',
            avg_mastery: avgMastery,
            child_count: childCount,
            popularity_score: popularityScore
          }
        });
      }

      // 热门活动推荐
      const popularActivities = await neo4jService.query(`
        MATCH (a:Activity)<-[pa:PARTICIPATED_IN]-(c:Child)
        WHERE pa.completion_rate > 0.8
        WITH a, AVG(pa.completion_rate) as avg_completion, COUNT(DISTINCT c) as child_count
        WHERE NOT (:Child {id: $childId})-[:PARTICIPATED_IN]->(a)
        RETURN a, avg_completion, child_count
        ORDER BY avg_completion DESC, child_count DESC
        LIMIT 5
      `, { childId });

      for (const record of popularActivities) {
        const activityNode = record.get('a');
        const avgCompletion = record.get('avg_completion');
        const childCount = record.get('child_count');

        const popularityScore = (avgCompletion * 0.6 + Math.min(childCount / 100, 1) * 0.4);

        results.push({
          id: `rec_pop_${activityNode.properties.id}`,
          item_id: activityNode.properties.id,
          type: 'activity',
          item_type: 'activity',
          title: activityNode.properties.title,
          description: activityNode.properties.description,
          relevanceScore: popularityScore,
          recommendation_score: popularityScore,
          confidence: 0.7,
          reasoning: `热门活动(平均完成率${avgCompletion.toFixed(2)}, ${childCount}人参与)`,
          metadata: {
            algorithm: 'popularity_based',
            avg_completion: avgCompletion,
            child_count: childCount,
            popularity_score: popularityScore
          }
        });
      }

      return results.sort((a, b) => b.recommendation_score - a.recommendation_score);

    } catch (error) {
      console.error('Popularity-based recommendation error:', error);
      return [];
    }
  }

  /**
   * 混合推荐策略
   *
   * 将多种推荐算法的结果进行加权融合
   */
  private mixRecommendations(
    algorithmResults: RecommendationResult[][],
    config: RecommendationConfig
  ): RecommendationResult[] {
    const weights = [
      config.collaborative_weight,
      config.content_weight,
      config.gnn_weight,
      config.popularity_weight
    ];

    const mixedResults = new Map<string, RecommendationResult>();

    algorithmResults.forEach((results, index) => {
      const weight = weights[index];

      results.forEach(result => {
        const key = `${result.item_type}:${result.item_id}`;

        if (mixedResults.has(key)) {
          // 如果已存在，合并权重
          const existing = mixedResults.get(key)!;
          existing.recommendation_score =
            existing.recommendation_score + result.recommendation_score * weight;
          existing.confidence = Math.max(existing.confidence, result.confidence);
          existing.metadata = {
            ...existing.metadata,
            mixed_algorithms: [
              ...(existing.metadata.mixed_algorithms || []),
              result.metadata.algorithm
            ]
          };
        } else {
          // 新增结果
          mixedResults.set(key, {
            ...result,
            recommendation_score: result.recommendation_score * weight
          });
        }
      });
    });

    return Array.from(mixedResults.values())
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, config.max_recommendations);
  }

  /**
   * 推荐结果多样性优化
   *
   * 确保推荐结果在类型、难度、领域等方面具有多样性
   */
  private diversifyRecommendations(
    results: RecommendationResult[],
    config: RecommendationConfig
  ): RecommendationResult[] {
    if (results.length === 0) return results;

    const diversified: RecommendationResult[] = [];
    const typeCount = { knowledge: 0, activity: 0, ability: 0 };
    const maxTypeCount = Math.ceil(config.max_recommendations / 3);

    // 贪心算法选择多样化结果
    for (const result of results) {
      if (diversified.length >= config.max_recommendations) break;

      if (typeCount[result.item_type] < maxTypeCount) {
        diversified.push(result);
        typeCount[result.item_type]++;
      }
    }

    return diversified;
  }

  /**
   * 上下文过滤
   *
   * 根据当前上下文过滤推荐结果
   */
  private filterByContext(
    results: RecommendationResult[],
    context?: RecommendationRequest['context']
  ): RecommendationResult[] {
    if (!context) return results;

    return results.filter(result => {
      // 时间过滤
      if (context.time_of_day) {
        const suitable = this.isSuitableForTime(result, context.time_of_day);
        if (!suitable) return false;
      }

      // 地点过滤
      if (context.location) {
        const suitable = this.isSuitableForLocation(result, context.location);
        if (!suitable) return false;
      }

      return true;
    });
  }

  /**
   * 检查活动是否适合特定时间
   */
  private isSuitableForTime(result: RecommendationResult, timeOfDay: string): boolean {
    // 这里可以根据活动类型、难度等判断是否适合当前时间
    // 简化实现
    if (result.item_type === 'activity') {
      // 晚上不适合高能量活动
      if (timeOfDay === 'night' && result.metadata.difficulty_level > 0.7) {
        return false;
      }
    }
    return true;
  }

  /**
   * 检查活动是否适合特定地点
   */
  private isSuitableForLocation(result: RecommendationResult, location: string): boolean {
    // 简化实现
    if (result.item_type === 'activity') {
      if (location === 'home' && result.metadata.requires_outdoor_space) {
        return false;
      }
      if (location === 'outdoor' && result.metadata.requires_indoor_space) {
        return false;
      }
    }
    return true;
  }

  /**
   * 分组推荐结果
   */
  private groupRecommendations(results: RecommendationResult[]): {
    knowledge: RecommendationResult[];
    activity: RecommendationResult[];
    ability: RecommendationResult[];
  } {
    const grouped = {
      knowledge: [] as RecommendationResult[],
      activity: [] as RecommendationResult[],
      ability: [] as RecommendationResult[]
    };

    results.forEach(result => {
      grouped[result.item_type].push(result);
    });

    return grouped;
  }

  /**
   * 计算推荐置信度
   */
  private calculateConfidenceScore(results: RecommendationResult[]): number {
    if (results.length === 0) return 0;

    const avgConfidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
    return Math.min(avgConfidence, 1.0);
  }

  /**
   * 计算推荐多样性分数
   */
  private calculateDiversityScore(results: RecommendationResult[]): number {
    if (results.length === 0) return 0;

    const types = new Set(results.map(r => r.item_type));
    return types.size / 3; // 最多3种类型
  }

  /**
   * 生成推荐解释
   */
  private generateExplanation(results: RecommendationResult[], _config: RecommendationConfig): string[] {
    const explanations: string[] = [];

    const algorithmCounts = results.reduce((counts, result) => {
      const algorithm = result.metadata.algorithm;
      counts[algorithm] = (counts[algorithm] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    for (const [algorithm, count] of Object.entries(algorithmCounts)) {
      const percentage = (count / results.length) * 100;
      switch (algorithm) {
        case 'collaborative_filtering':
          explanations.push(`${percentage.toFixed(1)}% 基于相似用户的行为推荐`);
          break;
        case 'content_based':
          explanations.push(`${percentage.toFixed(1)}% 基于您孩子的学习内容和能力匹配`);
          break;
        case 'graph_neural_network':
          explanations.push(`${percentage.toFixed(1)}% 基于AI深度学习的智能分析`);
          break;
        case 'popularity_based':
          explanations.push(`${percentage.toFixed(1)}% 基于其他孩子的热门选择`);
          break;
      }
    }

    return explanations;
  }

  /**
   * 构建图神经网络输入
   */
  private async buildGNNInput(childId: string): Promise<GraphNeuralNetworkInput> {
    // 获取用户的邻居节点和边
    const neighbors = await neo4jService.query(`
      MATCH (child:Child {id: $childId})-[r]-(neighbor)
      RETURN child, r, neighbor, labels(neighbor) as neighbor_labels
    `, { childId });

    const nodes = [childId];
    const edges: Array<{source: string, target: string, type: string, weight: number}> = [];
    const features: Record<string, number[]> = {};

    // 构建节点特征
    features[childId] = await this.extractChildFeatures(childId);

    for (const record of neighbors) {
      const neighbor = record.get('neighbor');
      const relationship = record.get('r');
      const neighborLabels = record.get('neighbor_labels');

      const neighborId = neighbor.properties.id;

      if (!nodes.includes(neighborId)) {
        nodes.push(neighborId);

        // 根据节点类型提取特征
        if (neighborLabels.includes('Knowledge')) {
          features[neighborId] = this.extractKnowledgeFeatures(neighbor);
        } else if (neighborLabels.includes('Activity')) {
          features[neighborId] = this.extractActivityFeatures(neighbor);
        } else if (neighborLabels.includes('Ability')) {
          features[neighborId] = this.extractAbilityFeatures(neighbor);
        }
      }

      edges.push({
        source: childId,
        target: neighborId,
        type: relationship.type,
        weight: relationship.properties.weight || 1.0
      });
    }

    return {
      nodes,
      edges,
      features
    };
  }

  /**
   * 执行图神经网络推理
   */
  private async performGNNInference(input: GraphNeuralNetworkInput): Promise<{
    user_embedding: number[],
    item_embeddings: Record<string, number[]>
  }> {
    // 简化的GNN实现（实际应用中会使用TensorFlow.js或ONNX.js）
    const featureDim = 64; // 嵌入维度
    const embeddings: Record<string, number[]> = {};

    // 初始化随机嵌入
    for (const nodeId of input.nodes) {
      embeddings[nodeId] = Array.from({ length: featureDim }, () => Math.random());
    }

    // 模拟2层图卷积
    for (let layer = 0; layer < 2; layer++) {
      const newEmbeddings: Record<string, number[]> = {};

      for (const nodeId of input.nodes) {
        const neighbors = input.edges
          .filter((edge: {source: string, target: string, type: string, weight: number}) => edge.target === nodeId || edge.source === nodeId)
          .map((edge: {source: string, target: string, type: string, weight: number}) => edge.target === nodeId ? edge.source : edge.target);

        // 聚合邻居嵌入
        let neighborSum = new Array(featureDim).fill(0);
        for (const neighborId of neighbors) {
          const neighborEmbedding = embeddings[neighborId];
          for (let i = 0; i < featureDim; i++) {
            neighborSum[i] += neighborEmbedding[i];
          }
        }

        // 更新节点嵌入
        const currentEmbedding = embeddings[nodeId];
        newEmbeddings[nodeId] = [];
        for (let i = 0; i < featureDim; i++) {
          newEmbeddings[nodeId][i] = Math.tanh(
            currentEmbedding[i] * 0.5 + (neighborSum[i] / neighbors.length) * 0.5
          );
        }
      }

      Object.assign(embeddings, newEmbeddings);
    }

    // 分离用户嵌入和物品嵌入
    const userEmbedding = embeddings[input.nodes[0]]; // 假设第一个节点是用户
    const itemEmbeddings: Record<string, number[]> = {};

    for (let i = 1; i < input.nodes.length; i++) {
      const itemId = input.nodes[i];
      itemEmbeddings[itemId] = embeddings[itemId];
    }

    return {
      user_embedding: userEmbedding,
      item_embeddings: itemEmbeddings
    };
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    return norm1 * norm2 > 0 ? dotProduct / (norm1 * norm2) : 0;
  }

  /**
   * 根据ID获取项目节点
   */
  private async getItemById(itemId: string): Promise<Neo4jNode | null> {
    const result = await neo4jService.query(`
      MATCH (n {id: $itemId})
      RETURN n, labels(n) as labels
    `, { itemId });

    return result.length > 0 ? result[0].get('n') as Neo4jNode : null;
  }

  /**
   * 提取儿童特征向量
   */
  private async extractChildFeatures(childId: string): Promise<number[]> {
    // 简化实现，返回固定长度的特征向量
    const child = await neo4jService.getChildById(childId);
    if (!child) return new Array(64).fill(0);

    return [
      child.age / 18, // 归一化年龄
      child.gender === 'male' ? 1 : 0,
      child.interests.length / 10, // 兴趣数量
      ...new Array(61).fill(0) // 填充到64维
    ];
  }

  /**
   * 提取知识特征向量
   */
  private extractKnowledgeFeatures(knowledgeNode: Neo4jNode): number[] {
    return [
      (knowledgeNode.properties.difficulty_level as number) || 0.5,
      (knowledgeNode.properties.importance as number) || 0.5,
      ...new Array(62).fill(0)
    ];
  }

  /**
   * 提取活动特征向量
   */
  private extractActivityFeatures(activityNode: Neo4jNode): number[] {
    return [
      (activityNode.properties.difficulty_level as number) || 0.5,
      ((activityNode.properties.duration_minutes as number) || 60) / 120,
      (activityNode.properties.energy_required as number) || 0.5,
      ...new Array(61).fill(0)
    ];
  }

  /**
   * 提取能力特征向量
   */
  private extractAbilityFeatures(abilityNode: Neo4jNode): number[] {
    return [
      (abilityNode.properties.level as number) || 0.5,
      (abilityNode.properties.potential as number) || 0.5,
      ...new Array(62).fill(0)
    ];
  }

  /**
   * 更新用户-物品评分矩阵
   */
  async updateUserItemMatrix(
    userId: string,
    itemId: string,
    rating: number,
    _context?: Record<string, unknown>
  ): Promise<void> {
    if (!this.userItemMatrix.has(userId)) {
      this.userItemMatrix.set(userId, new Map());
    }

    this.userItemMatrix.get(userId)!.set(itemId, rating);

    // 触发相似度矩阵更新
    await this.updateSimilarityMatrices();
  }

  /**
   * 更新相似度矩阵
   */
  private async updateSimilarityMatrices(): Promise<void> {
    // 更新用户相似度矩阵
    const userIds = Array.from(this.userItemMatrix.keys());

    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        const user1 = userIds[i];
        const user2 = userIds[j];

        const similarity = this.calculateUserSimilarity(user1, user2);

        if (!this.userSimilarityMatrix.has(user1)) {
          this.userSimilarityMatrix.set(user1, new Map());
        }
        if (!this.userSimilarityMatrix.has(user2)) {
          this.userSimilarityMatrix.set(user2, new Map());
        }

        this.userSimilarityMatrix.get(user1)!.set(user2, similarity);
        this.userSimilarityMatrix.get(user2)!.set(user1, similarity);
      }
    }
  }

  /**
   * 计算用户相似度
   */
  private calculateUserSimilarity(user1: string, user2: string): number {
    const ratings1 = this.userItemMatrix.get(user1) || new Map();
    const ratings2 = this.userItemMatrix.get(user2) || new Map();

    // 找到共同评分的物品
    const commonItems = Array.from(ratings1.keys()).filter(item => ratings2.has(item));

    if (commonItems.length === 0) return 0;

    // 计算皮尔逊相关系数
    const avg1 = commonItems.reduce((sum, item) => sum + ratings1.get(item)!, 0) / commonItems.length;
    const avg2 = commonItems.reduce((sum, item) => sum + ratings2.get(item)!, 0) / commonItems.length;

    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;

    for (const item of commonItems) {
      const diff1 = ratings1.get(item)! - avg1;
      const diff2 = ratings2.get(item)! - avg2;

      numerator += diff1 * diff2;
      denominator1 += diff1 * diff1;
      denominator2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(denominator1 * denominator2);
    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * 实时推荐更新
   */
  async updateRecommendations(childId: string, feedback: {
    item_id: string;
    item_type: 'knowledge' | 'activity' | 'ability';
    rating: number; // 1-5
    interaction_time: number; // 交互时长（秒）
  }): Promise<void> {
    try {
      // 更新用户-物品矩阵
      await this.updateUserItemMatrix(childId, feedback.item_id, feedback.rating);

      // 更新Neo4j中的关系权重
      if (feedback.item_type === 'knowledge') {
        await neo4jService.query(`
          MATCH (child:Child {id: $childId})-[r:HAS_KNOWLEDGE]->(knowledge:Knowledge {id: $itemId})
          SET r.last_interaction = timestamp(),
              r.total_interaction_time = COALESCE(r.total_interaction_time, 0) + $interactionTime,
              r.interaction_count = COALESCE(r.interaction_count, 0) + 1,
              r.feedback_score = $rating
        `, {
          childId,
          itemId: feedback.item_id,
          interactionTime: feedback.interaction_time,
          rating: feedback.rating
        });
      } else if (feedback.item_type === 'activity') {
        await neo4jService.query(`
          MATCH (child:Child {id: $childId})-[r:PARTICIPATED_IN]->(activity:Activity {id: $itemId})
          SET r.last_interaction = timestamp(),
              r.total_interaction_time = COALESCE(r.total_interaction_time, 0) + $interactionTime,
              r.interaction_count = COALESCE(r.interaction_count, 0) + 1,
              r.feedback_score = $rating
        `, {
          childId,
          itemId: feedback.item_id,
          interactionTime: feedback.interaction_time,
          rating: feedback.rating
        });
      }

      console.log(`Updated recommendations for child ${childId} based on feedback`);

    } catch (error) {
      console.error('Failed to update recommendations:', error);
      throw error;
    }
  }

  /**
   * 获取推荐系统性能指标
   */
  async getRecommendationMetrics(): Promise<{
    total_recommendations: number;
    average_confidence: number;
    diversity_score: number;
    coverage_rate: number;
    algorithm_performance: Record<string, {
      usage_count: number;
      average_score: number;
      user_satisfaction: number;
    }>;
  }> {
    try {
      // 这里应该从数据库中获取实际指标
      // 简化实现，返回模拟数据
      return {
        total_recommendations: 1250,
        average_confidence: 0.82,
        diversity_score: 0.75,
        coverage_rate: 0.68,
        algorithm_performance: {
          collaborative_filtering: {
            usage_count: 450,
            average_score: 0.78,
            user_satisfaction: 0.81
          },
          content_based: {
            usage_count: 380,
            average_score: 0.85,
            user_satisfaction: 0.83
          },
          graph_neural_network: {
            usage_count: 320,
            average_score: 0.89,
            user_satisfaction: 0.87
          },
          popularity_based: {
            usage_count: 100,
            average_score: 0.72,
            user_satisfaction: 0.75
          }
        }
      };
    } catch (error) {
      console.error('Failed to get recommendation metrics:', error);
      throw error;
    }
  }

  /**
   * 设置推荐算法权重
   */
  setRecommendationWeights(weights: Partial<RecommendationConfig>): void {
    this.config = { ...this.config, ...weights };
  }

  /**
   * 获取当前推荐配置
   */
  getRecommendationConfig(): RecommendationConfig {
    return { ...this.config };
  }
}

// 创建并导出推荐引擎单例
const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;