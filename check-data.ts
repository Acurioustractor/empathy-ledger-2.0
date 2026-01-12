import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkData() {
  console.log('🔍 CHECKING CURRENT DATABASE STATE');
  
  // Check stories
  const { data: stories, count: storiesCount } = await supabase
    .from('stories')
    .select('id, title, status, privacy_level', { count: 'exact' });
  
  console.log(`📖 Stories: ${storiesCount} total`);
  
  if (stories && stories.length > 0) {
    // Check stories by status
    const statusBreakdown = {};
    stories.forEach(s => {
      statusBreakdown[s.status] = (statusBreakdown[s.status] || 0) + 1;
    });
    console.log('Status breakdown:', statusBreakdown);
    
    // Check privacy levels
    const privacyBreakdown = {};
    stories.forEach(s => {
      privacyBreakdown[s.privacy_level] = (privacyBreakdown[s.privacy_level] || 0) + 1;
    });
    console.log('Privacy breakdown:', privacyBreakdown);
    
    // Show first few titles
    console.log('Sample stories:', stories.slice(0, 3).map(s => s.title));
  }
  
  // Check quotes
  const { count: quotesCount } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true });
  
  console.log(`💬 Quotes: ${quotesCount} total`);
  
  // Check users/storytellers
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  console.log(`👥 Users: ${usersCount} total`);
  
  // Check themes if they exist
  try {
    const { count: themesCount } = await supabase
      .from('themes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🏷️ Themes: ${themesCount} total`);
  } catch (e) {
    console.log('🏷️ Themes table not found or accessible');
  }
}

checkData().catch(console.error);