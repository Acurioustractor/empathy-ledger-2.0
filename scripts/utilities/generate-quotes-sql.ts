import fs from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

async function generateQuotesSQL() {
  console.log('📝 GENERATING SQL FILE FOR QUOTES IMPORT...\n');

  try {
    // Fetch all quotes from Airtable
    let allQuotes = [];
    let offset = null;
    
    do {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quotes${offset ? `?offset=${offset}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      allQuotes = allQuotes.concat(data.records);
      offset = data.offset;
      
      console.log(`Fetched ${data.records.length} quotes (total: ${allQuotes.length})`);
    } while (offset);

    console.log(`\n📋 Generating SQL for ${allQuotes.length} quotes...\n`);

    let sql = `-- IMPORT ALL QUOTES FROM AIRTABLE
-- Generated on ${new Date().toISOString()}

BEGIN;

`;

    let quotesProcessed = 0;
    
    // Process in batches of 50
    for (let i = 0; i < allQuotes.length; i += 50) {
      const batch = allQuotes.slice(i, i + 50);
      
      const values = batch.map(record => {
        const fields = record.fields;
        const quoteText = (fields['Quote Text'] || fields.Quote || 'No quote text')
          .replace(/'/g, "''")
          .replace(/\\/g, '\\\\')
          .substring(0, 2000); // Limit length
        const context = fields.Context ? 
          fields.Context.replace(/'/g, "''").replace(/\\/g, '\\\\').substring(0, 1000) : null;
        const theme = fields.Theme ? 
          fields.Theme.replace(/'/g, "''") : null;
        
        return `    (gen_random_uuid(), '${quoteText}', ${context ? `'${context}'` : 'NULL'}, '${theme || ''}', NOW())`;
      }).join(',\n');

      sql += `
-- Batch ${Math.floor(i/50) + 1}
INSERT INTO airtable_quotes (id, quote_text, context, theme, created_at)
VALUES 
${values};

`;
      quotesProcessed += batch.length;
      
      if (quotesProcessed % 200 === 0) {
        console.log(`✅ Processed ${quotesProcessed} quotes...`);
      }
    }

    sql += `
COMMIT;

-- Verify import
SELECT COUNT(*) as total_quotes FROM airtable_quotes;
SELECT 'Import completed successfully!' as status;
`;

    // Write to file
    const filename = 'scripts/import-all-quotes.sql';
    fs.writeFileSync(filename, sql);

    console.log(`\n🎯 SQL GENERATION COMPLETE!`);
    console.log(`✅ Generated SQL for ${quotesProcessed} quotes`);
    console.log(`📄 File: ${filename}`);
    console.log(`\n🚀 Now executing SQL...`);

  } catch (error) {
    console.error('💥 Generation failed:', error);
  }
}

generateQuotesSQL().catch(console.error);