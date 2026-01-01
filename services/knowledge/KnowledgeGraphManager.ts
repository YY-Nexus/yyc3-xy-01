/**
 * YYC³ AI小语智能成长守护系统 - 知识图谱管理器
 * Intelligent Pluggable Mobile AI System - Knowledge Graph Manager
 * Phase 2 Week 11-12: 知识图谱构建
 */

import neo4jService from './Neo4jService';
import {
  ChildNode,
  KnowledgeNode,
  KnowledgePathResult,
  Neo4jNode,
  Neo4jPath,
  Neo4jPathSegment
} from './Neo4jService';

interface KnowledgeSequenceItem {
  knowledge_id: string;
  title: string;
  difficulty_level: number;
  estimated_time: number;
}

// 数据质量检查结果
interface DataQualityReport {
  total_nodes: number;
  total_relationships: number;
  quality_score: number;
  issues: Array<{
    type: 'duplicate' | 'missing_property' | 'invalid_value' | 'orphaned_node' | 'circular_reference';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_nodes: string[];
    suggested_fix: string;
  }>;
  statistics: {
    node_types: Record<string, number>;
    relationship_types: Record<string, number>;
    node_counts: {
      total: number;
      [key: string]: number;
    };
    relationship_counts: {
      total: number;
      [key: string]: number;
    };
    connectivity_metrics: {
      average_degree: number;
      max_degree: number;
      connected_components: number;
      largest_component_size: number;
    };
  };
}

// 知识图谱导入配置
interface ImportConfig {
  batch_size: number;
  create_constraints: boolean;
  create_indexes: boolean;
  validate_data: boolean;
  update_existing: boolean;
  generate_ids: boolean;
  skip_duplicates: boolean;
}

// 知识路径生成参数
interface PathGenerationParams {
  start_knowledge?: string;
  target_knowledge?: string;
  max_path_length: number;
  min_confidence: number;
  preferred_learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficulty_preference?: 'gradual' | 'challenge' | 'mixed';
}

// 知识图谱导出数据结构
interface KnowledgeGraphExportData {
  metadata: {
    export_timestamp: number;
    total_nodes: number;
    total_relationships: number;
    format: string;
  };
  nodes: Array<Record<string, unknown>>;
  relationships: Array<{
    id: string;
    type: string;
    start_node: string;
    end_node: string;
    properties: Record<string, unknown>;
  }>;
}

/**
 * 知识图谱管理器服务类
 *
 * 核心功能：
 * 1. 知识图谱数据导入和导出
 * 2. 数据质量检查和清洗
 * 3. 知识路径生成和优化
 * 4. 图谱统计和分析
 * 5. 版本控制和备份
 * 6. 图谱可视化数据准备
 */
export class KnowledgeGraphManager {
  private importConfig: ImportConfig;

  constructor() {
    this.importConfig = {
      batch_size: 1000,
      create_constraints: true,
      create_indexes: true,
      validate_data: true,
      update_existing: false,
      generate_ids: true,
      skip_duplicates: true
    };
  }

  /**
   * 初始化知识图谱
   * 创建约束、索引和基本结构
   */
  async initializeKnowledgeGraph(): Promise<void> {
    try {
      console.log('Initializing YYC³ Knowledge Graph...');

      // 创建唯一性约束
      await this.createConstraints();

      // 创建索引
      await this.createIndexes();

      // 创建基本数据结构
      await this.createBasicStructure();

      console.log('Knowledge Graph initialization completed successfully.');

    } catch (error) {
      console.error('Failed to initialize knowledge graph:', error);
      throw new Error(`Knowledge Graph initialization failed: ${error}`);
    }
  }

  /**
   * 创建数据库约束
   */
  private async createConstraints(): Promise<void> {
    const constraints = [
      // 节点唯一性约束
      'CREATE CONSTRAINT child_id_unique IF NOT EXISTS FOR (c:Child) REQUIRE c.id IS UNIQUE',
      'CREATE CONSTRAINT knowledge_id_unique IF NOT EXISTS FOR (k:Knowledge) REQUIRE k.id IS UNIQUE',
      'CREATE CONSTRAINT ability_id_unique IF NOT EXISTS FOR (a:Ability) REQUIRE a.id IS UNIQUE',
      'CREATE CONSTRAINT activity_id_unique IF NOT EXISTS FOR (ac:Activity) REQUIRE ac.id IS UNIQUE',

      // 关系唯一性约束
      'CREATE CONSTRAINT unique_child_knowledge IF NOT EXISTS FOR ()-[r:HAS_KNOWLEDGE]-() REQUIRE r.id IS UNIQUE',
      'CREATE CONSTRAINT unique_child_ability IF NOT EXISTS FOR ()-[r:HAS_ABILITY]-() REQUIRE r.id IS UNIQUE',
      'CREATE CONSTRAINT unique_child_activity IF NOT EXISTS FOR ()-[r:PARTICIPATED_IN]-() REQUIRE r.id IS UNIQUE'
    ];

    for (const constraint of constraints) {
      try {
        await neo4jService.query(constraint);
        console.log(`✅ Created constraint: ${constraint.split(' ')[2]}`);
      } catch (error) {
        console.warn(`⚠️  Constraint already exists or failed: ${constraint}`);
      }
    }
  }

