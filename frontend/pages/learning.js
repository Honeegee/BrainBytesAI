import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LearningMaterials from '../components/LearningMaterials';
import api from '../lib/api';
import withAuth from '../components/withAuth';

function LearningPage() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // First useEffect to check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        await api.get(`/api/users/${userId}`);
        setIsAuthChecked(true);
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  // Second useEffect to fetch subjects after auth is confirmed
  useEffect(() => {
    if (!isAuthChecked) return;

    const fetchSubjects = async () => {
      try {
        const response = await api.get('/api/materials/subjects');
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to load subjects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [isAuthChecked]);

  const handleCreateSubject = async e => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      await api.post('/api/materials/subjects', {
        subject: newSubjectName.trim(),
      });
      const response = await api.get('/api/materials/subjects');
      setSubjects(response.data);
      setNewSubjectName('');
    } catch (error) {
      console.error('Error creating subject:', error);
      setError('Failed to create subject. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout darkMode={true}>
        <div className='max-w-6xl mx-auto px-4 py-8'>
          <p className='text-text-medium'>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout darkMode={true}>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {!selectedSubject ? (
          <div className='space-y-8'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-text-light'>
                  Learning Materials
                </h1>
                <p className='text-text-medium mt-2'>
                  {subjects.length}{' '}
                  {subjects.length === 1 ? 'Subject' : 'Subjects'} Available
                </p>
              </div>
            </div>

            {error && (
              <div className='mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg'>
                <p className='text-red-200'>{error}</p>
              </div>
            )}

            {/* Create New Subject Form */}
            <div className='bg-bg-dark-secondary rounded-xl p-6'>
              <h2 className='text-xl font-semibold text-text-light mb-4'>
                Add New Subject
              </h2>
              <form onSubmit={handleCreateSubject} className='flex gap-4'>
                <input
                  type='text'
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  placeholder='Enter subject name (e.g., Mathematics, Physics)'
                  className='flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hf-blue focus:border-transparent'
                />
                <button
                  type='submit'
                  className='px-6 py-3 bg-hf-blue text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hf-blue'
                >
                  Create Subject
                </button>
              </form>
              {error && <p className='mt-2 text-red-500'>{error}</p>}
            </div>

            {/* Subject Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {subjects.map(subject => (
                <div
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className='group p-6 rounded-xl bg-gray-800 border-2 border-gray-600 hover:border-hf-blue transition-all duration-200 text-left relative cursor-pointer'
                >
                  <div className='flex flex-col h-full'>
                    <div>
                      <h3 className='text-xl font-semibold text-text-light mb-2'>
                        {subject}
                      </h3>
                      <p className='text-text-medium text-sm'>
                        Click to view learning materials
                      </p>
                    </div>
                    <div className='mt-auto flex justify-between items-center pt-4'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${subject} and all its materials?`
                            )
                          ) {
                            try {
                              api
                                .delete('/api/materials/subjects', {
                                  data: { subject },
                                })
                                .then(() => {
                                  api
                                    .get('/api/materials/subjects')
                                    .then(response =>
                                      setSubjects(response.data)
                                    )
                                    .catch(error => {
                                      console.error(
                                        'Error fetching subjects:',
                                        error
                                      );
                                      setError(
                                        'Failed to refresh subjects list.'
                                      );
                                    });
                                })
                                .catch(error => {
                                  console.error(
                                    'Error deleting subject:',
                                    error
                                  );
                                  setError(
                                    'Failed to delete subject. Please try again.'
                                  );
                                });
                            } catch (error) {
                              console.error('Error:', error);
                              setError('An unexpected error occurred.');
                            }
                          }
                        }}
                        className='text-red-400 hover:text-red-500 hover:bg-red-900/20 rounded-lg transition-colors px-3 py-1 text-sm z-20'
                      >
                        Delete
                      </button>
                      <span className='text-hf-blue opacity-0 group-hover:opacity-100 transition-opacity'>
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center gap-6 pb-6 border-b border-gray-700'>
              <button
                onClick={() => setSelectedSubject(null)}
                className='p-2 text-text-medium hover:text-text-light transition-colors'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 19l-7-7 7-7'
                  />
                </svg>
              </button>
              <div>
                <h1 className='text-3xl font-bold text-text-light'>
                  {selectedSubject}
                </h1>
                <p className='text-text-medium mt-1'>
                  Browse and manage learning materials
                </p>
              </div>
            </div>

            <LearningMaterials
              subject={selectedSubject}
              key={selectedSubject}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}

export default withAuth(LearningPage);
