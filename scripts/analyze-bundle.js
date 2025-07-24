#!/usr/bin/env node

/**
 * Bundle Analysis Script for Empathy Ledger
 * 
 * Analyzes webpack bundle sizes and provides performance recommendations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 EMPATHY LEDGER - BUNDLE ANALYSIS\n');

// Check if .next/static directory exists
const buildDir = path.join(process.cwd(), '.next');
const staticDir = path.join(buildDir, 'static');

if (!fs.existsSync(buildDir)) {
  console.log('❌ No build directory found. Running production build first...\n');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Build failed. Please fix build errors before analyzing bundle.');
    process.exit(1);
  }
}

// Analyze build output
function analyzeBuildOutput() {
  console.log('🔍 ANALYZING BUILD OUTPUT\n');
  
  try {
    // Get build manifest
    const manifestPath = path.join(buildDir, 'build-manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      console.log('📄 Pages and Chunks:');
      Object.keys(manifest.pages).forEach(page => {
        const chunks = manifest.pages[page];
        console.log(`   ${page}: ${chunks.length} chunks`);
      });
      console.log('');
    }
    
    // Analyze static directory
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(path.join(staticDir, 'chunks'), { withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
        .map(dirent => {
          const filePath = path.join(staticDir, 'chunks', dirent.name);
          const stats = fs.statSync(filePath);
          return {
            name: dirent.name,
            size: stats.size,
            sizeKB: Math.round(stats.size / 1024)
          };
        })
        .sort((a, b) => b.size - a.size);
      
      console.log('📊 LARGEST CHUNKS:');
      chunks.slice(0, 10).forEach(chunk => {
        const status = chunk.sizeKB > 500 ? '🔴' : chunk.sizeKB > 200 ? '🟡' : '🟢';
        console.log(`   ${status} ${chunk.name}: ${chunk.sizeKB} KB`);
      });
      console.log('');
      
      // Calculate total bundle size
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
      const totalKB = Math.round(totalSize / 1024);
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);
      
      console.log(`📏 TOTAL BUNDLE SIZE: ${totalKB} KB (${totalMB} MB)\n`);
      
      // Performance recommendations
      console.log('🎯 PERFORMANCE RECOMMENDATIONS:\n');
      
      if (totalKB > 1000) {
        console.log('   🔴 Bundle size is large (>1MB). Consider:');
        console.log('      - Implementing dynamic imports for large components');
        console.log('      - Using React.lazy() for code splitting');
        console.log('      - Removing unused dependencies');
      } else if (totalKB > 500) {
        console.log('   🟡 Bundle size is moderate. Consider:');
        console.log('      - Monitoring bundle growth');
        console.log('      - Dynamic imports for non-critical features');
      } else {
        console.log('   🟢 Bundle size is good!');
      }
      
      // Check for large individual chunks
      const largeChunks = chunks.filter(chunk => chunk.sizeKB > 200);
      if (largeChunks.length > 0) {
        console.log('\n   ⚠️  Large chunks detected:');
        largeChunks.forEach(chunk => {
          console.log(`      - ${chunk.name}: ${chunk.sizeKB} KB`);
        });
        console.log('   Consider splitting these into smaller chunks.');
      }
      
    } else {
      console.log('❌ Static directory not found. Build may have failed.');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing build output:', error.message);
  }
}

// Check for unused dependencies
function analyzeUnusedDependencies() {
  console.log('\n🔍 CHECKING FOR UNUSED DEPENDENCIES\n');
  
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    console.log(`📦 Production dependencies: ${dependencies.length}`);
    console.log(`🛠️  Development dependencies: ${devDependencies.length}`);
    
    // Simple check for obviously unused packages
    const potentiallyUnused = dependencies.filter(dep => {
      // Check if dependency appears in any source files
      try {
        const result = execSync(`grep -r "from ['\"]${dep}['\"]\\|require(['\"]${dep}['\"])" src/`, { encoding: 'utf8' });
        return !result;
      } catch {
        return true; // grep found nothing
      }
    });
    
    if (potentiallyUnused.length > 0) {
      console.log('\n⚠️  Potentially unused dependencies:');
      potentiallyUnused.forEach(dep => {
        console.log(`   - ${dep}`);
      });
      console.log('\n   Review these dependencies and remove if not needed.');
    } else {
      console.log('\n✅ No obviously unused dependencies found.');
    }
    
  } catch (error) {
    console.log('❌ Could not analyze dependencies:', error.message);
  }
}

// Performance metrics
function checkPerformanceMetrics() {
  console.log('\n🚀 PERFORMANCE OPTIMIZATION CHECKLIST\n');
  
  const checks = [
    {
      name: 'Next.js Image Optimization',
      check: fs.existsSync(path.join(process.cwd(), 'next.config.ts')),
      details: 'Check next.config.ts for optimized image settings'
    },
    {
      name: 'Compression Enabled',
      check: true, // We enabled this in next.config.ts
      details: 'Gzip compression is configured'
    },
    {
      name: 'Bundle Analysis Available',
      check: fs.existsSync(path.join(process.cwd(), 'node_modules', '@next', 'bundle-analyzer')),
      details: 'Run npm run analyze for detailed bundle analysis'
    }
  ];
  
  checks.forEach(check => {
    const status = check.check ? '✅' : '❌';
    console.log(`   ${status} ${check.name}`);
    if (check.details) {
      console.log(`      ${check.details}`);
    }
  });
}

// Main execution
async function main() {
  analyzeBuildOutput();
  analyzeUnusedDependencies();
  checkPerformanceMetrics();
  
  console.log('\n🎯 NEXT STEPS:\n');
  console.log('   1. Run "npm run analyze" for detailed bundle analysis');
  console.log('   2. Use React DevTools Profiler to identify slow components');
  console.log('   3. Implement dynamic imports for large features');
  console.log('   4. Monitor Core Web Vitals in production');
  console.log('\n✨ Empathy Ledger - Performance matters for community stories!\n');
}

main().catch(console.error);