  /**
   * 创建数据库索引
   */
  private async createIndexes(): Promise<void> {
    const indexes = [
      // 查询性能索引
      'CREATE INDEX child_age_index IF NOT EXISTS FOR (c:Child) ON (c.age)',
      'CREATE INDEX child_gender_index IF NOT EXISTS FOR (c:Child) ON (c.gender)',
      'CREATE INDEX knowledge_difficulty_index IF NOT EXISTS FOR (k:Knowledge) ON (k.difficulty_level)',
      'CREATE INDEX knowledge_category_index IF NOT EXISTS FOR (k:Knowledge) ON (k.category)',
      'CREATE INDEX ability_level_index IF NOT EXISTS FOR (a:Ability) ON (a.level)',
      'CREATE INDEX activity_difficulty_index IF NOT EXISTS FOR (ac:Activity) ON (ac.difficulty_level)',
      'CREATE INDEX activity_category_index IF NOT EXISTS FOR (ac:Activity) ON (ac.category)',

      // 复合索引
      'CREATE INDEX knowledge_category_difficulty_index IF NOT EXISTS FOR (k:Knowledge) ON (k.category, k.difficulty_level)',
      'CREATE INDEX activity_age_suitability_index IF NOT EXISTS FOR (ac:Activity) ON (ac.min_age, ac.max_age)',

      // 全文搜索索引
      'CREATE FULLTEXT INDEX knowledge_search_index IF NOT EXISTS FOR (k:Knowledge) ON EACH [k.title, k.description]',
      'CREATE FULLTEXT INDEX activity_search_index IF NOT EXISTS FOR (ac:Activity) ON EACH [ac.title, ac.description]'
    ];

    for (const index of indexes) {
      try {
        await neo4jService.query(index);
        console.log(`✅ Created index: ${index.split(' ')[3]}`);
      } catch (error) {
        console.warn(`⚠️  Index already exists or failed: ${index}`);
      }
    }
  }

  /**
   * 创建基本数据结构
   */
  private async createBasicStructure(): Promise<void> {
    try {
      // 创建知识分类体系
      await this.createKnowledgeCategories();

      // 创建能力维度体系
      await this.createAbilityDimensions();

      // 创建活动类型体系
      await this.createActivityCategories();

      console.log('✅ Basic data structure created successfully.');

    } catch (error) {
      console.error('Failed to create basic structure:', error);
      throw error;
    }
  }

  /**
   * 创建知识分类体系
   */
  private async createKnowledgeCategories(): Promise<void> {
    const categories = [
      { id: 'math', name: '数学认知', description: '数量、形状、空间、时间等数学概念' },
      { id: 'language', name: '语言发展', description: '听说读写、词汇表达、沟通能力' },
      { id: 'science', name: '科学探索', description: '自然现象、科学原理、探索精神' },
      { id: 'art', name: '艺术创造', description: '音乐、绘画、手工、审美能力' },
      { id: 'social', name: '社会情感', description: '人际交往、情绪管理、社会适应' },
      { id: 'health', name: '健康体育', description: '身体发育、运动技能、健康习惯' },
      { id: 'life', name: '生活技能', description: '自理能力、生活习惯、安全意识' },
      { id: 'moral', name: '品德发展', description: '行为规范、价值观念、道德品质' }
    ];

    for (const category of categories) {
      await neo4jService.query(`
        MERGE (kc:KnowledgeCategory {id: $id})
        SET kc.name = $name,
            kc.description = $description,
            kc.created_at = timestamp(),
            kc.updated_at = timestamp()
      `, category);
    }
  }

  /**
   * 创建能力维度体系
   */
  private async createAbilityDimensions(): Promise<void> {
    const dimensions = [
      { id: 'cognitive', name: '认知能力', description: '注意力、记忆力、思维能力等' },
      { id: 'language', name: '语言能力', description: '理解表达、词汇运用等' },
      { id: 'social', name: '社交能力', description: '人际交往、合作分享等' },
      { id: 'emotional', name: '情感能力', description: '情绪识别、情绪管理等' },
      { id: 'creative', name: '创造能力', description: '想象力、创新思维等' },
      { id: 'motor', name: '运动能力', description: '大肌肉、精细动作等' },
      { id: 'self_care', name: '自理能力', description: '生活技能、独立性等' }
    ];

    for (const dimension of dimensions) {
      await neo4jService.query(`
        MERGE (ad:AbilityDimension {id: $id})
        SET ad.name = $name,
            ad.description = $description,
            ad.created_at = timestamp(),
            ad.updated_at = timestamp()
      `, dimension);
    }
  }

  /**
   * 创建活动类型体系
   */
  private async createActivityCategories(): Promise<void> {
    const categories = [
      { id: 'educational', name: '教育活动', description: '知识学习、技能训练等' },
      { id: 'creative', name: '创意活动', description: '艺术创作、手工制作等' },
      { id: 'physical', name: '体育活动', description: '运动游戏、体能训练等' },
      { id: 'social', name: '社交活动', description: '集体游戏、角色扮演等' },
      { id: 'exploratory', name: '探索活动', description: '科学实验、自然观察等' },
      { id: 'entertainment', name: '娱乐活动', description: '游戏、故事、音乐等' }
    ];

    for (const category of categories) {
      await neo4jService.query(`
        MERGE (ac:ActivityCategory {id: $id})
        SET ac.name = $name,
            ac.description = $description,
            ac.created_at = timestamp(),
            ac.updated_at = timestamp()
      `, category);
    }
  }

