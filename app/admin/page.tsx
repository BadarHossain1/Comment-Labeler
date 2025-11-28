'use client';

import { useState } from 'react';

interface AdminStats {
  totalComments: number;
  totalLabels: number;
  commentsWithAtLeastOneLabel: number;
  commentsWithAtLeastTwoLabels: number;
  resolvedComments: number;
  needsAdminReview: number;
  openComments: number;
  agreement: { agreementCount: number; disagreementCount: number; agreementRate: number | null };
}

interface AnnotatorStats {
  userName: string;
  totalLabels: number;
  agreementCount: number;
  disagreementCount: number;
  disagreementRate: number | null;
  avgTimeBetweenLabelsSeconds: number | null;
}

interface OverallKappaStats {
  overallKappa: number | null;
  interpretation: string;
  P_bar: number;
  P_bar_e: number;
  totalComments: number;
  totalRaters: number;
  categories: string[];
  categoryDistribution: Record<string, string>;
}

interface CommentLabel {
  userName: string;
  label: string;
  createdAt: string;
}

interface DetailedComment {
  _id: string;
  text: string;
  finalLabel: string | null;
  status: string;
  labelCount: number;
  labels: CommentLabel[];
  annotators: string[];
  agreementPercentage: number | null;
  majorityLabel: string | null;
  fleissKappa: number | null;
  createdAt: string;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [annotators, setAnnotators] = useState<AnnotatorStats[]>([]);
  const [detailedComments, setDetailedComments] = useState<DetailedComment[]>([]);
  const [overallKappa, setOverallKappa] = useState<OverallKappaStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'comments'>('stats');

