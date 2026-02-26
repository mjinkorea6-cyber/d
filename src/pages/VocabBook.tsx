import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Search, BookOpen, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Word {
  id: number;
  word: string;
  definition: string;
  usage: string;
  created_at: string;
}

export default function VocabBook() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/words');
      const data = await res.json();
      setWords(data);
    } catch (err) {
      console.error('Failed to fetch words', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteWord = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering card click if we add that later
    e.stopPropagation();
    try {
      await fetch(`/api/words/${id}`, { method: 'DELETE' });
      setWords(words.filter(w => w.id !== id));
    } catch (err) {
      console.error('Failed to delete word', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回查词</span>
          </Link>
          <div className="flex items-center gap-4">
            {words.length >= 4 && (
              <Link 
                to="/study"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-medium"
              >
                <GraduationCap className="w-5 h-5" />
                <span>开始学习</span>
              </Link>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-blue-950">我的生词本</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : words.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">生词本是空的</h3>
            <p className="text-slate-500 mb-6">去查几个单词，它们会自动出现在这里。</p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              去查词
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            <AnimatePresence>
              {words.map((word) => (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 flex flex-col relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-blue-950 group-hover:text-blue-600 transition-colors">
                        {word.word}
                      </h3>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(word.word)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="在 Google 中搜索"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Search className="w-4 h-4" />
                      </a>
                    </div>
                    <button
                      onClick={(e) => deleteWord(word.id, e)}
                      className="text-slate-300 hover:text-red-500 p-2 -mr-2 -mt-2 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <p className="text-slate-700 font-medium border-l-2 border-blue-200 pl-3">
                      {word.definition}
                    </p>
                    {word.usage && (
                      <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg mt-2">
                        {word.usage}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-300 flex justify-between">
                    <span>Added {new Date(word.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
