'use client';

import { useEffect, useState } from 'react';

export default function TestCSS() {
  const [cssVarTest, setCssVarTest] = useState<string>('checking...');
  
  useEffect(() => {
    // Test if CSS variables are defined
    const computedStyle = getComputedStyle(document.documentElement);
    const inkColor = computedStyle.getPropertyValue('--color-ink');
    const redColor = computedStyle.getPropertyValue('--color-editorial-red');
    const blueColor = computedStyle.getPropertyValue('--color-editorial-blue');
    
    setCssVarTest(`
      --color-ink: ${inkColor || 'NOT FOUND'}
      --color-editorial-red: ${redColor || 'NOT FOUND'}
      --color-editorial-blue: ${blueColor || 'NOT FOUND'}
    `);
  }, []);
  
  return (
    <div className="p-8">
      <h1 className="text-4xl mb-4">CSS Variable Test</h1>
      
      <div className="grid gap-4">
        <div className="p-4 border">
          <h2 className="text-2xl mb-2">Hardcoded Colors (Should Work)</h2>
          <div className="bg-red-500 text-white p-2">Red Background</div>
          <div className="bg-blue-500 text-white p-2">Blue Background</div>
        </div>
        
        <div className="p-4 border">
          <h2 className="text-2xl mb-2">CSS Variables (Testing)</h2>
          <div className="bg-[var(--color-editorial-red)] text-white p-2">Editorial Red Background</div>
          <div className="bg-[var(--color-editorial-blue)] text-white p-2">Editorial Blue Background</div>
          <div className="text-[var(--color-ink)]">Ink Color Text</div>
          <div className="bg-[var(--color-ash)] p-2">Ash Background</div>
        </div>
        
        <div className="p-4 border">
          <h2 className="text-2xl mb-2">Direct Style (Should Show Variables)</h2>
          <div style={{ backgroundColor: 'var(--color-editorial-red)', color: 'white', padding: '8px' }}>
            Direct Editorial Red
          </div>
          <div style={{ color: 'var(--color-ink)' }}>
            Direct Ink Color
          </div>
        </div>
        
        <div className="p-4 border">
          <h2 className="text-2xl mb-2">Actual CSS Variable Values in Browser</h2>
          <pre className="text-xs bg-gray-100 p-2">{cssVarTest}</pre>
        </div>
        
        <div className="p-4 border">
          <h2 className="text-2xl mb-2">Test Without Variables</h2>
          <div style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px' }}>
            Direct Hex Red #dc2626
          </div>
          <div style={{ backgroundColor: '#1e40af', color: 'white', padding: '8px' }}>
            Direct Hex Blue #1e40af
          </div>
        </div>
      </div>
    </div>
  );
}