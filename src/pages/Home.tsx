import React, { useState } from 'react';
import { Search, Book, Loader2, ArrowRight, Volume2 } from 'lucide-react';
import { lookupWord, DictionaryResult } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Get definition from Gemini
      const data = await lookupWord(query);
      setResult(data);

      // 2. Save to backend
      await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

    } catch (err) {
      console.error(err);
      setError('无法找到该单词，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-900 tracking-tight">Blue Dictionary</h1>
          <p className="text-blue-600/80">简洁 · 智能 · 自动生词本</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 p-2 flex items-center border border-blue-100 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Search className="w-6 h-6 text-blue-400 ml-3" />
          <form onSubmit={handleSearch} className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入英语单词..."
              className="w-full px-4 py-3 bg-transparent outline-none text-lg placeholder:text-slate-400"
            />
          </form>
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '查询'}
          </button>
        </div>

        {/* Navigation to Vocabulary Book */}
        <div className="flex justify-center">
          <Link 
            to="/vocab" 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors group"
          >
            <Book className="w-5 h-5" />
            <span>查看我的生词本</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Result Card */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl shadow-blue-900/10 overflow-hidden border border-blue-50"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-4xl font-bold text-blue-950">{result.word}</h2>
                  <div className="flex items-center gap-4">
                    <a 
                      href={`https://www.google.com/search?q=${encodeURIComponent(result.word)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-sm font-medium group/google"
                      title="在 Google 中搜索"
                    >
                      <Search className="w-4 h-4 group-hover/google:scale-110 transition-transform" />
                      <span>Google</span>
                    </a>
                    <span className="text-slate-400 text-sm font-mono">English</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-1">释义 Definition</h3>
                    <p className="text-xl text-slate-700 leading-relaxed font-medium">
                      {result.definition}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">例句 Usage</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {result.usage}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 px-8 py-3 text-xs text-blue-400 flex justify-between items-center">
                <span>已自动保存至生词本</span>
                <Link to="/vocab" className="hover:underline">查看全部 &rarr;</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