  /**
   * 批量导入儿童数据
   */
  async importChildren(children: Partial<ChildNode>[]): Promise<{
    success_count: number;
    failed_count: number;
    errors: string[];
  }> {
    const result = {
      success_count: 0,
      failed_count: 0,
      errors: [] as string[]
    };

    try {
      console.log(`Starting import of ${children.length} children...`);

      for (let i = 0; i < children.length; i += this.importConfig.batch_size) {
        const batch = children.slice(i, i + this.importConfig.batch_size);

        for (const childData of batch) {
          try {
            await this.importSingleChild(childData);
            result.success_count++;
          } catch (error) {
            result.failed_count++;
            result.errors.push(`Child ${childData.id || 'unknown'}: ${error}`);
            console.error(`Failed to import child:`, childData, error);
          }
        }

        console.log(`Processed ${Math.min(i + this.importConfig.batch_size, children.length)}/${children.length} children`);
      }

      console.log(`Children import completed: ${result.success_count} success, ${result.failed_count} failed`);
      return result;

    } catch (error) {
      console.error('Children import failed:', error);
      throw error;
    }
  }

  /**
   * 导入单个儿童数据
   */
  private async importSingleChild(childData: Partial<ChildNode>): Promise<void> {
    const child: ChildNode = {
      id: childData.id || this.generateId('child'),
      name: childData.name || '',
      age: childData.age || 0,
      gender: childData.gender || 'male',
      interests: childData.interests || [],
      learningStyle: childData.learningStyle || 'mixed',
      birthDate: new Date(),
      abilities: childData.abilities || [],
      personality: childData.personality || '',
      familyBackground: childData.familyBackground || {}
    };

    if (this.importConfig.validate_data) {
      this.validateChildData(child);
    }

    await neo4jService.query(`
      MERGE (c:Child {id: $id})
      SET c.name = $name,
          c.age = $age,
          c.gender = $gender,
          c.interests = $interests,
          c.learningStyle = $learningStyle,
          c.birthDate = $birthDate,
          c.abilities = $abilities,
          c.personality = $personality,
          c.familyBackground = $familyBackground
    `, child);
  }

  /**
   * 批量导入知识数据
   */
  async importKnowledge(knowledgeItems: Partial<KnowledgeNode>[]): Promise<{
    success_count: number;
    failed_count: number;
    errors: string[];
  }> {
    const result = {
      success_count: 0,
      failed_count: 0,
      errors: [] as string[]
    };

    try {
      console.log(`Starting import of ${knowledgeItems.length} knowledge items...`);

      for (let i = 0; i < knowledgeItems.length; i += this.importConfig.batch_size) {
        const batch = knowledgeItems.slice(i, i + this.importConfig.batch_size);

        for (const knowledgeData of batch) {
          try {
            await this.importSingleKnowledge(knowledgeData);
            result.success_count++;
          } catch (error) {
            result.failed_count++;
            result.errors.push(`Knowledge ${knowledgeData.id || 'unknown'}: ${error}`);
            console.error(`Failed to import knowledge:`, knowledgeData, error);
          }
        }

        console.log(`Processed ${Math.min(i + this.importConfig.batch_size, knowledgeItems.length)}/${knowledgeItems.length} knowledge items`);
      }

      console.log(`Knowledge import completed: ${result.success_count} success, ${result.failed_count} failed`);
      return result;

    } catch (error) {
      console.error('Knowledge import failed:', error);
      throw error;
    }
  }

  /**
   * 导入单个知识数据
   */
  private async importSingleKnowledge(knowledgeData: Partial<KnowledgeNode>): Promise<void> {
    const knowledge: KnowledgeNode = {
      id: knowledgeData.id || this.generateId('knowledge'),
      title: knowledgeData.title || '',
      content: knowledgeData.content || '',
      category: knowledgeData.category || 'general',
      difficulty: knowledgeData.difficulty || 'beginner',
      ageGroup: knowledgeData.ageGroup || ['3-12'],
      tags: knowledgeData.tags || [],
      source: knowledgeData.source || '',
      credibilityScore: knowledgeData.credibilityScore || 0.5,
      effectiveness: knowledgeData.effectiveness || 0.5,
      lastUpdated: new Date()
    };

    if (this.importConfig.validate_data) {
      this.validateKnowledgeData(knowledge);
    }

    await neo4jService.query(`
      MERGE (k:Knowledge {id: $id})
      SET k.title = $title,
          k.content = $content,
          k.category = $category,
          k.difficulty = $difficulty,
          k.ageGroup = $ageGroup,
          k.tags = $tags,
          k.source = $source,
          k.credibilityScore = $credibilityScore,
          k.effectiveness = $effectiveness,
          k.lastUpdated = $lastUpdated
    `, knowledge);

    // 关联到知识分类
    if (knowledge.category) {
      await neo4jService.query(`
        MATCH (k:Knowledge {id: $knowledgeId}), (kc:KnowledgeCategory {id: $categoryId})
        MERGE (k)-[:BELONGS_TO]->(kc)
      `, {
        knowledgeId: knowledge.id,
        categoryId: knowledge.category
      });
    }
  }

