import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const themes = {
  default: {
    background: 'bg-gradient-to-br from-purple-600 to-blue-500',
    text: 'text-white',
    button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
    container: 'bg-white/10 backdrop-blur-md'
  },
  dark: {
    background: 'bg-gray-700',
    text: 'text-white',
    button: 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105',
    container: 'bg-gray-800/50 backdrop-blur-md'
  },
  light: {
    background: 'bg-gray-200',
    text: 'text-gray-900',
    button: 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105',
    container: 'bg-gray-50/80 backdrop-blur-md'
  }
};

const LinktreeProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      // Mock profile data for demo
      const mockProfile = {
        username: username || 'demo_user',
        bio: 'This is a demo profile. Create your own LinkNest profile to share your links!',
        avatar: '',
        theme: 'default',
        links: [
          {
            _id: '1',
            platform: 'Instagram',
            url: 'https://instagram.com'
          },
          {
            _id: '2',
            platform: 'YouTube',
            url: 'https://youtube.com'
          },
          {
            _id: '3',
            platform: 'Twitter',
            url: 'https://twitter.com'
          }
        ]
      };

      // Try to load from localStorage if available
      const savedProfile = localStorage.getItem('linktree_profile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setUser({
          username: username || 'demo_user',
          ...parsedProfile
        });
      } else {
        setUser(mockProfile);
      }
      
      setError('');
    } catch (err) {
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-white/80">The profile you're looking for doesn't exist.</p>
          <p className="text-white/60 text-sm mt-2">This is a demo profile.</p>
        </div>
      </div>
    );
  }

  const theme = themes[user.theme || 'default'];

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} flex items-center justify-center p-4`}>
      <div className={`${theme.container} rounded-2xl p-8 max-w-md w-full`}>
        {user.avatar && (
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/20"
          />
        )}
        
        <h1 className="text-2xl font-bold text-center mb-2">{user.username}</h1>
        
        {user.bio && (
          <p className="text-center mb-8 opacity-90 leading-relaxed">{user.bio}</p>
        )}
        
        <div className="space-y-3">
          {user.links && user.links.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full p-4 rounded-lg text-center font-medium transition-all ${theme.button} shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center justify-center gap-3">
                {getFaviconUrl(link.url) && (
                  <img src={getFaviconUrl(link.url)} alt="" className="w-5 h-5" />
                )}
                <span>{link.platform}</span>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm opacity-75">Powered by LinkNest</p>
          <p className="text-xs opacity-50 mt-1">Demo Mode</p>
        </div>
      </div>
    </div>
  );
};

export default LinktreeProfile;