  const handleLoadStats = async () => {
    if (!adminKey.trim()) { setError('Please enter admin key'); return; }
    try {
      setLoading(true); setError('');
      const [statsRes, annotatorsRes, commentsRes, kappaRes] = await Promise.all([
        fetch(`/api/admin-stats?key=${encodeURIComponent(adminKey)}`),
        fetch(`/api/admin-annotators?key=${encodeURIComponent(adminKey)}`),
        fetch(`/api/admin-comments-detailed?key=${encodeURIComponent(adminKey)}`),
        fetch(`/api/overall-kappa?key=${encodeURIComponent(adminKey)}`)
      ]);
      if (statsRes.status === 401) { setError('Invalid admin key'); return; }
      if (!statsRes.ok || !annotatorsRes.ok || !commentsRes.ok || !kappaRes.ok) throw new Error('Failed to load data');
      setStats(await statsRes.json());
      setAnnotators(await annotatorsRes.json());
      setDetailedComments(await commentsRes.json());
      setOverallKappa(await kappaRes.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export?key=${encodeURIComponent(adminKey)}`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = `futureemo_export_${new Date().toISOString().split('T')[0]}.csv`; 
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { setError('Export failed'); }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Hope': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50';
      case 'Fear': return 'text-red-300 bg-red-500/20 border-red-400/50';
      case 'Determination': return 'text-blue-300 bg-blue-500/20 border-blue-400/50';
      case 'Neutral': return 'text-gray-300 bg-gray-500/20 border-gray-400/50';
      case 'Skip': return 'text-amber-300 bg-amber-500/20 border-amber-400/50';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50';
      case 'needs_admin_review': return 'text-amber-300 bg-amber-500/20 border-amber-400/50';
      case 'open': return 'text-blue-300 bg-blue-500/20 border-blue-400/50';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-6 sm:py-8 lg:py-12 px-4">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-12 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-4xl">🔒</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-white/70">FutureEmo-ENG Research Management</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <input 
              type="password" 
              value={adminKey} 
              onChange={(e) => setAdminKey(e.target.value)} 
              placeholder="Enter admin key" 
              className="flex-1 px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-white/50 focus:border-purple-400 outline-none transition-all" 
            />
            <button 
              onClick={handleLoadStats} 
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 active:from-purple-700 active:to-pink-800 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 transform hover:scale-105 active:scale-95 transition-all"
            >
              {loading ? 'Loading...' : 'Load Dashboard'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
              <p className="text-red-200 text-sm sm:text-base font-semibold break-words">{error}</p>
            </div>
          )}
          
          {stats && (
            <div className="space-y-4 sm:space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 sm:gap-4 border-b border-white/20 pb-2">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-t-xl font-bold text-sm sm:text-base transition-all ${
                    activeTab === 'stats'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  📊 Statistics
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-t-xl font-bold text-sm sm:text-base transition-all ${
                    activeTab === 'comments'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  💬 Comment Details ({detailedComments.length})
                </button>
              </div>

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <p className="text-blue-200 text-xs sm:text-sm font-bold uppercase">Total Comments</p>
                      <p className="text-3xl sm:text-4xl font-black text-white mt-2">{stats.totalComments.toLocaleString()}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <p className="text-purple-200 text-xs sm:text-sm font-bold uppercase">Total Labels</p>
                      <p className="text-3xl sm:text-4xl font-black text-white mt-2">{stats.totalLabels.toLocaleString()}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <p className="text-emerald-200 text-xs sm:text-sm font-bold uppercase">Resolved</p>
                      <p className="text-3xl sm:text-4xl font-black text-white mt-2">{stats.resolvedComments.toLocaleString()}</p>
                    </div>
                    <div className="backdrop-blur-sm bg-amber-500/20 border border-amber-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <p className="text-amber-200 text-xs sm:text-sm font-bold uppercase">Agreement Rate</p>
                      <p className="text-3xl sm:text-4xl font-black text-white mt-2">{stats.agreement.agreementRate ? Math.round(stats.agreement.agreementRate) + '%' : 'N/A'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleExport}
                    className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:from-emerald-700 active:to-teal-800 rounded-xl sm:rounded-2xl font-black text-white text-base sm:text-lg shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    📊 Export All Data (CSV)
                  </button>

                  {overallKappa && overallKappa.overallKappa !== null && (
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-4">🎯 Inter-Rater Reliability (Fleiss&apos; Kappa)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className={`backdrop-blur-sm border rounded-xl p-4 ${
                          overallKappa.overallKappa >= 0.6 ? 'bg-emerald-500/20 border-emerald-400/30' :
                          overallKappa.overallKappa >= 0.4 ? 'bg-amber-500/20 border-amber-400/30' :
                          'bg-red-500/20 border-red-400/30'
                        }`}>
                          <p className="text-xs font-bold uppercase text-white/70 mb-1">Overall Kappa</p>
                          <p className="text-4xl font-black text-white">{overallKappa.overallKappa.toFixed(3)}</p>
                          <p className="text-sm font-semibold text-white/80 mt-1">{overallKappa.interpretation}</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase text-white/70 mb-1">Comments Analyzed</p>
                          <p className="text-4xl font-black text-white">{overallKappa.totalComments}</p>
                          <p className="text-sm font-semibold text-white/80 mt-1">Avg {overallKappa.totalRaters} raters each</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase text-white/70 mb-1">Categories</p>
                          <p className="text-4xl font-black text-white">{overallKappa.categories.length}</p>
                          <p className="text-sm font-semibold text-white/80 mt-1">{overallKappa.categories.join(', ')}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase text-white/70 mb-2">Observed Agreement (P̄)</p>
                          <p className="text-2xl font-black text-white">{overallKappa.P_bar.toFixed(3)}</p>
                        </div>
                        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                          <p className="text-xs font-bold uppercase text-white/70 mb-2">Expected by Chance (P̄e)</p>
                          <p className="text-2xl font-black text-white">{overallKappa.P_bar_e.toFixed(3)}</p>
                        </div>
                      </div>
                      <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl p-4">
                        <p className="text-sm font-bold text-white/80 mb-2">Label Distribution</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(overallKappa.categoryDistribution).map(([cat, pct]) => (
                            <span key={cat} className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getLabelColor(cat)}`}>
                              {cat}: {pct}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-white/60 mt-4 italic">
                        κ = (P̄ - P̄e) / (1 - P̄e) | Reference: Fleiss (1971) Psychological Bulletin
                      </p>
                    </div>
                  )}

