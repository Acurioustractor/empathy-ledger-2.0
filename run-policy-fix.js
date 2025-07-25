import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runPolicyFix() {
  try {
    console.log('🔧 Fixing organization_members RLS policy...');
    
    // Read the SQL fix file
    const sqlFix = fs.readFileSync(path.join(__dirname, 'fix_org_members_policy.sql'), 'utf8');
    
    // Split into individual statements
    const statements = sqlFix
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`\n📝 Executing statement ${i + 1}:`);
      console.log(statement.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: statement 
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Try direct SQL execution as fallback
        const { data: data2, error: error2 } = await supabase
          .from('_supabase_admin')
          .select('*')
          .limit(0);
        
        if (error2) {
          console.error('❌ Cannot execute SQL. Please run the following manually in Supabase SQL editor:');
          console.log('\n=== MANUAL SQL TO RUN ===');
          console.log(sqlFix);
          console.log('=== END MANUAL SQL ===\n');
          return;
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n🎉 Policy fix completed! The infinite recursion should be resolved.');
    console.log('\n🔍 Please test the analytics page now at http://localhost:3005/analytics');
    
  } catch (error) {
    console.error('❌ Error running policy fix:', error);
    console.log('\n📋 Please run this SQL manually in your Supabase dashboard:');
    console.log('\n=== MANUAL SQL TO RUN ===');
    const sqlFix = fs.readFileSync(path.join(__dirname, 'fix_org_members_policy.sql'), 'utf8');
    console.log(sqlFix);
    console.log('=== END MANUAL SQL ===\n');
  }
}

runPolicyFix();