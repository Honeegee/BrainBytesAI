import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';

function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <Layout darkMode={true}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-light mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-bg-dark-secondary p-6 rounded-lg border border-border-dark">
            <h2 className="text-xl font-semibold text-text-light mb-4">Recent Activity</h2>
            {/* Activity content will go here */}
          </div>
          <div className="bg-bg-dark-secondary p-6 rounded-lg border border-border-dark">
            <h2 className="text-xl font-semibold text-text-light mb-4">Learning Progress</h2>
            {/* Progress content will go here */}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(DashboardPage);
