
import { neon, neonConfig } from '@neondatabase/serverless';
import { UserProfile, UserConfig } from '../types';

// Optimized for serverless environments
neonConfig.fetchConnectionCache = true;

// PRO-TIP: In a real production build, this string should be fetched from an environment variable
const CONN_STRING = 'postgresql://neondb_owner:npg_amOl3udh9Ror@ep-little-shape-a17gw1h7-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const USERS_INDEX_KEY = 'QAV_USERS_INDEX';
const getStorageKey = (userId: string) => `QAV_DATA_${userId}`;
const getConfigKey = (userId: string) => `QAV_CONFIG_${userId}`;

class DatabaseService {
  public isOnline: boolean = false;
  private sql = neon(CONN_STRING);

  private async safeQuery(queryFn: () => Promise<any>): Promise<any> {
    try {
      const result = await queryFn();
      this.isOnline = true;
      return result;
    } catch (e: any) {
      this.isOnline = false;
      // Silently log and move to local mode to prevent UI crashing
      console.warn("QAV DATABASE: Remote connection unavailable. Operating in Local Enclave mode.");
      return null;
    }
  }

  async init(): Promise<void> {
    // Attempt to initialize tables if online
    await this.safeQuery(async () => {
      await this.sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, avatar TEXT, created_at BIGINT)`;
      await this.sql`CREATE TABLE IF NOT EXISTS user_configs (user_id TEXT PRIMARY KEY, config TEXT)`;
      await this.sql`CREATE TABLE IF NOT EXISTS vaults (user_id TEXT PRIMARY KEY, data TEXT)`;
    });
  }

  async getUsers(): Promise<UserProfile[]> {
    const rows = await this.safeQuery(() => this.sql`SELECT * FROM users`);
    if (rows) {
      const users = rows.map((row: any) => ({ 
        id: row.id, 
        name: row.name, 
        avatar: row.avatar, 
        createdAt: Number(row.created_at) 
      }));
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
      return users;
    }
    const local = localStorage.getItem(USERS_INDEX_KEY);
    return local ? JSON.parse(local) : [];
  }

  async saveUser(user: UserProfile): Promise<void> {
    const currentLocal = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
    const idx = currentLocal.findIndex((u: UserProfile) => u.id === user.id);
    if (idx >= 0) currentLocal[idx] = user; else currentLocal.push(user);
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(currentLocal));
    
    await this.safeQuery(() => this.sql`
      INSERT INTO users (id, name, avatar, created_at) 
      VALUES (${user.id}, ${user.name}, ${user.avatar || ''}, ${user.createdAt}) 
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, avatar = EXCLUDED.avatar
    `);
  }

  async getUserConfig(userId: string): Promise<UserConfig | null> {
    const rows = await this.safeQuery(() => this.sql`SELECT config FROM user_configs WHERE user_id = ${userId}`);
    if (rows && rows.length > 0) {
      const config = JSON.parse(rows[0].config);
      localStorage.setItem(getConfigKey(userId), JSON.stringify(config));
      return config;
    }
    const local = localStorage.getItem(getConfigKey(userId));
    return local ? JSON.parse(local) : null;
  }

  async saveUserConfig(config: UserConfig): Promise<void> {
    localStorage.setItem(getConfigKey(config.userId), JSON.stringify(config));
    await this.safeQuery(() => this.sql`
      INSERT INTO user_configs (user_id, config) 
      VALUES (${config.userId}, ${JSON.stringify(config)}) 
      ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config
    `);
  }

  async getVaultData(userId: string): Promise<string | null> {
    const rows = await this.safeQuery(() => this.sql`SELECT data FROM vaults WHERE user_id = ${userId}`);
    if (rows && rows.length > 0) {
      return rows[0].data;
    }
    return localStorage.getItem(getStorageKey(userId));
  }

  async saveVaultData(userId: string, encryptedData: string): Promise<void> {
    localStorage.setItem(getStorageKey(userId), encryptedData);
    await this.safeQuery(() => this.sql`
      INSERT INTO vaults (user_id, data) 
      VALUES (${userId}, ${encryptedData}) 
      ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data
    `);
  }
}

export const db = new DatabaseService();
