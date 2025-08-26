import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

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
    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      // First, try to find the user by username in the usernames collection
      const usernamesLinktreeDocRef = doc(db, 'usernames', 'LinkTree');
      const usernamesLinktreeDoc = await getDoc(usernamesLinktreeDocRef);
      
      let userId = null;
      if (usernamesLinktreeDoc.exists()) {
        const usernamesData = usernamesLinktreeDoc.data();
        if (usernamesData[username]) {
          userId = usernamesData[username].uid;
        } else {
          // Username not found, try to use username as UID directly
          userId = username;
        }
      } else {
        // Username not found, try to use username as UID directly
        userId = username;
      }

      // Now try to get the LinkTree document
      const linktreeDocRef = doc(db, 'users', userId, 'LinkTree', 'profile');
      const linktreeDoc = await getDoc(linktreeDocRef);
      
      if (linktreeDoc.exists()) {
        const linktreeData = linktreeDoc.data();
        // Use the LinkTree data directly
        setUser({
          username: username,
          bio: linktreeData.bio || '',
          avatar: linktreeData.avatar || '',
          theme: linktreeData.theme || 'default',
          links: linktreeData.links || []
        });
      } else {
        // User document doesn't exist - show demo profile
        const demoProfile = {
          username: username || 'demo_user',
          bio: 'This is a demo profile. Create your own LinkNest profile to share your links!',
          avatar: '',
          theme: 'default',
          links: [
            {
              _id: '1',
              platform: 'Instagram',
              url: 'https://instagram.com',
              active: true
            },
            {
              _id: '2',
              platform: 'YouTube',
              url: 'https://youtube.com',
              active: true
            },
            {
              _id: '3',
              platform: 'Twitter',
              url: 'https://twitter.com',
              active: true
            }
          ]
        };
        setUser(demoProfile);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Show demo profile on error
      const demoProfile = {
        username: username || 'demo_user',
        bio: 'This is a demo profile. Create your own LinkNest profile to share your links!',
        avatar: '',
        theme: 'default',
        links: [
          {
            _id: '1',
            platform: 'Instagram',
            url: 'https://instagram.com',
            active: true
          },
          {
            _id: '2',
            platform: 'YouTube',
            url: 'https://youtube.com',
            active: true
          },
          {
            _id: '3',
            platform: 'Twitter',
            url: 'https://twitter.com',
            active: true
          }
        ]
      };
      setUser(demoProfile);
    } finally {
      setLoading(false);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      // Try multiple favicon sources for better compatibility
      const hostname = urlObject.hostname;
      
      // Return Google's favicon service as it's more reliable
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch (e) {
      return null;
    }
  };

  const trackLinkClick = async (username, linkIndex) => {
    try {
      // First, find the user ID from the username mapping
      const usernamesLinktreeDocRef = doc(db, 'usernames', 'LinkTree');
      const usernamesLinktreeDoc = await getDoc(usernamesLinktreeDocRef);
      
      let userId = null;
      if (usernamesLinktreeDoc.exists()) {
        const usernamesData = usernamesLinktreeDoc.data();
        if (usernamesData[username]) {
          userId = usernamesData[username].uid;
        } else {
          // Fallback to using username as UID
          userId = username;
        }
      } else {
        // Fallback to using username as UID
        userId = username;
      }

      // Use the new click tracking collection for public access
      const clickTrackingRef = doc(db, 'clickTracking', userId);
      await setDoc(clickTrackingRef, {
        [`links.${linkIndex}.clicks`]: increment(1),
        [`links.${linkIndex}.lastClicked`]: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Don't throw error, just log it
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
          <p className="text-white/80">The profile you&apos;re looking for doesn&apos;t exist.</p>
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
          {user.links && user.links.filter(link => link.active !== false).map((link, index) => (
            <a
              key={link._id || index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full p-4 rounded-lg text-center font-medium transition-all ${theme.button} shadow-lg hover:shadow-xl`}
              onClick={async () => {
                try {
                  await trackLinkClick(user.username, index);
                } catch {
                  // Ignore click tracking errors
                }
              }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center justify-center">
                  {getFaviconUrl(link.url) ? (
                    <img 
                      src={getFaviconUrl(link.url)} 
                      alt="" 
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-xs" style={{ display: getFaviconUrl(link.url) ? 'none' : 'flex' }}>
                    🔗
                  </div>
                </div>
                <span>{link.title || link.platform}</span>
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm opacity-75">Powered by LinkNest</p>
          {user.username === 'demo_user' && (
            <p className="text-xs opacity-50 mt-1">Demo Mode</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinktreeProfile;
