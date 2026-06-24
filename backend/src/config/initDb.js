import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Client } = pg;

async function setup() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT) || 5432;
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD;
  const targetDb = process.env.DB_NAME || 'blog_platform';

  console.log(`🔌 Connecting to default 'postgres' database to check for '${targetDb}'...`);

  // First connect to default postgres db to verify / create the target db
  const defaultClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await defaultClient.connect();
    
    // Check if target db exists
    const res = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (res.rows.length === 0) {
      console.log(`🛠️ Database '${targetDb}' does not exist. Creating...`);
      // CREATE DATABASE cannot be executed inside a transaction block or parameterized query
      // so we concatenate directly (name is a configuration variable from .env)
      await defaultClient.query(`CREATE DATABASE ${targetDb}`);
      console.log(`✅ Database '${targetDb}' created successfully.`);
    } else {
      console.log(`✨ Database '${targetDb}' already exists.`);
    }
  } catch (error) {
    console.error('❌ Error checking/creating database:', error.message);
    process.exit(1);
  } finally {
    await defaultClient.end();
  }

  console.log(`🔌 Connecting to database '${targetDb}' to run schema...`);

  // Connect to target db to execute schema.sql
  const targetClient = new Client({
    host,
    port,
    user,
    password,
    database: targetDb,
  });

  try {
    await targetClient.connect();

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📝 Executing schema.sql queries...');
    await targetClient.query(schemaSql);
    console.log('✅ Schema executed successfully. All tables and indexes are ready.');

  } catch (error) {
    console.error('❌ Error executing schema:', error.message);
    process.exit(1);
  } finally {
    await targetClient.end();
  }
}

setup();
