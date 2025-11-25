'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  _id: string;
  text: string;
}

type LabelType = 'Hope' | 'Fear' | 'Determination' | 'Neutral' | 'Skip';

export default function LabelPage() {
  const router = useRouter();
  const [annotatorName, setAnnotatorName] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('annotatorName');
    if (!name) {
      router.push('/');
      return;
    }
    setAnnotatorName(name);
    fetchComments(name);
  }, [router]);

  const fetchComments = async (name: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/next-batch?name=${encodeURIComponent(name)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
      setCurrentIndex(0);
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelSubmit = async (label: LabelType) => {
    if (!comments[currentIndex] || submitting) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess(false);

      const response = await fetch('/api/submit-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: annotatorName,
          commentId: comments[currentIndex]._id,
          label,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit label');
      }

      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        if (currentIndex < comments.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          fetchComments(annotatorName);
        }
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit label');
      console.error('Error submitting label:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative backdrop-blur-2xl bg-slate-800/95 border border-white/30 rounded-3xl shadow-2xl p-12">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            <p className="text-xl font-bold text-white drop-shadow-lg">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="relative backdrop-blur-2xl bg-slate-800/95 border border-white/30 rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-black text-white drop-shadow-lg mb-4">All Done!</h2>
          <p className="text-lg text-white drop-shadow mb-6">No more comments available to label. Thank you for your contribution!</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const currentComment = comments[currentIndex];
  const progress = ((currentIndex + 1) / comments.length) * 100;

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative max-w-6xl mx-auto pt-8 px-4 mb-8">
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-pink-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{annotatorName}</h2>
                <p className="text-sm text-white drop-shadow">Emotion Annotator</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/guidelines')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold text-white border border-white/30 hover:border-white/50 transition-all duration-300 flex items-center gap-2"
              >
                <span>📖</span>
                Guidelines
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-semibold text-white border border-white/30 hover:border-white/50 transition-all duration-300"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative max-w-6xl mx-auto px-4 mb-8">
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-white drop-shadow uppercase tracking-wider">Progress</span>
            <span className="text-sm font-bold text-white drop-shadow">
              {currentIndex + 1} / {comments.length}
            </span>
          </div>
          <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
          <p className="text-sm text-white drop-shadow font-semibold mt-2 text-center">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-6xl mx-auto px-4 pb-12">
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12">
          {/* Comment Display */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-16 h-16 bg-linear-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">💬</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-2">Comment to Label</h3>
                <div className="backdrop-blur-md bg-slate-800/80 border border-white/30 rounded-2xl p-6 shadow-xl">
                  <p className="text-lg sm:text-xl text-white leading-relaxed font-semibold drop-shadow">
                    {currentComment.text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emotion Buttons */}
          <div className="mb-8">
            <h4 className="text-base font-bold text-white drop-shadow-lg uppercase tracking-wider mb-4 text-center">
              Select the dominant emotion
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <button
                onClick={() => handleLabelSubmit('Hope')}
                disabled={submitting}
                className="group relative overflow-hidden backdrop-blur-md bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-400/50 hover:border-emerald-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50"
              >
                <div className="absolute inset-0 bg-linear-to-br from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">🌟</div>
                  <div className="text-xl font-black text-white drop-shadow-lg mb-1">Hope</div>
                  <div className="text-sm text-white drop-shadow font-semibold">Optimistic about future</div>
                </div>
              </button>

              <button
                onClick={() => handleLabelSubmit('Fear')}
                disabled={submitting}
                className="group relative overflow-hidden backdrop-blur-md bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400/50 hover:border-red-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">⚠️</div>
                  <div className="text-xl font-black text-white drop-shadow-lg mb-1">Fear</div>
                  <div className="text-sm text-white drop-shadow font-semibold">Worried about future</div>
                </div>
              </button>

              <button
                onClick={() => handleLabelSubmit('Determination')}
                disabled={submitting}
                className="group relative overflow-hidden backdrop-blur-md bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-400/50 hover:border-blue-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/50"
              >
                <div className="absolute inset-0 bg-linear-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">💪</div>
                  <div className="text-xl font-black text-white drop-shadow-lg mb-1">Determination</div>
                  <div className="text-sm text-white drop-shadow font-semibold">Committed to action</div>
                </div>
              </button>

              <button
                onClick={() => handleLabelSubmit('Neutral')}
                disabled={submitting}
                className="group relative overflow-hidden backdrop-blur-md bg-gray-500/20 hover:bg-gray-500/30 border-2 border-gray-400/50 hover:border-gray-400 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-gray-500/50"
              >
                <div className="absolute inset-0 bg-linear-to-br from-gray-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-4xl mb-3">😐</div>
                  <div className="text-xl font-black text-white drop-shadow-lg mb-1">Neutral</div>
                  <div className="text-sm text-white drop-shadow font-semibold">No strong emotion</div>
                </div>
              </button>
            </div>

            {/* Skip Button */}
            <button
              onClick={() => handleLabelSubmit('Skip')}
              disabled={submitting}
              className="group w-full relative overflow-hidden backdrop-blur-md bg-amber-500/20 hover:bg-amber-500/30 border-2 border-amber-400/50 hover:border-amber-400 rounded-2xl p-5 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/50"
            >
              <div className="absolute inset-0 bg-linear-to-br from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">⏭️</span>
                <span className="text-lg font-black text-white drop-shadow-lg">Skip (Not Future-Oriented)</span>
              </div>
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="backdrop-blur-md bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-5 mb-6 animate-shake">
              <p className="text-red-100 font-semibold flex items-center gap-3">
                <span className="text-2xl">❌</span>
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="backdrop-blur-md bg-emerald-500/20 border-2 border-emerald-400/50 rounded-2xl p-5 mb-6 animate-bounce-once">
              <p className="text-emerald-100 font-semibold flex items-center gap-3">
                <span className="text-2xl">✅</span>
                Label submitted successfully!
              </p>
            </div>
          )}

          {submitting && (
            <div className="backdrop-blur-md bg-blue-500/20 border-2 border-blue-400/50 rounded-2xl p-5">
              <div className="flex items-center justify-center gap-4">
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <p className="text-white font-semibold">Submitting your label...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s;
        }
        @keyframes bounce-once {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s;
        }
      `}</style>
    </div>
  );
}
