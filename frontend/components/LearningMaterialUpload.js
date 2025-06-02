import { useState } from 'react';
import api from '../lib/api';

export default function LearningMaterialUpload({ subject, onSuccess }) {
  const [formData, setFormData] = useState({
    topic: '',
    resourceType: 'definition',
    difficulty: 'intermediate',
    tags: '',
    content: '',
    inputType: 'file', // 'file' or 'text'
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('subject', subject);

      if (file) {
        formDataToSend.append('file', file);
      }

      Object.keys(formData).forEach(key => {
        if (key !== 'content' && key !== 'inputType') {
          if (key === 'tags') {
            const tagsArray = formData[key]
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag);
            formDataToSend.append(key, JSON.stringify(tagsArray));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      if (formData.inputType === 'text') {
        formDataToSend.append('content', formData.content || '');
      } else if (!file) {
        formDataToSend.append('content', 'No file uploaded');
      }

      await api.post('/api/materials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Learning material uploaded successfully!');
      setFormData({
        topic: '',
        resourceType: 'definition',
        difficulty: 'intermediate',
        tags: '',
        content: '',
        inputType: 'file',
      });
      setFile(null);
      if (e.target.file) {
        e.target.file.value = '';
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        'Failed to upload material';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-bg-dark-secondary rounded-xl p-6'>
      <h2 className='text-xl font-semibold text-text-light mb-6'>
        Add Material to {subject}
      </h2>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Left column */}
          <div className='space-y-6'>
            <div>
              <label className='block text-text-medium font-medium mb-2'>
                Topic
              </label>
              <input
                type='text'
                name='topic'
                required
                value={formData.topic}
                onChange={handleInputChange}
                className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue'
                placeholder='Enter topic name'
              />
            </div>

            <div>
              <label className='block text-text-medium font-medium mb-2'>
                Resource Type
              </label>
              <select
                name='resourceType'
                value={formData.resourceType}
                onChange={handleInputChange}
                className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue'
              >
                <option value='definition'>Definition</option>
                <option value='explanation'>Explanation</option>
                <option value='example'>Example</option>
                <option value='practice'>Practice</option>
              </select>
            </div>

            <div>
              <label className='block text-text-medium font-medium mb-2'>
                Difficulty
              </label>
              <select
                name='difficulty'
                value={formData.difficulty}
                onChange={handleInputChange}
                className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </div>

            <div>
              <label className='block text-text-medium font-medium mb-2'>
                Tags
              </label>
              <input
                type='text'
                name='tags'
                value={formData.tags}
                onChange={handleInputChange}
                placeholder='e.g., math, algebra, equations'
                className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue'
              />
              <p className='mt-1 text-sm text-text-medium'>
                Separate tags with commas
              </p>
            </div>
          </div>

          {/* Right column */}
          <div className='space-y-6'>
            <div>
              <label className='block text-text-medium font-medium mb-2'>
                Content Type
              </label>
              <div className='flex gap-6'>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='inputType'
                    value='file'
                    checked={formData.inputType === 'file'}
                    onChange={handleInputChange}
                    className='text-hf-blue focus:ring-hf-blue h-4 w-4 mr-2'
                  />
                  <div>
                    <span className='text-text-light'>Upload Document</span>
                    <p className='text-sm text-text-medium'>
                      PDF, DOC, DOCX, TXT (Max 5MB)
                    </p>
                  </div>
                </label>
                <label className='flex items-center'>
                  <input
                    type='radio'
                    name='inputType'
                    value='text'
                    checked={formData.inputType === 'text'}
                    onChange={handleInputChange}
                    className='text-hf-blue focus:ring-hf-blue h-4 w-4 mr-2'
                  />
                  <div>
                    <span className='text-text-light'>Add Text Content</span>
                    <p className='text-sm text-text-medium'>
                      Type or paste content directly
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {formData.inputType === 'file' ? (
              <div>
                <label className='block text-text-medium font-medium mb-2'>
                  Upload File
                </label>
                <input
                  type='file'
                  name='file'
                  onChange={handleFileChange}
                  accept='.pdf,.doc,.docx,.txt'
                  className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-hf-blue file:text-white hover:file:bg-blue-600'
                />
              </div>
            ) : (
              <div>
                <label className='block text-text-medium font-medium mb-2'>
                  Content
                </label>
                <textarea
                  name='content'
                  value={formData.content}
                  onChange={handleInputChange}
                  rows='12'
                  className='w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-text-light focus:outline-none focus:ring-2 focus:ring-hf-blue resize-none'
                  placeholder='Enter your content here...'
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className='bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-900/50 border border-green-500 text-green-200 px-4 py-2 rounded-lg'>
            {success}
          </div>
        )}

        <div className='flex justify-end mt-8'>
          <button
            type='submit'
            disabled={loading}
            className={`px-6 py-3 bg-hf-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hf-blue ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
}
