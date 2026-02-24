import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('Running migration: add_variation_stock.sql...');

        const migrationSQL = readFileSync(
            join(__dirname, 'supabase_migrations', 'add_variation_stock.sql'),
            'utf-8'
        );

        // Note: This won't work with ANON key, but we'll try
        const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

        if (error) {
            console.error('Migration failed:', error.message);
            console.log('\n⚠️  The migration needs to be run manually in Supabase SQL Editor.');
            console.log('\nSteps:');
            console.log('1. Go to: https://supabase.com/dashboard/project/remxfxopqdgwqyyjssrn/sql/new');
            console.log('2. Copy the contents of: supabase_migrations/add_variation_stock.sql');
            console.log('3. Paste and run in SQL Editor');
            return;
        }

        console.log('✅ Migration completed successfully!');
        console.log(data);
    } catch (err) {
        console.error('Error:', err);
        console.log('\n⚠️  The migration needs to be run manually in Supabase SQL Editor.');
        console.log('\nSteps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/remxfxopqdgwqyyjssrn/sql/new');
        console.log('2. Copy the contents of: supabase_migrations/add_variation_stock.sql');
        console.log('3. Paste and run in SQL Editor');
    }
}

runMigration();
