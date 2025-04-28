import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LearningMaterials({ filters }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const params = {};
        if (filters.subject) params.subject = filters.subject;
        if (filters.topic) params.topic = filters.topic;
        if (filters.resourceType) params.resourceType = filters.resourceType;

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials`, {
          params
        });
        setMaterials(response.data.materials || []);
      } catch (error) {
        console.error('Error fetching learning materials:', error);
        setError('Failed to load materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [filters, refreshKey]);

  if (loading) {
    return <p className="text-text-medium">Loading materials...</p>;
  }

  if (error) {
    return <p className="text-text-medium text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {materials.length > 0 ? (
        materials.map(material => (
          <div key={material._id} className="p-4 rounded-lg bg-gray-800 border border-gray-600 hover:border-hf-blue transition-colors">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-text-light">{material.subject}</h3>
              <span className="text-xs px-2 py-1 rounded bg-bg-dark-tertiary text-text-medium">
                {material.resourceType}
              </span>
            </div>
            <p className="text-sm text-text-medium mt-1">{material.topic}</p>
            <div className="mt-3 p-3 bg-gray-700 rounded border border-gray-600">
              <p className="text-text-medium whitespace-pre-wrap">{material.content}</p>
            </div>
            {material.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {material.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 rounded bg-bg-dark-tertiary text-text-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-text-medium">No learning materials available.</p>
      )}
    </div>
  );
}