                  {annotators.length > 0 && (
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                      <h3 className="text-xl sm:text-2xl font-black text-white mb-4">📊 Annotator Quality Metrics</h3>
                      <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <div className="inline-block min-w-full align-middle">
                          <div className="overflow-hidden">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-white/20">
                                  <th className="text-left text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm">Name</th>
                                  <th className="text-right text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm">Labels</th>
                                  <th className="text-right text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Agreement</th>
                                  <th className="text-right text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">Disagreement</th>
                                  <th className="text-right text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm">Disagree %</th>
                                  <th className="text-right text-white/80 font-bold py-3 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap">Avg Time (s)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {annotators.map((a) => (
                                  <tr key={a.userName} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="py-3 px-3 sm:px-4 font-semibold text-white text-xs sm:text-sm">{a.userName}</td>
                                    <td className="py-3 px-3 sm:px-4 text-right text-white/90 text-xs sm:text-sm">{a.totalLabels}</td>
                                    <td className="py-3 px-3 sm:px-4 text-right text-emerald-300 text-xs sm:text-sm hidden sm:table-cell">{a.agreementCount}</td>
                                    <td className="py-3 px-3 sm:px-4 text-right text-red-300 text-xs sm:text-sm hidden sm:table-cell">{a.disagreementCount}</td>
                                    <td className={`py-3 px-3 sm:px-4 text-right font-bold text-xs sm:text-sm ${(a.disagreementRate || 0) > 40 ? 'text-red-400' : 'text-white/90'}`}>
                                      {a.disagreementRate ? Math.round(a.disagreementRate) + '%' : 'N/A'}
                                    </td>
                                    <td className={`py-3 px-3 sm:px-4 text-right font-bold text-xs sm:text-sm ${(a.avgTimeBetweenLabelsSeconds || 999) < 5 ? 'text-red-400' : 'text-white/90'}`}>
                                      {a.avgTimeBetweenLabelsSeconds ? Math.round(a.avgTimeBetweenLabelsSeconds) : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-white/60 mt-4 italic">Scroll horizontally to see all columns on mobile</p>
                    </div>
                  )}
                </>
              )}

              {/* Comments Detail Tab */}
              {activeTab === 'comments' && (
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-4">💬 Detailed Comment Annotations</h3>
                  
                  <div className="space-y-4">
                    {detailedComments.map((comment) => (
                      <div 
                        key={comment._id} 
                        className="backdrop-blur-sm bg-slate-800/50 border border-white/20 rounded-xl p-4 sm:p-5 hover:bg-slate-800/70 transition-all"
                      >
                        {/* Comment Text */}
                        <div className="mb-4">
                          <p className="text-white text-sm sm:text-base font-semibold leading-relaxed break-words">
                            "{comment.text}"
                          </p>
                        </div>

                        {/* Labels Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          {comment.labels.map((label, idx) => (
                            <div 
                              key={idx}
                              className={`border rounded-lg p-3 ${getLabelColor(label.label)}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs sm:text-sm">👤 {label.userName}</span>
                                <span className="font-black text-sm sm:text-base">{label.label}</span>
                              </div>
                            </div>
                          ))}
                          {comment.labels.length === 0 && (
                            <div className="col-span-full text-white/40 text-sm italic">No labels yet</div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10">
                          <span className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-bold ${getStatusColor(comment.status)}`}>
                            {comment.status.replace('_', ' ').toUpperCase()}
                          </span>
                          
                          {comment.majorityLabel && (
                            <span className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-bold ${getLabelColor(comment.majorityLabel)}`}>
                              🏆 Majority: {comment.majorityLabel}
                            </span>
                          )}

                          {comment.finalLabel && (
                            <span className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-bold ${getLabelColor(comment.finalLabel)}`}>
                              ✅ Final: {comment.finalLabel}
                            </span>
                          )}

                          {comment.agreementPercentage !== null && (
                            <span className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-bold ${
                              comment.agreementPercentage >= 75 
                                ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50'
                                : comment.agreementPercentage >= 50
                                ? 'text-amber-300 bg-amber-500/20 border-amber-400/50'
                                : 'text-red-300 bg-red-500/20 border-red-400/50'
                            }`}>
                              📊 Agreement: {comment.agreementPercentage}%
                            </span>
                          )}

                          {comment.fleissKappa !== null && (
                            <span className={`px-3 py-1 rounded-full border text-xs sm:text-sm font-bold ${
                              comment.fleissKappa >= 0.6
                                ? 'text-emerald-300 bg-emerald-500/20 border-emerald-400/50'
                                : comment.fleissKappa >= 0.4
                                ? 'text-amber-300 bg-amber-500/20 border-amber-400/50'
                                : 'text-red-300 bg-red-500/20 border-red-400/50'
                            }`}>
                              κ: {comment.fleissKappa.toFixed(3)}
                            </span>
                          )}

                          <span className="px-3 py-1 rounded-full border text-xs sm:text-sm font-bold text-blue-300 bg-blue-500/20 border-blue-400/50">
                            {comment.labelCount} Label{comment.labelCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}