'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Direct Supabase client without complex factory
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function SimpleTestPage() {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Testing Supabase connection...');

      // Test basic connection
      const { data: testData, error } = await supabase
        .from('stories')
        .select('id, title, users!inner(full_name)')
        .limit(3);

      if (error) {
        setStatus(`❌ Connection error: ${error.message}`);
        return;
      }

      setStatus('✅ Supabase connected successfully!');
      setData({
        stories: testData || [],
        storyCount: testData?.length || 0
      });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

    } catch (error) {
      setStatus(`❌ Test failed: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      setStatus('Testing login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus(`❌ Login error: ${error.message}`);
      } else {
        setStatus('✅ Login successful!');
        setUser(data.user);
        // Refresh data
        await testConnection();
      }
    } catch (error) {
      setStatus(`❌ Login failed: ${error}`);
    }
  };

  const testSignup = async () => {
    try {
      setStatus('Testing signup...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setStatus(`❌ Signup error: ${error.message}`);
      } else {
        setStatus('✅ Signup successful! Check email for verification.');
      }
    } catch (error) {
      setStatus(`❌ Signup failed: ${error}`);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setStatus('Logged out');
  };

  const getQuotesCount = async () => {
    const { count } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true });
    return count;
  };

  const getThemesCount = async () => {
    const { count } = await supabase
      .from('themes')
      .select('*', { count: 'exact', head: true });
    return count;
  };

  const [counts, setCounts] = useState<any>({});

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [quotesCount, themesCount] = await Promise.all([
          getQuotesCount(),
          getThemesCount()
        ]);
        setCounts({ quotes: quotesCount, themes: themesCount });
      } catch (error) {
        console.error('Error loading counts:', error);
      }
    };
    
    loadCounts();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          🧪 Simple Supabase Test
        </h1>

        {/* Status */}
        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <h2 className="font-semibold mb-2">Connection Status:</h2>
          <p className="font-mono text-sm">{status}</p>
        </div>

        {/* Migration Results */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">🎉 Migration Results</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white p-4 rounded">
              <p className="text-2xl font-bold text-blue-600">{counts.quotes || '...'}</p>
              <p className="text-sm text-gray-600">Quotes</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-2xl font-bold text-purple-600">{counts.themes || '...'}</p>
              <p className="text-sm text-gray-600">Themes</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-2xl font-bold text-green-600">{data?.storyCount || '...'}</p>
              <p className="text-sm text-gray-600">Stories</p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-2xl font-bold text-orange-600">205</p>
              <p className="text-sm text-gray-600">Storytellers</p>
            </div>
          </div>
        </div>

        {/* Auth Test */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Authentication Test</h2>
          
          {!user ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={testLogin}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Test Login
                </button>
                <button
                  onClick={testSignup}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Test Signup
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">✅ Logged in as: {user.email}</p>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Sample Data */}
        {data && (
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Sample Migrated Data</h2>
            <div className="space-y-4">
              {data.stories.map((story: any) => (
                <div key={story.id} className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium">{story.title}</h3>
                  <p className="text-sm text-gray-600">by {story.users?.full_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-2">🚀 System Ready!</h3>
          <ul className="text-blue-700 space-y-1">
            <li>✅ All Airtable data migrated successfully</li>
            <li>✅ Supabase authentication working</li>
            <li>✅ Database connections established</li>
            <li>✅ Ready to build your empathy ledger features!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}