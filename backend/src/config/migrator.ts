import fs from 'fs';
import path from 'path';
import { db, pool } from './database';
import { Logger } from './logger';

const logger = Logger.getInstance();

export interface Migration {
  id: string;
  name: string;
  version: string;
  description: string;
  up: string;
  down: string;
  executed_at?: Date;
}

export class DatabaseMigrator {
  private migrationsPath: string;

  constructor(migrationsPath: string = './src/migrations') {
    this.migrationsPath = migrationsPath;
  }

  // 获取所有迁移文件
  private async getMigrationFiles(): Promise<string[]> {
    try {
      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort(); // 按字母顺序排序

      logger.info(`Found ${files.length} migration files`);
      return files;
    } catch (error) {
      logger.error('Failed to read migration directory:', error as Record<string, unknown>);
      throw new Error(`Failed to read migration directory: ${this.migrationsPath}`);
    }
  }

  // 创建迁移表
  private async createMigrationsTable(): Promise<void> {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          version VARCHAR(50) NOT NULL,
          description TEXT,
          executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      logger.info('Migrations table created or verified');
    } catch (error) {
      logger.error('Failed to create migrations table:', error as Record<string, unknown>);
      throw error;
    }
  }

  // 获取已执行的迁移
  private async getExecutedMigrations(): Promise<Migration[]> {
    try {
      const result = await db.query(`
        SELECT id, name, version, description, executed_at
        FROM migrations
        ORDER BY executed_at ASC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Failed to get executed migrations:', error as Record<string, unknown>);
      return [];
    }
  }

  // 读取迁移文件内容
  private readMigrationFile(filename: string): { up: string; down: string } {
    const filePath = path.join(this.migrationsPath, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    // 分离up和down迁移
    const parts = content.split(/--\s*DOWN\s*--/);

    return {
      up: parts[0]?.trim() || '',
      down: parts[1]?.trim() || '',
    };
  }

  // 执行单个迁移
  private async executeMigration(migration: Migration): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 执行up迁移
      logger.info(`Executing migration: ${migration.name}`);
      await client.query(migration.up);

      // 记录迁移
      await client.query(`
        INSERT INTO migrations (id, name, version, description)
        VALUES ($1, $2, $3, $4)
      `, [migration.id, migration.name, migration.version, migration.description]);

      await client.query('COMMIT');
      logger.info(`Migration ${migration.name} executed successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to execute migration ${migration.name}:`, error as Record<string, unknown>);
      throw error;
    } finally {
      client.release();
    }
  }

  // 回滚单个迁移
  private async rollbackMigration(migration: Migration): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      if (!migration.down) {
        throw new Error(`No rollback script available for migration ${migration.name}`);
      }

      logger.info(`Rolling back migration: ${migration.name}`);
      await client.query(migration.down);

      // 删除迁移记录
      await client.query('DELETE FROM migrations WHERE id = $1', [migration.id]);

      await client.query('COMMIT');
      logger.info(`Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Failed to rollback migration ${migration.name}:`, error as Record<string, unknown>);
      throw error;
    } finally {
      client.release();
    }
  }

  // 解析迁移文件信息
  private parseMigrationInfo(filename: string, content: string): Omit<Migration, 'up' | 'down'> {
    const lines = content.split('\n').slice(0, 10);
    const metadata: Record<string, unknown> = {};

    for (const line of lines) {
      const match = line.match(/--\s*(\w+):\s*(.+)/);
      if (match && match[1] && match[2]) {
        metadata[match[1].toLowerCase()] = match[2];
      }
    }

    // 从文件名提取基本信息
    const baseName = path.basename(filename, '.sql');
    const parts = baseName.split('_');

    return {
      id: (metadata.id as string) || parts.slice(0, 2).join('_'),
      name: (metadata.name as string) || parts.slice(2).join('_').replace(/-/g, ' '),
      version: (metadata.version as string) || '1.0.0',
      description: (metadata.description as string) || `Migration ${baseName}`,
    };
  }

  // 获取待执行的迁移
  private async getPendingMigrations(): Promise<Migration[]> {
    const migrationFiles = await this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    const executedIds = new Set(executedMigrations.map(m => m.id));

    const pendingMigrations: Migration[] = [];

    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(this.migrationsPath, file), 'utf-8');
      const { up, down } = this.readMigrationFile(file);
      const info = this.parseMigrationInfo(file, content);

      if (!executedIds.has(info.id)) {
        pendingMigrations.push({
          ...info,
          up,
          down,
        });
      }
    }

    return pendingMigrations;
  }

  // 运行迁移
  async run(): Promise<void> {
    try {
      logger.info('Starting database migration...');

      // 创建迁移表
      await this.createMigrationsTable();

      // 获取待执行的迁移
      const pendingMigrations = await this.getPendingMigrations();

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations. Database is up to date.');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      // 执行所有待迁移
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info('Database migration completed successfully');
    } catch (error) {
      logger.error('Database migration failed:', error as Record<string, unknown>);
      throw error;
    }
  }

  // 回滚迁移
  async rollback(targetVersion?: string): Promise<void> {
    try {
      logger.info('Starting database rollback...');

      const executedMigrations = await this.getExecutedMigrations();

      let migrationsToRollback = [...executedMigrations].reverse();

      if (targetVersion) {
        migrationsToRollback = migrationsToRollback.filter(m =>
          m.version > targetVersion
        );
      } else if (migrationsToRollback.length > 0) {
        const lastMigration = migrationsToRollback[0];
        if (lastMigration) {
          migrationsToRollback = [lastMigration];
        }
      } else {
        logger.info('No migrations to rollback');
        return;
      }

      if (migrationsToRollback.length === 0) {
        logger.info('No migrations found to rollback');
        return;
      }

      logger.info(`Rolling back ${migrationsToRollback.length} migration(s)`);

      for (const migration of migrationsToRollback) {
        await this.rollbackMigration(migration);
      }

      logger.info('Database rollback completed successfully');
    } catch (error) {
      logger.error('Database rollback failed:', error as Record<string, unknown>);
      throw error;
    }
  }

  // 检查迁移状态
  async status(): Promise<{
    total: number;
    executed: number;
    pending: number;
    latest: string | null;
  }> {
    try {
      const migrationFiles = await this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      return {
        total: migrationFiles.length,
        executed: executedMigrations.length,
        pending: migrationFiles.length - executedMigrations.length,
        latest: executedMigrations.length > 0
          ? executedMigrations[executedMigrations.length - 1]?.version || null
          : null,
      };
    } catch (error) {
      logger.error('Failed to check migration status:', error);
      throw error;
    }
  }

  // 重置迁移（删除所有迁移记录并重新运行）
  async reset(): Promise<void> {
    try {
      logger.warn('Resetting all migrations...');

      // 删除所有表（除了migrations表）
      await db.query(`
        DROP TABLE IF EXISTS user_sessions, audit_logs, file_uploads, system_configs,
        recommendations, notifications, ai_roles, ai_conversations, growth_records,
        children, users CASCADE
      `);

      // 重新运行所有迁移
      await this.run();

      logger.info('Database reset and migration completed');
    } catch (error) {
      logger.error('Failed to reset database:', error);
      throw error;
    }
  }
}

// 导出默认实例
export const migrator = new DatabaseMigrator();

// 命令行工具支持
if (require.main === module) {
  const command = process.argv[2];
  const targetVersion = process.argv[3];

  switch (command) {
    case 'up':
      migrator.run().then(() => {
        logger.info('Migration completed');
        process.exit(0);
      }).catch((error) => {
        logger.error('Migration failed:', error);
        process.exit(1);
      });
      break;

    case 'down':
      migrator.rollback(targetVersion).then(() => {
        logger.info('Rollback completed');
        process.exit(0);
      }).catch((error) => {
        logger.error('Rollback failed:', error);
        process.exit(1);
      });
      break;

    case 'status':
      migrator.status().then((status) => {
        console.log('Migration Status:');
        console.log('Total:', status.total);
        console.log('Executed:', status.executed);
        console.log('Pending:', status.pending);
        console.log('Latest:', status.latest);
        process.exit(0);
      }).catch((error) => {
        console.error('Failed to check status:', error);
        process.exit(1);
      });
      break;

    case 'reset':
      migrator.reset().then(() => {
        logger.info('Reset completed');
        process.exit(0);
      }).catch((error) => {
        logger.error('Reset failed:', error);
        process.exit(1);
      });
      break;

    default:
      console.log('Usage: npm run migrate [up|down|status|reset] [version]');
      console.log('  up      - Run pending migrations');
      console.log('  down    - Rollback migrations (optional: specify target version)');
      console.log('  status  - Show migration status');
      console.log('  reset   - Reset database and re-run all migrations');
      process.exit(1);
  }
}

export default migrator;
