import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Word {
  id: number;
  word: string;
  definition: string;
  usage: string;
}

interface Question {
  targetWord: Word;
  type: 'en-to-zh' | 'zh-to-en';
  options: Word[]; // 4 options including target
  correctOptionId: number;
}

export default function StudyMode() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      const res = await fetch('/api/words');
      const data = await res.json();
      setWords(data);
      if (data.length >= 4) {
        startQuiz(data);
      }
    } catch (err) {
      console.error('Failed to fetch words', err);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (wordList: Word[]) => {
    const shuffled = [...wordList].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, Math.min(10, shuffled.length));
    
    const newQuestions: Question[] = selectedWords.map(target => {
      const type = Math.random() > 0.5 ? 'en-to-zh' : 'zh-to-en';
      const otherWords = wordList.filter(w => w.id !== target.id);
      const distractors = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);
      const options = [...distractors, target].sort(() => 0.5 - Math.random());
      
      return {
        targetWord: target,
        type,
        options,
        correctOptionId: target.id
      };
    });

    setQuestions(newQuestions);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionClick = (optionId: number) => {
    if (isAnswered) return;
    
    setSelectedOption(optionId);
    setIsAnswered(true);
    
    if (optionId === questions[currentIndex].correctOptionId) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (words.length < 4) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center space-y-4 border border-blue-50">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">单词数量不足</h2>
          <p className="text-slate-600">
            开启学习模式至少需要 4 个单词。目前只有 {words.length} 个。
          </p>
          <Link 
            to="/" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            去查词
          </Link>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center space-y-6 border border-blue-50"
        >
          <Trophy className={cn("w-20 h-20 mx-auto", percentage >= 80 ? "text-yellow-400" : "text-blue-400")} />
          
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">学习完成!</h2>
            <p className="text-slate-500">本次练习共 {questions.length} 题</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-wider mb-1">正确率</div>
            <div className={cn("text-5xl font-bold", percentage >= 80 ? "text-green-500" : "text-blue-600")}>
              {percentage}%
            </div>
            <div className="text-slate-400 mt-2">答对 {score} / {questions.length}</div>
          </div>

          <div className="flex gap-3">
            <Link 
              to="/vocab" 
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              返回生词本
            </Link>
            <button 
              onClick={() => startQuiz(words)}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              再练一次
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isEnToZh = currentQ.type === 'en-to-zh';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link to="/vocab" className="p-2 -ml-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 mx-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="text-sm font-medium text-slate-400 tabular-nums">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="w-full space-y-8"
          >
            <div className="text-center space-y-4">
              <span className="text-xs font-bold tracking-wider text-blue-400 uppercase bg-blue-50 px-3 py-1 rounded-full">
                {isEnToZh ? '选择正确的释义' : '选择对应的单词'}
              </span>
              <h2 className="text-4xl font-bold text-blue-950">
                {isEnToZh ? currentQ.targetWord.word : currentQ.targetWord.definition}
              </h2>
            </div>

            <div className="grid gap-3">
              {currentQ.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isCorrect = option.id === currentQ.correctOptionId;
                
                let stateStyles = "border-slate-200 hover:border-blue-300 hover:bg-blue-50/50";
                if (isAnswered) {
                  if (isCorrect) stateStyles = "border-green-500 bg-green-50 text-green-700";
                  else if (isSelected && !isCorrect) stateStyles = "border-red-500 bg-red-50 text-red-700";
                  else stateStyles = "border-slate-100 opacity-50";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(option.id)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                      stateStyles
                    )}
                  >
                    <span className="text-lg font-medium">
                      {isEnToZh ? option.definition : option.word}
                    </span>
                    {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Action */}
      <div className="p-6 pb-8 flex justify-center">
        <button
          onClick={nextQuestion}
          disabled={!isAnswered}
          className={cn(
            "w-full max-w-md bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2",
            !isAnswered ? "opacity-0 pointer-events-none translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          <span>{currentIndex === questions.length - 1 ? '查看结果' : '下一题'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