  /**
   * 数据质量检查
   */
  async performDataQualityCheck(): Promise<DataQualityReport> {
    try {
      console.log('Performing data quality check...');

      const issues = [];

      // 检查重复节点
      const duplicateIssues = await this.checkDuplicateNodes();
      issues.push(...duplicateIssues);

      // 检查缺失属性
      const missingPropertyIssues = await this.checkMissingProperties();
      issues.push(...missingPropertyIssues);

      // 检查无效值
      const invalidValueIssues = await this.checkInvalidValues();
      issues.push(...invalidValueIssues);

      // 检查孤立节点
      const orphanedNodeIssues = await this.checkOrphanedNodes();
      issues.push(...orphanedNodeIssues);

      // 检查循环引用
      const circularReferenceIssues = await this.checkCircularReferences();
      issues.push(...circularReferenceIssues);

      // 获取统计数据
      const statistics = await this.getGraphStatistics();

      // 计算质量分数
      const qualityScore = this.calculateQualityScore(issues, statistics);

      const report: DataQualityReport = {
        total_nodes: statistics.node_counts.total,
        total_relationships: statistics.relationship_counts.total,
        quality_score: qualityScore,
        issues,
        statistics
      };

      console.log(`Data quality check completed. Quality score: ${qualityScore.toFixed(2)}`);
      return report;

    } catch (error) {
      console.error('Data quality check failed:', error);
      throw error;
    }
  }

  /**
   * 检查重复节点
   */
  private async checkDuplicateNodes(): Promise<DataQualityReport['issues']> {
    const issues: DataQualityReport['issues'] = [];

    // 检查重复的儿童（同名同年龄）
    const duplicateChildren = await neo4jService.query(`
      MATCH (c:Child)
      WITH c.name + '|' + toString(c.age) as identifier, COLLECT(c) as children
      WHERE SIZE(children) > 1
      RETURN children
    `);

    for (const record of duplicateChildren) {
      const children = record.get('children');
      const childIds = children.map((c: Neo4jNode) => c.properties.id);

      issues.push({
        type: 'duplicate',
        severity: 'medium',
        description: `发现重复的儿童记录（同名同年龄）`,
        affected_nodes: childIds,
        suggested_fix: '检查儿童信息，合并重复记录或添加区分标识'
      });
    }

    return issues;
  }

  /**
   * 检查缺失属性
   */
  private async checkMissingProperties(): Promise<DataQualityReport['issues']> {
    const issues: DataQualityReport['issues'] = [];

    // 检查缺失必要属性的儿童
    const childrenWithMissingProps = await neo4jService.query(`
      MATCH (c:Child)
      WHERE c.name IS NULL OR c.age IS NULL OR c.gender IS NULL
      RETURN COLLECT(c.id) as child_ids
    `);

    if (childrenWithMissingProps.length > 0) {
      const childIds = childrenWithMissingProps[0].get('child_ids');
      if (childIds.length > 0) {
        issues.push({
          type: 'missing_property',
          severity: 'high',
          description: '部分儿童记录缺失必要属性（姓名、年龄或性别）',
          affected_nodes: childIds,
          suggested_fix: '补充缺失的儿童基本信息'
        });
      }
    }

    // 检查缺失必要属性的知识
    const knowledgeWithMissingProps = await neo4jService.query(`
      MATCH (k:Knowledge)
      WHERE k.title IS NULL OR k.category IS NULL
      RETURN COLLECT(k.id) as knowledge_ids
    `);

    if (knowledgeWithMissingProps.length > 0) {
      const knowledgeIds = knowledgeWithMissingProps[0].get('knowledge_ids');
      if (knowledgeIds.length > 0) {
        issues.push({
          type: 'missing_property',
          severity: 'high',
          description: '部分知识记录缺失必要属性（标题或分类）',
          affected_nodes: knowledgeIds,
          suggested_fix: '补充缺失的知识信息'
        });
      }
    }

    return issues;
  }

  /**
   * 检查无效值
   */
  private async checkInvalidValues(): Promise<DataQualityReport['issues']> {
    const issues: DataQualityReport['issues'] = [];

    // 检查年龄无效的儿童
    const childrenWithInvalidAge = await neo4jService.query(`
      MATCH (c:Child)
      WHERE c.age < 0 OR c.age > 18 OR c.age IS NULL
      RETURN COLLECT(c.id) as child_ids
    `);

    if (childrenWithInvalidAge.length > 0) {
      const childIds = childrenWithInvalidAge[0].get('child_ids');
      if (childIds.length > 0) {
        issues.push({
          type: 'invalid_value',
          severity: 'high',
          description: '部分儿童年龄值无效（应在0-18岁之间）',
          affected_nodes: childIds,
          suggested_fix: '更正儿童年龄数据'
        });
      }
    }

    // 检查难度等级无效的知识
    const knowledgeWithInvalidDifficulty = await neo4jService.query(`
      MATCH (k:Knowledge)
      WHERE k.difficulty_level < 0 OR k.difficulty_level > 1
      RETURN COLLECT(k.id) as knowledge_ids
    `);

    if (knowledgeWithInvalidDifficulty.length > 0) {
      const knowledgeIds = knowledgeWithInvalidDifficulty[0].get('knowledge_ids');
      if (knowledgeIds.length > 0) {
        issues.push({
          type: 'invalid_value',
          severity: 'medium',
          description: '部分知识难度等级无效（应在0-1之间）',
          affected_nodes: knowledgeIds,
          suggested_fix: '更正知识难度等级（0=最简单，1=最难）'
        });
      }
    }

    return issues;
  }

