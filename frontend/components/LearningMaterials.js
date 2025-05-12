import { useState, useEffect } from 'react';
import axios from 'axios';
import LearningMaterialUpload from './LearningMaterialUpload';

export default function LearningMaterials({ subject }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    topic: '',
    resourceType: '',
    search: ''
  });
  const [expandedContents, setExpandedContents] = useState({});

  const toggleContent = (id) => {
    setExpandedContents(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setShowEditForm(true);
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/${materialId}`);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting material:', error);
      setError('Failed to delete material. Please try again later.');
    }
  };

  const handleUpdate = async (materialId, updatedData) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/${materialId}`,
        updatedData
      );
      setShowEditForm(false);
      setEditingMaterial(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating material:', error);
      setError('Failed to update material. Please try again later.');
    }
  };

  const handleDownload = async (material) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/download/${material._id}`,
        { responseType: 'blob' }
      );
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on material topic
      const filename = material.content.startsWith('uploads/') 
        ? material.content.split('/').pop() 
        : `${material.topic.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading material:', error);
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/subjects/${subject}`, {
          params: filters
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
  }, [subject, filters, refreshKey]);

  if (loading) {
    return <p className="text-text-medium">Loading materials...</p>;
  }

  if (error) {
    return <p className="text-text-medium text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-bg-dark-secondary rounded-xl p-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-text-medium mb-2 font-medium">Search Content</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
              placeholder="Search material content..."
            />
          </div>
          <div>
            <label className="block text-text-medium mb-2 font-medium">Topic</label>
            <input
              type="text"
              name="topic"
              value={filters.topic}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
              placeholder="Filter by topic..."
            />
          </div>
          <div>
            <label className="block text-text-medium mb-2 font-medium">Resource Type</label>
            <select
              name="resourceType"
              value={filters.resourceType}
              onChange={handleFilterChange}
              className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
            >
              <option value="">All Types</option>
              <option value="definition">Definition</option>
              <option value="explanation">Explanation</option>
              <option value="example">Example</option>
              <option value="practice">Practice</option>
            </select>
          </div>
        </div>
        <div className="ml-4">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-3 mt-4 bg-hf-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hf-blue"
          >
            {showForm ? 'Cancel' : 'Add Material'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <LearningMaterialUpload 
            subject={subject}
            onSuccess={() => {
              setShowForm(false);
              setRefreshKey(prev => prev + 1);
            }}
          />
        </div>
      )}

      {showEditForm && editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-dark-secondary rounded-xl p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-light">Edit Material</h2>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-text-medium hover:text-text-light transition-colors"
                  aria-label="Close modal"
                >
                  Cancel
                </button>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdate(editingMaterial._id, editingMaterial);
            }} className="space-y-6">
              <div>
                <label className="block text-text-medium font-medium mb-2">Topic</label>
                <input
                  type="text"
                  value={editingMaterial.topic}
                  onChange={(e) => setEditingMaterial({...editingMaterial, topic: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-text-medium font-medium mb-2">Resource Type</label>
                <select
                  value={editingMaterial.resourceType}
                  onChange={(e) => setEditingMaterial({...editingMaterial, resourceType: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue"
                >
                  <option value="definition">Definition</option>
                  <option value="explanation">Explanation</option>
                  <option value="example">Example</option>
                  <option value="practice">Practice</option>
                </select>
              </div>
              {!editingMaterial.content.startsWith('uploads/') && (
                <div>
                  <label className="block text-text-medium font-medium mb-2">Content</label>
                  <textarea
                    value={editingMaterial.content}
                    onChange={(e) => setEditingMaterial({...editingMaterial, content: e.target.value})}
                    rows="8"
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue resize-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-text-medium font-medium mb-2">Tags</label>
                <input
                  type="text"
                  value={editingMaterial.tags?.join(', ')}
                  onChange={(e) => setEditingMaterial({
                    ...editingMaterial,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue"
                  placeholder="Enter tags, separated by commas"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingMaterial(null);
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) }

      <div className="space-y-6">
        {materials.length > 0 ? (
          materials.map(material => (
            <div key={material._id} className="p-6 rounded-xl bg-gray-800 border-2 border-gray-600 hover:border-hf-blue transition-all duration-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-medium text-text-light">{material.topic}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-bg-dark-tertiary text-text-medium">
                      {material.resourceType}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-bg-dark-tertiary text-text-medium">
                      {material.content.startsWith('uploads/') ? '📎 File' : '📝 Text'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(material)}
                    className="px-3 py-1 bg-hf-blue text-white rounded hover:bg-blue-600 transition text-sm flex items-center gap-1"
                  >
                    <span>⬇️</span> Download
                  </button>
                  <button
                    onClick={() => handleEdit(material)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm flex items-center gap-1"
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(material._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm flex items-center gap-1"
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
              
              {!material.content.startsWith('uploads/') && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleContent(material._id)}
                    className="flex items-center gap-2 text-text-medium hover:text-text-light transition-colors mb-2"
                  >
                    <span className={`transform transition-transform duration-200 ${expandedContents[material._id] ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <span>Content</span>
                  </button>
                  {expandedContents[material._id] && (
                    <div className="p-3 bg-gray-700 rounded border border-gray-600 animate-expand">
                      <p className="text-text-medium whitespace-pre-wrap">{material.content}</p>
                    </div>
                  )}
                </div>
              )}

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
    </div>
  );
}
