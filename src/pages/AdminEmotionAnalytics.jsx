import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AdminEmotionAnalytics = () => {
  const [stats, setStats] = useState({
    total: 0,
    mostCommon: 'N/A',
    distribution: {}
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('emotionHistory')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);

        if (error) throw error;

        const docs = data || [];
        setHistory(docs);

        const distribution = {};
        docs.forEach(doc => {
          const em = doc.emotion || 'unknown';
          distribution[em] = (distribution[em] || 0) + 1;
        });

        let mostCommon = 'N/A';
        let maxCount = 0;
        Object.entries(distribution).forEach(([em, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            mostCommon = em;
          }
        });

        setStats({
          total: docs.length,
          mostCommon,
          distribution
        });
      } catch (err) {
        console.error('Error fetching emotion analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading Emotion Analytics...</div>;

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Emotion Detection Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-gray-400 text-sm">Total Scans</h2>
          <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-gray-400 text-sm">Most Frequent Mood</h2>
          <p className="text-4xl font-bold mt-2 capitalize text-indigo-400">{stats.mostCommon}</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-bold mb-4">Mood Distribution</h2>
        <div className="space-y-3">
          {Object.entries(stats.distribution).map(([mood, count]) => (
            <div key={mood} className="flex items-center">
              <span className="w-24 capitalize">{mood}</span>
              <div className="flex-1 bg-gray-700 h-4 rounded-full overflow-hidden mx-3">
                <div 
                  className="bg-indigo-500 h-full" 
                  style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-400">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEmotionAnalytics;