  /**
   * 检查孤立节点
   */
  private async checkOrphanedNodes(): Promise<DataQualityReport['issues']> {
    const issues: DataQualityReport['issues'] = [];

    // 检查没有关系的能力节点
    const orphanedAbilities = await neo4jService.query(`
      MATCH (a:Ability)
      WHERE NOT (a)-[]-()
      RETURN COLLECT(a.id) as ability_ids
    `);

    if (orphanedAbilities.length > 0) {
      const abilityIds = orphanedAbilities[0].get('ability_ids');
      if (abilityIds.length > 0) {
        issues.push({
          type: 'orphaned_node',
          severity: 'medium',
          description: '部分能力节点没有连接到任何其他节点',
          affected_nodes: abilityIds,
          suggested_fix: '为孤立的能力节点建立适当的关联关系'
        });
      }
    }

    return issues;
  }

  /**
   * 检查循环引用
   */
  private async checkCircularReferences(): Promise<DataQualityReport['issues']> {
    const issues: DataQualityReport['issues'] = [];

    // 检查知识前置关系的循环引用
    const circularPrerequisites = await neo4jService.query(`
      MATCH path = (k1:Knowledge)-[:PREREQUISITE*]->(k2:Knowledge)
      WHERE k1 = k2
      RETURN DISTINCT k1.id as knowledge_id, LENGTH(path) as cycle_length
    `);

    for (const record of circularPrerequisites) {
      const knowledgeId = record.get('knowledge_id');
      const cycleLength = record.get('cycle_length');

      issues.push({
        type: 'circular_reference',
        severity: 'critical',
        description: `知识前置关系存在循环引用（路径长度：${cycleLength}）`,
        affected_nodes: [knowledgeId],
        suggested_fix: '检查并修正知识前置关系，消除循环引用'
      });
    }

    return issues;
  }

  /**
   * 获取图统计数据
   */
  private async getGraphStatistics(): Promise<DataQualityReport['statistics']> {
    // 获取节点类型统计
    const nodeTypeStats = await neo4jService.query(`
      MATCH (n)
      RETURN labels(n)[0] as node_type, COUNT(n) as count
      ORDER BY count DESC
    `);

    const node_types: Record<string, number> = {};
    for (const record of nodeTypeStats) {
      const nodeType = record.get('node_type') || 'Unknown';
      const count = record.get('count');
      node_types[nodeType] = count;
    }

    // 获取关系类型统计
    const relationshipTypeStats = await neo4jService.query(`
      MATCH ()-[r]-()
      RETURN type(r) as relationship_type, COUNT(r) as count
      ORDER BY count DESC
    `);

    const relationship_types: Record<string, number> = {};
    for (const record of relationshipTypeStats) {
      const relationshipType = record.get('relationship_type');
      const count = record.get('count');
      relationship_types[relationshipType] = count;
    }

    // 计算连接性指标
    const connectivityMetrics = await this.calculateConnectivityMetrics();

    const node_counts = { total: 0, ...node_types };
    const relationship_counts = { total: 0, ...relationship_types };

    // 计算总数
    node_counts.total = Object.values(node_types).reduce((sum: number, count: number) => sum + count, 0) as number;
    relationship_counts.total = Object.values(relationship_types).reduce((sum: number, count: number) => sum + count, 0) as number;

    return {
      node_types,
      relationship_types,
      node_counts,
      relationship_counts,
      connectivity_metrics: connectivityMetrics
    };
  }

  /**
   * 计算连接性指标
   */
  private async calculateConnectivityMetrics(): Promise<DataQualityReport['statistics']['connectivity_metrics']> {
    // 计算平均度数
    const avgDegreeResult = await neo4jService.query(`
      MATCH (n)
      WITH n, SIZE((n)-[]-()) as degree
      RETURN AVG(degree) as average_degree, MAX(degree) as max_degree
    `);

    const average_degree = avgDegreeResult[0]?.get('average_degree') || 0;
    const max_degree = avgDegreeResult[0]?.get('max_degree') || 0;

    // 计算连通分量
    const componentsResult = await neo4jService.query(`
      CALL gds.wcc.stream({
        nodeProjection: '*',
        relationshipProjection: '*'
      })
      YIELD nodeId, componentId
      WITH componentId, COUNT(nodeId) as component_size
      RETURN COUNT(DISTINCT componentId) as connected_components,
             MAX(component_size) as largest_component_size
    `);

    const connected_components = componentsResult[0]?.get('connected_components') || 1;
    const largest_component_size = componentsResult[0]?.get('largest_component_size') || 0;

    return {
      average_degree,
      max_degree,
      connected_components,
      largest_component_size
    };
  }

