/**
 * @file Neo4jService.ts
 * @description YYC³ AI小语智能成长守护系统Neo4j知识图谱服务，提供知识图谱构建、查询和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import neo4j, { Driver, Record as Neo4jRecord } from 'neo4j-driver';

export interface NodeProperty {
  name: string;
  type: string;
  value: unknown;
}

export interface RecordType {
  [key: string]: unknown;
}

export interface Neo4jNode {
  elementId: string;
  labels: string[];
  properties: RecordType;
}

export interface Neo4jRelationship {
  elementId: string;
  type: string;
  startNodeElementId: string;
  endNodeElementId: string;
  properties: RecordType;
}

// 类型定义
export interface GraphNode {
  id: string;
  labels: string[];
  properties: RecordType;
}

export interface GraphRelationship {
  id: string;
  type: string;
  startNode: string;
  endNode: string;
  properties: RecordType;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  ageGroup: string[];
  tags: string[];
  source: string;
  credibilityScore: number;
  effectiveness: number;
  lastUpdated: Date;
}

export interface ChildNode {
  id: string;
  name: string;
  birthDate: Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  interests: string[];
  abilities: string[];
  personality: string;
  learningStyle: string;
  familyBackground: RecordType;
}

export interface AbilityNode {
  id: string;
  name: string;
  domain: string;
  level: string;
  description: string;
  developmentStage: string;
  importance: number;
  relatedSkills: string[];
  assessmentCriteria: string[];
}

export interface ActivityNode {
  id: string;
  name: string;
  type: string;
  duration: number;
  difficulty: string;
  ageGroup: string[];
  objectives: string[];
  materials: string[];
  instructions: string;
  effectiveness: number;
  preparationTime: number;
  requiredSpace: number;
}

export interface RecommendationResult {
  id: string;
  item_id: string;
  type: 'knowledge' | 'activity' | 'ability';
  item_type: 'knowledge' | 'activity' | 'ability';
  title: string;
  description: string;
  relevanceScore: number;
  recommendation_score: number;
  confidence: number;
  reasoning: string;
  metadata: RecordType;
}

export interface UserProfile {
  child: ChildNode;
  interests: Record<string, number>;
  abilities: Record<string, number>;
  personality: string;
  learningStyle: string;
  developmentStage: string;
  lastUpdated: Date;
}

export interface GraphPath {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
  score: number;
  pathType: string;
}

export interface KnowledgePathResult {
  path_id: string;
  knowledge_sequence: Array<{
    knowledge_id: string;
    title: string;
    difficulty_level: number;
    estimated_time: number;
  }>;
  total_estimated_time: number;
  difficulty_progression: number[];
  confidence_score: number;
  reasoning: string;
  metadata: RecordType;
}

export interface Neo4jPathSegment {
  start: Neo4jNode;
  end: Neo4jNode;
  relationship: Neo4jRelationship;
}

export interface Neo4jPath {
  start: Neo4jNode;
  end: Neo4jNode;
  segments: Neo4jPathSegment[];
  length: number;
}

/**
 * Neo4j知识图谱服务
 * 负责图数据库的操作、知识图谱的构建和查询
 */
