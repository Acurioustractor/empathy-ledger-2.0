#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { data } = await supabase
    .from('storytellers')
    .select('full_name, privacy_preferences')
    .limit(5);
  
  console.log('Sample privacy preferences:');
  data?.forEach((s, i) => {
    console.log(`${i + 1}. ${s.full_name}:`);
    console.log(`   ${JSON.stringify(s.privacy_preferences)}`);
  });
})();