  /**
   * 计算质量分数
   */
  private calculateQualityScore(
    issues: DataQualityReport['issues'],
    statistics: DataQualityReport['statistics']
  ): number {
    let totalScore = 100;
    let maxPenalty = 0;

    // 按严重程度扣分
    for (const issue of issues) {
      let penalty = 0;
      switch (issue.severity) {
        case 'critical':
          penalty = 20;
          break;
        case 'high':
          penalty = 10;
          break;
        case 'medium':
          penalty = 5;
          break;
        case 'low':
          penalty = 1;
          break;
      }

      // 根据影响节点数量调整扣分
      const affectedRatio = Math.min(issue.affected_nodes.length / statistics.node_counts.total, 1);
      totalScore -= penalty * affectedRatio;
      maxPenalty += penalty;
    }

    // 连接性奖励
    if (statistics.connectivity_metrics.connected_components === 1) {
      totalScore += 5; // 图是连通的
    }

    if (statistics.connectivity_metrics.average_degree > 2) {
      totalScore += 3; // 平均度数较高
    }

    return Math.max(0, Math.min(100, totalScore));
  }

  /**
   * 生成知识学习路径
   */
  async generateLearningPath(
    childId: string,
    params: PathGenerationParams
  ): Promise<KnowledgePathResult[]> {
    try {
      console.log(`Generating learning path for child ${childId}...`);

      // 获取儿童当前状态
      const childNode = await neo4jService.getChildById(childId);
      if (!childNode) {
        throw new Error(`Child not found: ${childId}`);
      }

      // 根据参数生成路径
      let paths: KnowledgePathResult[] = [];

      if (params.start_knowledge && params.target_knowledge) {
        // 指定起止点的路径
        paths = await this.generateSpecificPath(childId, params);
      } else if (params.target_knowledge) {
        // 从当前状态到目标知识的最短路径
        paths = await this.generatePathToTarget(childId, params);
      } else {
        // 基于学习风格的推荐路径
        paths = await this.generateRecommendedPaths(childId, params);
      }

      // 根据学习风格和难度偏好过滤和排序
      paths = this.filterAndSortPaths(paths, params);

      console.log(`Generated ${paths.length} learning paths`);
      return paths;

    } catch (error) {
      console.error('Failed to generate learning path:', error);
      throw error;
    }
  }

  /**
   * 生成指定起止点的学习路径
   */
  private async generateSpecificPath(
    _childId: string,
    params: PathGenerationParams
  ): Promise<KnowledgePathResult[]> {
    const query = `
      MATCH path = shortestPath(
        (start:Knowledge {id: $startId})-[:PREREQUISITE|RELATED_TO*1..${params.max_path_length}]->(end:Knowledge {id: $targetId})
      )
      RETURN path, LENGTH(path) as path_length
      ORDER BY path_length
      LIMIT 5
    `;

    const result = await neo4jService.query(query, {
      startId: params.start_knowledge,
      targetId: params.target_knowledge
    });

    const paths: KnowledgePathResult[] = [];

    for (const record of result) {
      const path = record.get('path') as Neo4jPath;

      const knowledgeSequence = path.segments.map((segment: Neo4jPathSegment): KnowledgeSequenceItem => {
        const difficulty = segment.end.properties.difficulty || 'beginner';
        const difficultyLevel = difficulty === 'beginner' ? 0.3 : difficulty === 'intermediate' ? 0.6 : 0.9;
        
        return {
          knowledge_id: segment.end.properties.id as string,
          title: segment.end.properties.title as string,
          difficulty_level: difficultyLevel,
          estimated_time: this.estimateLearningTime(difficultyLevel)
        };
      });

      paths.push({
        path_id: this.generateId('path'),
        knowledge_sequence: knowledgeSequence,
        total_estimated_time: knowledgeSequence.reduce((sum: number, k: KnowledgeSequenceItem) => sum + k.estimated_time, 0),
        difficulty_progression: knowledgeSequence.map((k: KnowledgeSequenceItem) => k.difficulty_level),
        confidence_score: this.calculatePathConfidence(knowledgeSequence),
        reasoning: `Direct path from ${params.start_knowledge} to ${params.target_knowledge}`,
        metadata: {
          start_knowledge: params.start_knowledge,
          target_knowledge: params.target_knowledge,
          max_path_length: params.max_path_length
        }
      });
    }

    return paths;
  }

  /**
   * 生成到目标知识的路径
   */
  private async generatePathToTarget(
    _childId: string,
    params: PathGenerationParams
  ): Promise<KnowledgePathResult[]> {
    // 获取当前掌握的知识
    const currentKnowledge = await neo4jService.getChildKnowledge(_childId);
    const currentKnowledgeIds = currentKnowledge.map(k => k.knowledge_id);

    const query = `
      MATCH (current:Knowledge)
      WHERE current.id IN $currentKnowledgeIds
      MATCH path = shortestPath(
        (current)-[:PREREQUISITE|RELATED_TO*1..${params.max_path_length}]->(target:Knowledge {id: $targetId})
      )
      RETURN path, LENGTH(path) as path_length, current.id as start_knowledge_id
      ORDER BY path_length
      LIMIT 3
    `;

    const result = await neo4jService.query(query, {
      currentKnowledgeIds,
      targetId: params.target_knowledge
    });

    const paths: KnowledgePathResult[] = [];

    for (const record of result) {
      const path = record.get('path') as Neo4jPath;

      const knowledgeSequence = path.segments.map((segment: Neo4jPathSegment): KnowledgeSequenceItem => ({
        knowledge_id: segment.end.properties.id as string,
        title: segment.end.properties.title as string,
        difficulty_level: segment.end.properties.difficulty_level as number,
        estimated_time: this.estimateLearningTime(segment.end.properties.difficulty_level as number)
      }));

      paths.push({
        path_id: this.generateId('path'),
        knowledge_sequence: knowledgeSequence,
        total_estimated_time: knowledgeSequence.reduce((sum: number, k: KnowledgeSequenceItem) => sum + k.estimated_time, 0),
        difficulty_progression: knowledgeSequence.map((k: KnowledgeSequenceItem) => k.difficulty_level),
        confidence_score: this.calculatePathConfidence(knowledgeSequence),
        reasoning: `Path to target knowledge ${params.target_knowledge} from current knowledge`,
        metadata: {
          target_knowledge: params.target_knowledge,
          current_knowledge_count: currentKnowledgeIds.length
        }
      });
    }

    return paths;
  }

