require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'categories',
  'users',
  'products',
  'coupons',
  'orders',
  'wishlists'
];

function escapeString(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return val;
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function exportData() {
  let sql = fs.readFileSync(path.join(__dirname, '../database.sql'), 'utf-8');
  sql += '\n\n-- ==========================================\n-- DATA DUMP\n-- ==========================================\n';

  for (const table of tables) {
    console.log(`Exporting ${table}...`);
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }

    if (data && data.length > 0) {
      sql += `\n-- Data for ${table}\n`;
      for (const row of data) {
        const columns = Object.keys(row).map(k => `"${k}"`).join(', ');
        const values = Object.values(row).map(escapeString).join(', ');
        sql += `INSERT INTO ${table} (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
      }
    }
  }

  const outPath = path.join(__dirname, '../full_schema_and_data.sql');
  fs.writeFileSync(outPath, sql);
  console.log(`Export complete: ${outPath}`);
}

exportData();
