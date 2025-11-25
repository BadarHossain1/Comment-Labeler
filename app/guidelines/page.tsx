'use client';

import { useRouter } from 'next/navigation';

const examples = {
  hope: [
    "I believe AI will create new opportunities we haven't even imagined yet.",
    "Things will get better once we figure out how to regulate this properly.",
    "I'm optimistic that the next generation will find solutions to these challenges.",
    "We're going to see amazing breakthroughs in the coming years.",
  ],
  fear: [
    "I'm worried that AI will replace millions of jobs with no safety net.",
    "What if we lose control of these systems? That keeps me up at night.",
    "I'm afraid the wealth gap will only get worse as automation increases.",
    "We might be building something we can't stop or understand.",
  ],
  determination: [
    "I will learn these new skills no matter how long it takes.",
    "We must fight for stronger worker protections before it's too late.",
    "I'm going to retrain in a field that can't be automated.",
    "Companies need to be held accountable, and we will make sure they are.",
  ],
  neutral: [
    "The CEO announced layoffs will begin next quarter.",
    "AI capabilities are expected to improve by 40% in the next two years.",
    "Several companies are planning to implement automation by 2026.",
    "The government will release new AI regulations next month.",
  ],
};

export default function GuidelinesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto py-12 px-4">
        {/* Header Card */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-yellow-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <span className="text-4xl">📖</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                Labeling Guidelines
              </h1>
              <p className="text-lg text-white/80">FutureEmo-ENG Project</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-lg sm:text-xl text-white drop-shadow leading-relaxed font-semibold">
              We are labeling <strong className="text-pink-200">future-oriented emotions</strong> in English social media comments. 
              Your task is to identify the primary emotion expressed about future events, possibilities, or outcomes.
            </p>
            
            <div className="backdrop-blur-md bg-blue-500/30 border-2 border-blue-400/60 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-2">Key Principle</p>
                  <p className="text-white drop-shadow leading-relaxed font-semibold">
                    Focus on the <strong>future aspect</strong> of the comment, even if the comment 
                    also discusses the present. If multiple emotions are present, choose the <em className="text-blue-200 font-bold">dominant</em> one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hope Section */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🌟</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Hope</h2>
          </div>
          
          <div className="backdrop-blur-md bg-emerald-500/30 border border-emerald-400/50 rounded-2xl p-6 mb-6">
            <p className="text-white drop-shadow leading-relaxed text-lg font-semibold">
              <strong className="text-emerald-200">Definition:</strong> Positive anticipation or optimism about the future. 
              The commenter believes things will improve, expects good outcomes, or expresses 
              confidence that positive changes will occur.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-4">Examples:</p>
            {examples.hope.map((example, index) => (
              <div key={index} className="group backdrop-blur-sm bg-emerald-500/30 border-l-4 border-emerald-400 hover:bg-emerald-500/40 rounded-r-2xl p-5 transition-all duration-300 transform hover:translate-x-2">
                <p className="text-white drop-shadow leading-relaxed italic text-lg font-semibold">"{example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fear Section */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Fear</h2>
          </div>
          
          <div className="backdrop-blur-md bg-red-500/30 border border-red-400/50 rounded-2xl p-6 mb-6">
            <p className="text-white drop-shadow leading-relaxed text-lg font-semibold">
              <strong className="text-red-200">Definition:</strong> Worry, anxiety, or concern about what might happen in the future. 
              The commenter expresses apprehension, dread, or negative expectations about future events 
              or outcomes.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-4">Examples:</p>
            {examples.fear.map((example, index) => (
              <div key={index} className="group backdrop-blur-sm bg-red-500/20 border-l-4 border-red-400 hover:bg-red-500/30 rounded-r-2xl p-5 transition-all duration-300 transform hover:translate-x-2">
                <p className="text-white leading-relaxed italic text-lg">"{example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Determination Section */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">💪</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Determination</h2>
          </div>
          
          <div className="backdrop-blur-md bg-blue-500/30 border border-blue-400/50 rounded-2xl p-6 mb-6">
            <p className="text-white drop-shadow leading-relaxed text-lg font-semibold">
              <strong className="text-blue-200">Definition:</strong> A firm resolve to take action or pursue a goal in the future. 
              The commenter commits to doing something, expresses willpower, or declares their intention 
              to bring about change.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-4">Examples:</p>
            {examples.determination.map((example, index) => (
              <div key={index} className="group backdrop-blur-sm bg-blue-500/20 border-l-4 border-blue-400 hover:bg-blue-500/30 rounded-r-2xl p-5 transition-all duration-300 transform hover:translate-x-2">
                <p className="text-white leading-relaxed italic text-lg">"{example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Neutral Section */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">😐</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Neutral</h2>
          </div>
          
          <div className="backdrop-blur-md bg-gray-500/30 border border-gray-400/50 rounded-2xl p-6 mb-6">
            <p className="text-white drop-shadow leading-relaxed text-lg font-semibold">
              <strong className="text-gray-200">Definition:</strong> Factual or informational statements about the future without strong emotional content. 
              The commenter simply describes what will happen or might happen, without expressing hope, fear, or determination.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white drop-shadow uppercase tracking-wider mb-4">Examples:</p>
            {examples.neutral.map((example, index) => (
              <div key={index} className="group backdrop-blur-sm bg-gray-500/20 border-l-4 border-gray-400 hover:bg-gray-500/30 rounded-r-2xl p-5 transition-all duration-300 transform hover:translate-x-2">
                <p className="text-white leading-relaxed italic text-lg">"{example}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Important Tips */}
        <div className="backdrop-blur-2xl bg-slate-800/90 border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-linear-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">⭐</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Important Tips</h2>
          </div>

          <div className="space-y-4">
            <div className="backdrop-blur-sm bg-white/10 border border-white/30 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">1️⃣</span>
                <p className="text-white drop-shadow leading-relaxed text-lg font-semibold">
                  <strong className="text-white">Future-oriented only:</strong> If a comment is purely about the past or present with no future component, mark it as <strong className="text-amber-300">Skip</strong>.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">2️⃣</span>
                <p className="text-white/90 leading-relaxed text-lg">
                  <strong className="text-white">Mixed emotions:</strong> Choose the <strong className="text-amber-300">dominant</strong> emotion. If a comment says "I'm scared but hopeful," decide which feeling is stronger in context.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">3️⃣</span>
                <p className="text-white/90 leading-relaxed text-lg">
                  <strong className="text-white">Context matters:</strong> Read the entire comment carefully before deciding. Sometimes the emotion becomes clear only at the end.
                </p>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">4️⃣</span>
                <p className="text-white/90 leading-relaxed text-lg">
                  <strong className="text-white">Sarcasm and irony:</strong> Label based on the <strong className="text-amber-300">intended meaning</strong>, not the literal words.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/label')}
            className="group relative overflow-hidden backdrop-blur-md bg-linear-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 border-2 border-white/30 hover:border-white/50 rounded-2xl px-12 py-6 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-pink-500/50"
          >
            <span className="relative z-10 text-2xl font-black text-white flex items-center gap-4">
              <span className="text-3xl">🚀</span>
              Start Labeling Now
              <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => router.push('/')}
            className="mt-6 text-white/80 hover:text-white underline underline-offset-4 text-lg font-medium transition-colors"
          >
            ← Back to Home
          </button>
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
      `}</style>
    </div>
  );
}