  /**
   * 生成推荐学习路径
   */
  private async generateRecommendedPaths(
    childId: string,
    params: PathGenerationParams
  ): Promise<KnowledgePathResult[]> {
    // 基于年龄和当前水平推荐合适的学习路径
    const childNode = await neo4jService.getChildById(childId);
    if (!childNode) return [];

    const query = `
      MATCH (k:Knowledge)
      WHERE k.difficulty IN $difficultyLevels
      WITH k
      MATCH path = (k)-[:PREREQUISITE|RELATED_TO*1..${params.max_path_length}]->(next:Knowledge)
      WHERE next.difficulty IN $difficultyLevels
      RETURN path, LENGTH(path) as path_length
      ORDER BY k.credibilityScore DESC, path_length ASC
      LIMIT 10
    `;

    const difficultyLevels = params.difficulty_preference === 'challenge' 
      ? ['intermediate', 'advanced'] 
      : ['beginner', 'intermediate'];

    const result = await neo4jService.query(query, {
      age: childNode.age,
      difficultyLevels
    });

    const paths: KnowledgePathResult[] = [];

    for (const record of result) {
      const path = record.get('path') as Neo4jPath;

      const knowledgeSequence = path.segments.map((segment: Neo4jPathSegment): KnowledgeSequenceItem => ({
        knowledge_id: segment.end.properties.id as string,
        title: segment.end.properties.title as string,
        difficulty_level: segment.end.properties.difficulty_level as number,
        estimated_time: this.estimateLearningTime(segment.end.properties.difficulty_level as number)
      }));

      paths.push({
        path_id: this.generateId('path'),
        knowledge_sequence: knowledgeSequence,
        total_estimated_time: knowledgeSequence.reduce((sum: number, k: KnowledgeSequenceItem) => sum + k.estimated_time, 0),
        difficulty_progression: knowledgeSequence.map((k: KnowledgeSequenceItem) => k.difficulty_level),
        confidence_score: this.calculatePathConfidence(knowledgeSequence),
        reasoning: `Generated ${knowledgeSequence.length} knowledge items for child aged ${childNode.age}`,
        metadata: {
          child_age: childNode.age,
          difficulty_levels: difficultyLevels
        }
      });
    }

    return paths;
  }

  /**
   * 估算学习时间
   */
  private estimateLearningTime(difficultyLevel: number): number {
    // 基础时间30分钟，根据难度调整
    const baseTime = 30;
    const difficultyMultiplier = 0.5 + difficultyLevel * 2;
    return Math.round(baseTime * difficultyMultiplier);
  }

  /**
   * 计算路径置信度
   */
  private calculatePathConfidence(knowledgeSequence: KnowledgeSequenceItem[]): number {
    if (knowledgeSequence.length === 0) return 0;

    let score = 0.5;

    for (let i = 1; i < knowledgeSequence.length; i++) {
      const prevDifficulty = knowledgeSequence[i - 1].difficulty_level;
      const currDifficulty = knowledgeSequence[i].difficulty_level;

      const difficultyDiff = Math.abs(currDifficulty - prevDifficulty);
      if (difficultyDiff <= 0.3) {
        score += 0.1;
      } else if (difficultyDiff > 0.5) {
        score -= 0.1;
      }
    }

    return Math.max(0.1, Math.min(1.0, score));
  }

  /**
   * 过滤和排序路径
   */
  private filterAndSortPaths(
    paths: KnowledgePathResult[],
    params: PathGenerationParams
  ): KnowledgePathResult[] {
    // 过滤置信度不足的路径
    let filteredPaths = paths.filter(path =>
      path.confidence_score >= params.min_confidence
    );

    // 根据学习风格和难度偏好排序
    filteredPaths.sort((a, b) => {
      // 优先考虑置信度
      if (Math.abs(a.confidence_score - b.confidence_score) > 0.1) {
        return b.confidence_score - a.confidence_score;
      }

      // 然后考虑难度偏好
      const aAvgDifficulty = a.difficulty_progression.reduce((sum, d) => sum + d, 0) / a.difficulty_progression.length;
      const bAvgDifficulty = b.difficulty_progression.reduce((sum, d) => sum + d, 0) / b.difficulty_progression.length;

      if (params.difficulty_preference === 'gradual') {
        return aAvgDifficulty - bAvgDifficulty; // 优先选择简单路径
      } else if (params.difficulty_preference === 'challenge') {
        return bAvgDifficulty - aAvgDifficulty; // 优先选择挑战路径
      }

      return 0;
    });

    return filteredPaths.slice(0, 5); // 返回前5条路径
  }

