#!/usr/bin/env tsx
/**
 * Manual migration runner
 * Usage: tsx script/run-migrations.ts
 */

import 'dotenv/config';
import { pool } from '../server/db.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '../server/migrations');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...\n');
    
    // Get all .sql files from migrations directory
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Run in alphabetical order
    
    if (files.length === 0) {
      console.log('✅ No migrations to run');
      return;
    }
    
    for (const file of files) {
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf-8');
      
      console.log(`📝 Running migration: ${file}`);
      
      try {
        await pool.query(sql);
        console.log(`✅ ${file} completed successfully\n`);
      } catch (err: any) {
        // Ignore "already exists" errors (migrations already applied)
        if (err.message?.includes('already exists') || err.message?.includes('does not exist')) {
          console.log(`⚠️  ${file} already applied or column/constraint exists\n`);
        } else {
          console.error(`❌ Error in ${file}:`, err.message);
          throw err;
        }
      }
    }
    
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
