import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const AdminEmotionAnalytics = () => {
  const [stats, setStats] = useState({
    total: 0,
    mostCommon: 'N/A',
    distribution: {}
  });
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const historyRef = collection(db, 'emotionHistory');
        
        // Fetch recent 100 entries for analytics (in production, use aggregation queries)
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        const history = [];
        const distribution = {};
        
        snapshot.forEach(doc => {
          const data = doc.data();
          history.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate().toLocaleString() || 'Unknown'
          });
          
          const emo = data.emotion;
          distribution[emo] = (distribution[emo] || 0) + 1;
        });
        
        // Find most common
        let mostCommon = 'N/A';
        let maxCount = 0;
        Object.entries(distribution).forEach(([emo, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostCommon = emo;
          }
        });

        setStats({
          total: snapshot.size,
          mostCommon,
          distribution
        });
        setRecentHistory(history.slice(0, 10)); // Just show latest 10 in table
        
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading analytics...</div>;
  }

  const maxDist = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Emotion Analytics Dashboard</h1>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Detections</h3>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-2">Based on recent sample</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Most Common</h3>
            <p className="text-4xl font-bold text-indigo-400 capitalize">{stats.mostCommon}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg mb-10">
          <h3 className="text-lg font-bold mb-6 text-white border-b border-gray-800 pb-4">Emotion Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.distribution).sort((a, b) => b[1] - a[1]).map(([emo, count]) => (
              <div key={emo} className="flex items-center">
                <div className="w-24 capitalize text-sm text-gray-300 font-medium">{emo}</div>
                <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden ml-4 relative">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(count / maxDist) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm font-bold text-gray-400 ml-4">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent History Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">Recent Detections</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4">User ID</th>
                  <th className="px-6 py-4">Emotion</th>
                  <th className="px-6 py-4">Confidence</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/30'}>
                    <td className="px-6 py-4 font-mono text-xs">{row.userId.substring(0, 8)}...</td>
                    <td className="px-6 py-4 capitalize text-white font-medium">{row.emotion}</td>
                    <td className="px-6 py-4">{row.confidence}%</td>
                    <td className="px-6 py-4">{row.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminEmotionAnalytics;