  /**
   * 数据验证方法
   */
  private validateChildData(child: ChildNode): void {
    if (!child.name || child.name.trim().length === 0) {
      throw new Error('Child name is required');
    }

    if (child.age < 0 || child.age > 18) {
      throw new Error('Child age must be between 0 and 18');
    }

    if (!['male', 'female', 'other'].includes(child.gender)) {
      throw new Error('Child gender must be male, female, or other');
    }
  }

  private validateKnowledgeData(knowledge: KnowledgeNode): void {
    if (!knowledge.title || knowledge.title.trim().length === 0) {
      throw new Error('Knowledge title is required');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(knowledge.difficulty)) {
      throw new Error('Knowledge difficulty must be beginner, intermediate, or advanced');
    }

    if (knowledge.credibilityScore < 0 || knowledge.credibilityScore > 1) {
      throw new Error('Knowledge credibility score must be between 0 and 1');
    }

    if (knowledge.effectiveness < 0 || knowledge.effectiveness > 1) {
      throw new Error('Knowledge effectiveness must be between 0 and 1');
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * 导出知识图谱数据
   */
  async exportKnowledgeGraph(format: 'json' | 'csv' | 'graphml' = 'json'): Promise<KnowledgeGraphExportData> {
    try {
      console.log(`Exporting knowledge graph in ${format} format...`);

      switch (format) {
        case 'json':
          return await this.exportAsJSON();
        case 'csv':
          return await this.exportAsCSV();
        case 'graphml':
          return await this.exportAsGraphML();
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

    } catch (error) {
      console.error('Failed to export knowledge graph:', error);
      throw error;
    }
  }

  /**
   * 导出为JSON格式
   */
  private async exportAsJSON(): Promise<KnowledgeGraphExportData> {
    const nodes = await neo4jService.query('MATCH (n) RETURN n');
    const relationships = await neo4jService.query('MATCH ()-[r]->() RETURN r, startNode(r) as start, endNode(r) as end');

    const exportData: KnowledgeGraphExportData = {
      metadata: {
        export_timestamp: Date.now(),
        total_nodes: nodes.length,
        total_relationships: relationships.length,
        format: 'json'
      },
      nodes: nodes.map(record => record.get('n').properties),
      relationships: relationships.map(record => ({
        id: record.get('r').elementId,
        type: record.get('r').type,
        start_node: record.get('start').properties.id,
        end_node: record.get('end').properties.id,
        properties: record.get('r').properties
      }))
    };

    return exportData;
  }

  /**
   * 导出为CSV格式
   */
  private async exportAsCSV(): Promise<{ nodes: string, relationships: string }> {
    const nodeQuery = `
      MATCH (n)
      RETURN labels(n)[0] as label, n.id as id, properties(n) as properties
    `;

    const relationshipQuery = `
      MATCH ()-[r]->()
      RETURN type(r) as type, startNode(r).id as start_id, endNode(r).id as end_id, properties(r) as properties
    `;

    const nodes = await neo4jService.query(nodeQuery);
    const relationships = await neo4jService.query(relationshipQuery);

    // 简化的CSV生成（实际应用中应该使用专门的CSV库）
    const nodeHeaders = 'label,id,properties';
    const nodeRows = nodes.map(record =>
      `${record.get('label')},${record.get('id')},"${JSON.stringify(record.get('properties'))}"`
    ).join('\n');

    const relationshipHeaders = 'type,start_id,end_id,properties';
    const relationshipRows = relationships.map(record =>
      `${record.get('type')},${record.get('start_id')},${record.get('end_id')},"${JSON.stringify(record.get('properties'))}"`
    ).join('\n');

    return {
      nodes: nodeHeaders + '\n' + nodeRows,
      relationships: relationshipHeaders + '\n' + relationshipRows
    };
  }

  /**
   * 导出为GraphML格式
   */
  private async exportAsGraphML(): Promise<string> {
    // GraphML是XML格式，用于图数据的标准化导出
    // 这里提供简化的GraphML生成
    const nodes = await neo4jService.query('MATCH (n) RETURN n');
    const relationships = await neo4jService.query('MATCH ()-[r]->() RETURN r, startNode(r) as start, endNode(r) as end');

    let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns
         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">
  <graph id="YYC3_Knowledge_Graph" edgedefault="directed">`;

    // 添加节点
    for (const record of nodes) {
      const node = record.get('n');
      graphml += `
    <node id="${node.properties.id}">
      <data key="label">${node.properties.title || node.properties.name || ''}</data>
      <data key="type">${node.labels[0]}</data>
    </node>`;
    }

    // 添加边
    for (const record of relationships) {
      const start = record.get('start');
      const end = record.get('end');
      const relationship = record.get('r');

      graphml += `
    <edge source="${start.properties.id}" target="${end.properties.id}">
      <data key="label">${relationship.type}</data>
    </edge>`;
    }

    graphml += `
  </graph>
</graphml>`;

    return graphml;
  }

  /**
   * 设置导入配置
   */
  setImportConfig(config: Partial<ImportConfig>): void {
    this.importConfig = { ...this.importConfig, ...config };
  }

  /**
   * 获取导入配置
   */
  getImportConfig(): ImportConfig {
    return { ...this.importConfig };
  }
}

// 创建并导出知识图谱管理器单例
const knowledgeGraphManager = new KnowledgeGraphManager();
export default knowledgeGraphManager;