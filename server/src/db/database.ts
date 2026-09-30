import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use node:sqlite which is built into Node.js 22/24 with zero native compilation dependencies
// Provides exact same synchronous API as better-sqlite3
// @ts-ignore - node:sqlite is standard in modern Node.js
import { DatabaseSync } from 'node:sqlite';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = path.join(DB_DIR, 'vayu.sqlite');

class VayuDatabase {
  private db: any;

  constructor() {
    this.db = new DatabaseSync(DB_FILE);
    this.initializeSchema();
  }

  private initializeSchema() {
    // Read schema.sql
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schemaSql);
    }
  }

  public query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  public queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const stmt = this.db.prepare(sql);
    const result = stmt.get(...params);
    return (result as T) || null;
  }

  public execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  public exec(sql: string): void {
    this.db.exec(sql);
  }

  public close(): void {
    this.db.close();
  }

  // Raw db handle if needed
  public get raw() {
    return this.db;
  }
}

export const db = new VayuDatabase();
