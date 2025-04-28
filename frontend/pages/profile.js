import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import withAuth from '../components/withAuth';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    preferredSubjects: []
  });
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch user profile and available subjects
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // Fetch user profile
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProfile(profileResponse.data);

        // Fetch available subjects
        const subjectsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/materials/subjects`
        );
        setAvailableSubjects(subjectsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Error loading profile data');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubjectChange = (subject) => {
    setProfile(prev => {
      const subjects = prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...prev.preferredSubjects, subject];
      return { ...prev, preferredSubjects: subjects };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      // Add preferred subjects one by one to maintain array structure
      profile.preferredSubjects.forEach((subject, index) => {
        formData.append(`preferredSubjects[${index}]`, subject);
      });
      
      if (profile.avatarFile) {
        formData.append('avatar', profile.avatarFile);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error updating profile. Please try again.';
      setMessage(errorMessage);
      console.error('Error updating profile:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfile(prev => ({ ...prev, avatarFile: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, avatarPreview: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout darkMode={true}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-12">
          <div className="relative group mb-4">
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              {profile.avatarPreview || profile.avatar ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden group-hover:opacity-80 transition-opacity">
                  <img 
                    src={profile.avatarPreview || `${process.env.NEXT_PUBLIC_BACKEND_URL}${profile.avatar}`}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-hf-blue flex items-center justify-center text-white text-5xl font-bold group-hover:bg-blue-700 transition-colors">
                  {profile.name ? (() => {
                    const initial = profile.name.charAt(0).toUpperCase();
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('userInitial', initial);
                    }
                    return initial;
                  })() : 'P'}
                </div>
              )}
            </label>
            {profile.avatar && !profile.avatarPreview && (
              <button 
                onClick={() => setProfile(prev => ({ ...prev, avatar: '', avatarFile: null }))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                title="Remove avatar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-text-light">User Profile</h1>
        </div>
        
        {message && (
          <div 
            className={`p-4 rounded-md mb-6 ${
              message.includes('Error')
                ? 'bg-red-900 bg-opacity-50 text-red-200 border border-red-700'
                : 'bg-green-900 bg-opacity-50 text-green-200 border border-green-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-medium mb-1">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              required
              className="input bg-bg-dark border-border-dark text-text-light focus:ring-hf-blue focus:border-hf-blue"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-medium mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              required
              className="input bg-bg-dark border-border-dark text-text-light focus:ring-hf-blue focus:border-hf-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-medium mb-3">
              Preferred Subjects:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {availableSubjects.map(subject => (
                <label 
                  key={subject} 
                className="flex items-center space-x-3 p-3 rounded-md border border-border-dark hover:bg-bg-dark-secondary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={profile.preferredSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="h-4 w-4 text-hf-blue rounded border-border-dark focus:ring-hf-blue bg-bg-dark"
                  />
                  <span className="text-text-light">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="btn bg-hf-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto"
          >
            Save Profile
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default withAuth(Profile);
