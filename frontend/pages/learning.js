import { useState } from 'react';
import Layout from '../components/Layout';
import LearningMaterials from '../components/LearningMaterials';

export default function LearningPage() {
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    resourceType: '',
    search: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    content: '',
    resourceType: 'explanation',
    difficulty: 'intermediate',
    tags: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'file') {
          formDataToSend.append(key, value);
        }
      });
      formDataToSend.append('tags', formData.tags.split(',').map(tag => tag.trim()));
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowForm(false);
      setFormData({
        subject: '',
        topic: '',
        content: '',
        resourceType: 'explanation',
        difficulty: 'intermediate',
        tags: ''
      });
    } catch (error) {
      console.error('Error creating material:', error);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mt-8 mb-6">
          <h1 className="text-2xl font-semibold text-text-light">Learning Materials</h1>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-hf-blue text-white rounded hover:bg-blue-600 transition"
          >
            {showForm ? 'Cancel' : 'Add New Material'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-bg-dark-secondary rounded-lg">
            <h2 className="text-xl font-medium mb-4 text-text-light">Add New Learning Material</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-medium mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
                  required
                />
              </div>
              <div>
                <label className="block text-text-medium mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-text-medium mb-1">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light min-h-[120px]"
                  placeholder="Enter your learning material content"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-text-medium mb-1">Attach File (Optional)</label>
                <input
                  type="file"
                  name="file"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light file:bg-gray-700 file:border-0 file:text-text-light"
                  accept=".pdf,.doc,.docx,.txt,.md"
                />
                {formData.file && (
                  <p className="text-xs text-text-medium mt-1">
                    Selected: {formData.file.name}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text-medium mb-1">Resource Type</label>
                <select
                  name="resourceType"
                  value={formData.resourceType}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
                >
                  <option value="definition">Definition</option>
                  <option value="explanation">Explanation</option>
                  <option value="example">Example</option>
                  <option value="practice">Practice</option>
                </select>
              </div>
              <div>
                <label className="block text-text-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleFormChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Submit Material
            </button>
          </form>
        )}

        <div className="mb-6 p-4 bg-bg-dark-secondary rounded-lg">
          <h2 className="text-lg font-medium mb-3 text-text-light">Filter Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-text-medium mb-1">Search Content</label>
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
              <label className="block text-text-medium mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={filters.subject}
                onChange={handleFilterChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
              />
            </div>
            <div>
              <label className="block text-text-medium mb-1">Topic</label>
              <input
                type="text"
                name="topic"
                value={filters.topic}
                onChange={handleFilterChange}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-text-light"
              />
            </div>
            <div>
              <label className="block text-text-medium mb-1">Resource Type</label>
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
        </div>

        <LearningMaterials filters={filters} />
      </div>
    </Layout>
  );
}