export class Neo4jService {
  private driver: Driver | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.driver = null;
    this.isConnected = false;
  }

  /**
   * 连接到Neo4j数据库
   */
  async connect(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        process.env.NEO4J_URI || 'bolt://localhost:7687',
        neo4j.auth.basic(
          process.env.NEO4J_USERNAME || 'neo4j',
          process.env.NEO4J_PASSWORD || 'yyc3_password'
        )
      );

      // 验证连接
      if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
      await session.run('RETURN 1');
      await session.close();

      this.isConnected = true;
      console.log('✅ Neo4j连接成功');

    } catch (error) {
      console.error('❌ Neo4j连接失败:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * 断开Neo4j连接
   */
  async disconnect(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.driver = null;
      this.isConnected = false;
      console.log('✅ Neo4j连接已断开');
    }
  }

  /**
   * 创建知识节点
   */
  async createKnowledgeNode(knowledge: KnowledgeNode): Promise<void> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
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
            k.lastUpdated = datetime($lastUpdated)
      `;

      await session.run(query, {
        id: knowledge.id,
        title: knowledge.title,
        content: knowledge.content,
        category: knowledge.category,
        difficulty: knowledge.difficulty,
        ageGroup: knowledge.ageGroup,
        tags: knowledge.tags,
        source: knowledge.source,
        credibilityScore: knowledge.credibilityScore,
        effectiveness: knowledge.effectiveness,
        lastUpdated: knowledge.lastUpdated
      });

    } catch (error) {
      console.error('创建知识节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 创建儿童节点
   */
  async createChildNode(child: ChildNode): Promise<void> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MERGE (c:Child {id: $id})
        SET c.name = $name,
            c.birthDate = date($birthDate),
            c.age = $age,
            c.gender = $gender,
            c.interests = $interests,
            c.abilities = $abilities,
            c.personality = $personality,
            c.learningStyle = $learningStyle,
            c.familyBackground = $familyBackground
      `;

      await session.run(query, {
        id: child.id,
        name: child.name,
        birthDate: child.birthDate,
        age: child.age,
        gender: child.gender,
        interests: child.interests,
        abilities: child.abilities,
        personality: child.personality,
        learningStyle: child.learningStyle,
        familyBackground: child.familyBackground
      });

    } catch (error) {
      console.error('创建儿童节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 创建能力节点
   */
  async createAbilityNode(ability: AbilityNode): Promise<void> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MERGE (a:Ability {id: $id})
        SET a.name = $name,
            a.domain = $domain,
            a.level = $level,
            a.description = $description,
            a.developmentStage = $developmentStage,
            a.importance = $importance,
            a.relatedSkills = $relatedSkills,
            a.assessmentCriteria = $assessmentCriteria
      `;

      await session.run(query, {
        id: ability.id,
        name: ability.name,
        domain: ability.domain,
        level: ability.level,
        description: ability.description,
        developmentStage: ability.developmentStage,
        importance: ability.importance,
        relatedSkills: ability.relatedSkills,
        assessmentCriteria: ability.assessmentCriteria
      });

    } catch (error) {
      console.error('创建能力节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 创建活动节点
   */
  async createActivityNode(activity: ActivityNode): Promise<void> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MERGE (act:Activity {id: $id})
        SET act.name = $name,
            act.type = $type,
            act.duration = $duration,
            act.difficulty = $difficulty,
            act.ageGroup = $ageGroup,
            act.objectives = $objectives,
            act.materials = $materials,
            act.instructions = $instructions,
            act.effectiveness = $effectiveness,
            act.preparationTime = $preparationTime,
            act.requiredSpace = $requiredSpace
      `;

      await session.run(query, {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        duration: activity.duration,
        difficulty: activity.difficulty,
        ageGroup: activity.ageGroup,
        objectives: activity.objectives,
        materials: activity.materials,
        instructions: activity.instructions,
        effectiveness: activity.effectiveness,
        preparationTime: activity.preparationTime,
        requiredSpace: activity.requiredSpace
      });

    } catch (error) {
      console.error('创建活动节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 创建关系
   */
  async createRelationship(
    startNodeId: string,
    endNodeId: string,
    relationshipType: string,
    properties: RecordType = {}
  ): Promise<void> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (startNode), (endNode)
        WHERE startNode.id = $startNodeId AND endNode.id = $endNodeId
        MERGE (startNode)-[r:${relationshipType}]->(endNode)
        SET r += $properties
      `;

      await session.run(query, {
        startNodeId,
        endNodeId,
        relationshipType,
        properties
      });

    } catch (error) {
      console.error('创建关系失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 查询知识图谱路径
   */
  async findGraphPath(
    startId: string,
    endId: string,
    maxDepth: number = 5,
    relationshipTypes?: string[]
  ): Promise<GraphPath[]> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      let query = `
        MATCH path = shortestPath((start {id: $startId})-[*1..$maxDepth]-(end {id: $endId}))
        RETURN path,
               [node in nodes(path) | node.id] as nodeIds,
               [rel in relationships(path) | type(rel)] as relationshipTypes,
               length(path) as depth
        ORDER BY depth
      `;

      if (relationshipTypes && relationshipTypes.length > 0) {
        query = `
          MATCH path = shortestPath((start {id: $startId})-[r*1..$maxDepth]-(end {id: $endId}))
          WHERE type(r) IN $relationshipTypes
          RETURN path,
                 [node in nodes(path) | node.id] as nodeIds,
                 [rel in relationships(path) | type(rel)] as relationshipTypes,
                 length(path) as depth
          ORDER BY depth
        `;
      }

      const result = await session.run(query, {
        startId,
        endId,
        maxDepth,
        relationshipTypes
      });

      if (result.records.length === 0) {
        return [];
      }

      return result.records.map((record: Neo4jRecord) => ({
        nodes: record.get('path').nodes.map((node: Neo4jNode) => ({
          id: node.elementId,
          labels: node.labels,
          properties: node.properties
        })),
        relationships: record.get('path').relationships.map((rel: Neo4jRelationship) => ({
          id: rel.elementId,
          type: rel.type,
          startNode: rel.startNodeElementId,
          endNode: rel.endNodeElementId,
          properties: rel.properties
        })),
        score: 1.0 / (record.get('depth') + 1),
        pathType: this.getPathType(record.get('relationshipTypes'))
      }));

    } catch (error) {
      console.error('查询图谱路径失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 基于用户的相似性推荐
   */
  async findSimilarChildren(
    childId: string,
    similarityThreshold: number = 0.5,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (target:Child {id: $childId})-[:HAS_ABILITY|:HAS_INTEREST]->(ability)
        MATCH (similar:Child)-[:HAS_ABILITY|:INTEREST]->(ability)
        WHERE target <> similar
        WITH similar, COUNT(DISTINCT ability) as similarity
        MATCH (similar)-[:HAS_ABILITY]->(sharedAbility)
        WHERE sharedAbility IN (target)-[:HAS_ABILITY]->()
        RETURN similar.id as childId,
               similar.name as title,
               'child' as type,
               similarity / (size((target)-[:HAS_ABILITY]->()) + 1) as relevanceScore,
               {
                 sharedInterests: COLLECT(DISTINCT ability),
                 totalAbilities: size((target)-[:HAS_ABILITY]->())
               } as metadata
        ORDER BY relevanceScore DESC
        LIMIT $limit
      `;

      const result = await session.run(query, {
        childId,
        similarityThreshold,
        limit
      });

      return result.records.map((record: Neo4jRecord) => ({
        id: record.get('childId'),
        item_id: record.get('childId'),
        type: record.get('type'),
        item_type: record.get('type') as 'knowledge' | 'activity' | 'ability',
        title: record.get('title'),
        description: `与目标儿童有${Math.round(record.get('relevanceScore') * 100)}%相似度`,
        relevanceScore: record.get('relevanceScore'),
        recommendation_score: record.get('relevanceScore'),
        confidence: record.get('relevanceScore'),
        reasoning: this.generateReasoning('similar_child', record.get('metadata')),
        metadata: record.get('metadata')
      }));

    } catch (error) {
      console.error('查找相似儿童失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 基于知识的推荐
   */
  async recommendKnowledge(
    childId: string,
    category?: string,
    difficulty?: string,
    ageGroup?: string,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      let query = `
        MATCH (c:Child {id: $childId})
        `;

      // 年龄筛选
      if (ageGroup) {
        query += `
          MATCH (c)-[:HAS_ABILITY|:HAS_INTEREST]->(a:Ability)-[:DEVELOPS_BY]->(k:Knowledge)
          WHERE ANY(ageGroup IN k.ageGroup)
        `;
      } else {
        query += `
          MATCH (c)-[:HAS_ABILITY|:HAS_INTEREST|:RELATED_TO]->(k:Knowledge)
          WHERE k.ageGroup CONTAINS toString(c.age)
        `;
      }

      // 类别和难度筛选
      if (category) {
        query += ` AND k.category = $category`;
      }
      if (difficulty) {
        query += ` AND k.difficulty = $difficulty`;
      }

      query += `
        WITH DISTINCT k
        RETURN k.id as id,
               k.title as title,
               'knowledge' as type,
               k.description as description,
               k.effectiveness as relevanceScore,
               {
                 category: k.category,
                 difficulty: k.difficulty,
                 ageGroup: k.ageGroup,
                 tags: k.tags,
                 credibilityScore: k.credibilityScore
               } as metadata
        ORDER BY k.effectiveness DESC, k.credibilityScore DESC
        LIMIT $limit
      `;

      const result = await session.run(query, {
        childId,
        category,
        difficulty,
        ageGroup,
        limit
      });

      return result.records.map((record: Neo4jRecord) => ({
        id: record.get('id'),
        item_id: record.get('id'),
        type: record.get('type'),
        item_type: record.get('type') as 'knowledge' | 'activity' | 'ability',
        title: record.get('title'),
        description: record.get('description'),
        relevanceScore: record.get('relevanceScore'),
        recommendation_score: record.get('relevanceScore'),
        confidence: record.get('relevanceScore'),
        reasoning: this.generateReasoning('knowledge_recommendation', record.get('metadata')),
        metadata: record.get('metadata')
      }));

    } catch (error) {
      console.error('推荐知识失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 基于活动的推荐
   */
  async recommendActivities(
    childId: string,
    activityType?: string,
    difficulty?: string,
    ageGroup?: string,
    duration?: { min?: number; max?: number },
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      let query = `
        MATCH (c:Child {id: $childId})
        `;

      // 年龄适配
      if (ageGroup) {
        query += `
          MATCH (c)-[:HAS_ABILITY]->(a:Ability)-[:DEVELOPS_BY]->(act:Activity)
          WHERE ANY(ageGroup IN act.ageGroup)
        `;
      } else {
        query += `
          MATCH (c)-[:HAS_ABILITY|:HAS_INTEREST]->(a:Ability)
          MATCH (a)-[:DEVELOPS_BY]->(act:Activity)
          WHERE act.ageGroup CONTAINS toString(c.age)
        `;
      }

      // 类型和难度筛选
      if (activityType) {
        query += ` AND act.type = $activityType`;
      }
      if (difficulty) {
        query += ` AND act.difficulty = $difficulty`;
      }

      // 时长筛选
      if (duration?.min || duration?.max) {
        if (duration.min) {
          query += ` AND act.duration >= ${duration.min}`;
        }
        if (duration.max) {
          query += ` AND act.duration <= ${duration.max}`;
        }
      }

      query += `
        WITH DISTINCT act
        RETURN act.id as id,
               act.name as title,
               'activity' as type,
               act.description as description,
               act.effectiveness as relevanceScore,
               {
                 type: act.type,
                 duration: act.duration,
                 difficulty: act.difficulty,
                 ageGroup: act.ageGroup,
                 objectives: act.objectives,
                 preparationTime: act.preparationTime
               } as metadata
        ORDER BY act.effectiveness DESC
        LIMIT $limit
      `;

      const result = await session.run(query, {
        childId,
        activityType,
        difficulty,
        ageGroup,
        duration,
        limit
      });

      return result.records.map((record: Neo4jRecord) => ({
        id: record.get('id'),
        item_id: record.get('id'),
        type: record.get('type'),
        item_type: record.get('type') as 'knowledge' | 'activity' | 'ability',
        title: record.get('title'),
        description: record.get('description'),
        relevanceScore: record.get('relevanceScore'),
        recommendation_score: record.get('relevanceScore'),
        confidence: record.get('relevanceScore'),
        reasoning: this.generateReasoning('activity_recommendation', record.get('metadata')),
        metadata: record.get('metadata')
      }));

    } catch (error) {
      console.error('推荐活动失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 获取图谱统计信息
   */
  async getGraphStats(): Promise<{
    nodeCount: number;
    relationshipCount: number;
    nodeTypes: Record<string, number>;
    relationshipTypes: Record<string, number>;
  }> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      // 统计节点数量和类型
      const nodeStats = await session.run(`
        MATCH (n)
        RETURN labels(n) as nodeTypes, count(n) as nodeCount
      `);

      // 统计关系数量和类型
      const relStats = await session.run(`
        MATCH ()-[r]->()
        RETURN type(r) as relationshipTypes, count(r) as relationshipCount
      `);

      // 统计总节点和关系数
      const totalStats = await session.run(`
        MATCH (n) RETURN count(n) as nodeCount
      `);

      const totalRelStats = await session.run(`
        MATCH ()-[r]->() RETURN count(r) as relationshipCount
      `);

      const nodeTypes: Record<string, number> = {};
      nodeStats.records.forEach((record: Neo4jRecord) => {
        const types = record.get('nodeTypes');
        const count = record.get('nodeCount');
        nodeTypes[types.join(',')] = count;
      });

      const relationshipTypes: Record<string, number> = {};
      relStats.records.forEach((record: Neo4jRecord) => {
        const type = record.get('relationshipTypes');
        const count = record.get('relationshipCount');
        relationshipTypes[type] = count;
      });

      return {
        nodeCount: totalStats.records[0].get('nodeCount'),
        relationshipCount: totalRelStats.records[0].get('relationshipCount'),
        nodeTypes,
        relationshipTypes
      };

    } catch (error) {
      console.error('获取图谱统计失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 查询特定节点信息
   */
  async getNodeById(id: string, label?: string): Promise<GraphNode | null> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      let query = `
        MATCH (n ${label ? ':' + label : ''} {id: $id})
        RETURN n
      `;

      const result = await session.run(query, { id });

      if (result.records.length === 0) {
        return null;
      }

      const node = result.records[0].get('n');
      return {
        id: node.elementId,
        labels: node.labels,
        properties: node.properties
      };

    } catch (error) {
      console.error('查询节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 执行自定义Cypher查询
   */
  async executeQuery<T = unknown>(cypher: string, parameters: RecordType = {}): Promise<T> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const result = await session.run(cypher, parameters);
      return result as T;

    } catch (error) {
      console.error('执行查询失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 执行Cypher查询（兼容性方法）
   */
  async query(cypher: string, parameters: RecordType = {}): Promise<Neo4jRecord[]> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const result = await session.run(cypher, parameters);
      return result.records.map((record: Neo4jRecord) => record);

    } catch (error) {
      console.error('执行查询失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 根据ID获取儿童节点
   */
  async getChildById(childId: string): Promise<ChildNode | null> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (c:Child {id: $childId})
        RETURN c
      `;

      const result = await session.run(query, { childId });

      if (result.records.length === 0) {
        return null;
      }

      const node = result.records[0].get('c');
      return {
        id: node.properties.id,
        name: node.properties.name,
        birthDate: new Date(node.properties.birthDate),
        age: node.properties.age,
        gender: node.properties.gender,
        interests: node.properties.interests || [],
        abilities: node.properties.abilities || [],
        personality: node.properties.personality,
        learningStyle: node.properties.learningStyle,
        familyBackground: node.properties.familyBackground || {}
      };

    } catch (error) {
      console.error('查询儿童节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 获取儿童的知识节点和掌握程度
   */
  async getChildKnowledge(childId: string): Promise<Array<{knowledge_id: string, title: string, mastery_level: number}>> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (c:Child {id: $childId})-[hk:HAS_KNOWLEDGE]->(k:Knowledge)
        RETURN k.id as knowledge_id, k.title as title, k.description as description, hk.mastery_level as mastery_level
      `;

      const result = await session.run(query, { childId });

      return result.records.map((record: Neo4jRecord) => ({
        knowledge_id: record.get('knowledge_id'),
        title: record.get('title'),
        description: record.get('description'),
        mastery_level: record.get('mastery_level')
      }));

    } catch (error) {
      console.error('查询儿童知识节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 获取儿童的能力节点和水平
   */
  async getChildAbilities(childId: string): Promise<Array<{ability_id: string, title: string, level: number}>> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (c:Child {id: $childId})-[ha:HAS_ABILITY]->(a:Ability)
        RETURN a.id as ability_id, a.name as title, ha.level as level
      `;

      const result = await session.run(query, { childId });

      return result.records.map((record: Neo4jRecord) => ({
        ability_id: record.get('ability_id'),
        title: record.get('title'),
        level: record.get('level')
      }));

    } catch (error) {
      console.error('查询儿童能力节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 获取儿童的活动节点和完成率
   */
  async getChildActivities(childId: string): Promise<Array<{activity_id: string, title: string, description: string, completion_rate: number}>> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      const query = `
        MATCH (c:Child {id: $childId})-[ha:HAS_ACTIVITY]->(a:Activity)
        RETURN a.id as activity_id, a.name as title, a.description as description, ha.completion_rate as completion_rate
      `;

      const result = await session.run(query, { childId });

      return result.records.map((record: Neo4jRecord) => ({
        activity_id: record.get('activity_id'),
        title: record.get('title'),
        description: record.get('description'),
        completion_rate: record.get('completion_rate')
      }));

    } catch (error) {
      console.error('查询儿童活动节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 批量创建节点
   */
  async batchCreateNodes(nodes: GraphNode[]): Promise<number> {
    this.ensureConnected();

    if (!this.driver) throw new Error("Driver not initialized"); const session = this.driver.session();
    try {
      let createdCount = 0;

      for (const node of nodes) {
        const labels = node.labels.map(label => `:${label}`).join('');
        const properties = node.properties;

        await session.run(`
          MERGE (${labels} {id: $id})
          SET node += $properties
        `, {
          id: node.id,
          properties
        });

        createdCount++;
      }

      return createdCount;

    } catch (error) {
      console.error('批量创建节点失败:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * 检查连接状态
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * 确保连接状态
   */
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Neo4j服务未连接，请先调用connect()方法');
    }
  }

  /**
   * 获取路径类型
   */
  private getPathType(relationshipTypes: string[]): string {
    if (relationshipTypes.includes('DEVELOPS_BY')) return 'development_path';
    if (relationshipTypes.includes('RELATED_TO')) return 'knowledge_path';
    if (relationshipTypes.includes('HAS_ABILITY')) return 'ability_path';
    return 'mixed_path';
  }

  /**
   * 生成推荐推理说明
   */
  private generateReasoning(type: string, metadata: RecordType): string {
    switch (type) {
      case 'similar_child':
        return `基于共享能力${metadata.sharedInterests?.length || 0}个，总能力${metadata.totalAbilities || 0}个，相似度${Math.round(((metadata.sharedInterests?.length || 0) / (metadata.totalAbilities || 1)) * 100)}%`;

      case 'knowledge_recommendation':
        return `基于可信度评分${metadata.credibilityScore}和有效性${metadata.effectiveness}，匹配儿童${metadata.ageGroup?.join('、') || '适合'}的发展需求`;

      case 'activity_recommendation':
        return `匹配儿童能力发展需求，活动类型${metadata.type}，难度${metadata.difficulty}，准备时间${metadata.preparationTime}分钟`;

      default:
        return '基于知识图谱的智能推荐';
    }
  }
}

// 创建单例实例
export const neo4jService = new Neo4jService();

// 导出类型和服务
export default neo4jService;