'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name to continue');
      return;
    }

    // Save name to localStorage
    localStorage.setItem('annotatorName', name.trim());
    
    // Navigate to label page
    router.push('/label');
  }, [name, router]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (error) setError(''); // Clear error when user starts typing
  }, [error]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-600">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-lg bg-slate-800/90 border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-5 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-pink-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl">🎯</span>
              </div>
            </div>

            {/* App Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center mb-2 sm:mb-3 bg-clip-text text-transparent bg-linear-to-r from-pink-200 via-purple-200 to-indigo-200 drop-shadow-lg">
              FutureEmo-ENG
            </h1>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-center mb-5 sm:mb-6 text-white drop-shadow-lg">
              Emotion Labeling Platform
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-white drop-shadow text-center mb-4 leading-relaxed font-semibold px-2">
              Label future-oriented emotions in social media comments
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6 sm:mb-8">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">Hope</span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">Fear</span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">Determination</span>
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white border border-white/30">Neutral</span>
            </div>

            {/* Guidelines Link */}
            <div className="text-center mb-6 sm:mb-8">
              <button
                onClick={() => router.push('/guidelines')}
                className="group inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 active:bg-white/25 backdrop-blur-sm rounded-full text-sm sm:text-base font-semibold text-white border border-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <span className="text-xl sm:text-lg group-hover:scale-110 transition-transform">📖</span>
                View Labeling Guidelines
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm sm:text-base font-bold text-white mb-2 sm:mb-3 uppercase tracking-wider"
                >
                  Your Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter your name"
                    className={`w-full px-5 py-4 sm:py-5 text-base sm:text-lg bg-white/10 backdrop-blur-md border-2 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition-all placeholder-white/50 text-white font-medium ${
                      error ? 'border-red-400' : 'border-white/30'
                    } hover:bg-white/15 active:bg-white/20`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'name-error' : undefined}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {error && (
                  <div className="mt-3 px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl">
                    <p id="name-error" className="text-sm text-red-200 font-medium flex items-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!name.trim()}
                className={`group relative w-full py-4 sm:py-5 px-6 text-base sm:text-lg rounded-xl sm:rounded-2xl font-bold text-white transition-all duration-300 overflow-hidden ${
                  name.trim()
                    ? 'bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 active:from-pink-700 active:via-purple-700 active:to-indigo-800 shadow-2xl hover:shadow-pink-500/50 transform hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-400/50 cursor-not-allowed backdrop-blur-sm'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                  Start Labeling
                  <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform ${name.trim() ? 'group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {name.trim() && (
                  <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                )}
              </button>
            </form>

            {/* Optional Footer Info */}
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/20">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white drop-shadow text-center leading-relaxed font-semibold px-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <p>
                  Your contributions help improve emotion detection in AI systems
                </p>
              </div>
              <div className="mt-5 flex justify-center items-center gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">5.7K+</div>
                  <div className="text-xs sm:text-sm text-white drop-shadow font-semibold">Labels</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">98%</div>
                  <div className="text-xs sm:text-sm text-white drop-shadow font-semibold">Accuracy</div>
                </div>
                <div className="w-px h-10 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">24/7</div>
                  <div className="text-xs sm:text-sm text-white drop-shadow font-semibold">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
