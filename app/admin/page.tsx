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

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [annotators, setAnnotators] = useState<AnnotatorStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoadStats = async () => {
    if (!adminKey.trim()) { setError('Please enter admin key'); return; }
    try {
      setLoading(true); setError('');
      const [statsRes, annotatorsRes] = await Promise.all([
        fetch(`/api/admin-stats?key=${encodeURIComponent(adminKey)}`),
        fetch(`/api/admin-annotators?key=${encodeURIComponent(adminKey)}`)
      ]);
      if (statsRes.status === 401) { setError('Invalid admin key'); return; }
      if (!statsRes.ok || !annotatorsRes.ok) throw new Error('Failed to load data');
      setStats(await statsRes.json());
      setAnnotators(await annotatorsRes.json());
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
      const a = document.createElement('a'); a.href = url; a.download = 'export.csv'; a.click();
    } catch (err) { setError('Export failed'); }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-12 px-4">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl"></span>
            </div>
            <div><h1 className="text-4xl font-black text-white">Admin Dashboard</h1>
            <p className="text-white/70">FutureEmo-ENG Management</p></div>
          </div>
          
          <div className="flex gap-4 mb-6">
            <input type="password" value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="Enter admin key" 
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-purple-400 outline-none" />
            <button onClick={handleLoadStats} disabled={loading}
              className="px-8 py-4 bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 transform hover:scale-105 transition-all">
              {loading ? 'Loading...' : 'Load Stats'}
            </button>
          </div>
          
          {error && <div className="bg-red-500/20 border-2 border-red-400/50 rounded-2xl p-4 mb-6"><p className="text-red-200 font-semibold">{error}</p></div>}
          
          {stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-2xl p-6">
                  <p className="text-blue-200 text-sm font-bold uppercase">Total Comments</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.totalComments.toLocaleString()}</p>
                </div>
                <div className="backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 rounded-2xl p-6">
                  <p className="text-purple-200 text-sm font-bold uppercase">Total Labels</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.totalLabels.toLocaleString()}</p>
                </div>
                <div className="backdrop-blur-sm bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-6">
                  <p className="text-emerald-200 text-sm font-bold uppercase">Resolved</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.resolvedComments.toLocaleString()}</p>
                </div>
                <div className="backdrop-blur-sm bg-amber-500/20 border border-amber-400/30 rounded-2xl p-6">
                  <p className="text-amber-200 text-sm font-bold uppercase">Agreement Rate</p>
                  <p className="text-4xl font-black text-white mt-2">{stats.agreement.agreementRate ? Math.round(stats.agreement.agreementRate) + '%' : 'N/A'}</p>
                </div>
              </div>

              <button onClick={handleExport}
                className="w-full px-8 py-5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-2xl font-black text-white text-lg shadow-lg transform hover:scale-[1.02] transition-all">
                 Export Resolved Comments (CSV)
              </button>

              {annotators.length > 0 && (
                <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-2xl font-black text-white mb-4"> Annotator Quality Metrics</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-white/20">
                        <th className="text-left text-white/80 font-bold py-3 px-4">Name</th>
                        <th className="text-right text-white/80 font-bold py-3 px-4">Labels</th>
                        <th className="text-right text-white/80 font-bold py-3 px-4">Agreement</th>
                        <th className="text-right text-white/80 font-bold py-3 px-4">Disagreement</th>
                        <th className="text-right text-white/80 font-bold py-3 px-4">Disagree %</th>
                        <th className="text-right text-white/80 font-bold py-3 px-4">Avg Time (s)</th>
                      </tr></thead>
                      <tbody>
                        {annotators.map((a) => (
                          <tr key={a.userName} className="border-b border-white/10 hover:bg-white/5">
                            <td className="py-3 px-4 font-semibold text-white">{a.userName}</td>
                            <td className="py-3 px-4 text-right text-white/90">{a.totalLabels}</td>
                            <td className="py-3 px-4 text-right text-emerald-300">{a.agreementCount}</td>
                            <td className="py-3 px-4 text-right text-red-300">{a.disagreementCount}</td>
                            <td className={`py-3 px-4 text-right font-bold ${(a.disagreementRate || 0) > 40 ? 'text-red-400' : 'text-white/90'}`}>
                              {a.disagreementRate ? Math.round(a.disagreementRate) + '%' : 'N/A'}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${(a.avgTimeBetweenLabelsSeconds || 999) < 5 ? 'text-red-400' : 'text-white/90'}`}>
                              {a.avgTimeBetweenLabelsSeconds ? Math.round(a.avgTimeBetweenLabelsSeconds) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(20px, -20px) scale(1.1); } 50% { transform: translate(-20px, 20px) scale(0.9); } 75% { transform: translate(20px, 20px) scale(1.05); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}
