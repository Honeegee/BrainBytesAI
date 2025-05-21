import { useEffect, useState } from 'react';
import api from '../lib/api';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';

function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // First useEffect to check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        await api.get(`/api/users/${userId}`);
        setIsAuthChecked(true); // Auth confirmed, proceed to fetch data
      } catch (error) {
        console.error('Auth check failed:', error); // Handle or redirect if needed
      }
    };
    checkAuth();
  }, []);

  // Second useEffect to fetch data after auth is confirmed
  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchActivity = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await api.get(`/api/users/${userId}/activity`);
        
        setActivityData(response.data); // Save activity and stats data to state
        setError(null);
      } catch (err) {
        console.error('Error fetching activity data:', err);
        setError('Failed to load dashboard data'); // Display error to user
      } finally {
        setLoading(false); // Loading complete (success or fail)
      }
    };

    fetchActivity();
  }, [isAuthChecked]);

  // Format a date string into readable format (e.g., "Jan 1, 12:00 PM")
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Layout darkMode={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-light mb-8">Dashboard</h1>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-md mb-8 border border-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-light"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-bg-dark-secondary p-6 rounded-lg border border-border-dark">
              <h2 className="text-xl font-semibold text-text-light mb-4">Recent Activity</h2>
              {activityData?.recentActivity?.messages.length > 0 ? (
                <div className="space-y-4">
                  {activityData.recentActivity.messages.map((message) => (
                    <div key={message._id} className="flex items-start space-x-3 p-3 bg-bg-dark rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-hf-blue flex items-center justify-center text-white">
                          <span className="text-sm">{message.subject?.[0] || '?'}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-light text-sm truncate">{message.text}</p>
                        <p className="text-text-medium text-xs">{formatDate(message.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-medium">No recent activity</p>
              )}
            </div>

            <div className="bg-bg-dark-secondary p-6 rounded-lg border border-border-dark">
              <h2 className="text-xl font-semibold text-text-light mb-4">Learning Progress</h2>
              {activityData?.progress.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-bg-dark p-4 rounded-lg">
                      <p className="text-text-medium text-sm">Total Interactions</p>
                      <p className="text-text-light text-2xl font-bold">{activityData.stats.totalInteractions}</p>
                    </div>
                    <div className="bg-bg-dark p-4 rounded-lg">
                      <p className="text-text-medium text-sm">Active Subjects</p>
                      <p className="text-text-light text-2xl font-bold">{activityData.stats.activeSubjects}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activityData.progress.map((subject) => (
                      <div key={subject.subject} className="bg-bg-dark p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-text-light font-medium">{subject.subject}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            subject.level === 'Expert' ? 'bg-green-900 text-green-200' :
                            subject.level === 'Advanced' ? 'bg-blue-900 text-blue-200' :
                            subject.level === 'Intermediate' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-gray-900 text-gray-200'
                          }`}>
                            {subject.level}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-bg-dark-secondary rounded-full h-2">
                            <div 
                              className="bg-hf-blue rounded-full h-2"
                              style={{
                                width: `${Math.min((subject.interactions / 50) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-text-medium text-xs">{subject.interactions} interactions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-text-medium">No progress data available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(DashboardPage);
