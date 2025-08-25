import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

function Profile({ username, onBackToDashboard }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileShare, setShowProfileShare] = useState(false);
  const [showInputIndex, setShowInputIndex] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  useEffect(() => {
    console.log('Profile component received username:', username);
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    
    try {
      const res = await axios.get(`https://link-tree-backend-theta.vercel.app/api/users/${username}`);
      setUser(res.data);
      setError('');
    } catch {
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-2">Profile Not Found</p>
        <p className="text-white/80">The profile you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    </div>
  );

  const theme = themes[user.theme || 'default'];

  const threeDotIcon = (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400 hover:text-gray-700 cursor-pointer">
      <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
    </svg>
  );

  const profileUrl = `${window.location.origin}/profile/${username}`;

  // Only one popup at a time
  const isAnyPopupOpen = showProfileShare || showInputIndex !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      {/* iPhone 16 Frame */}
      <div className="relative mx-auto w-[280px] sm:w-[320px]">
        {/* iPhone Body */}
        <div className="relative bg-black rounded-[45px] p-2 shadow-2xl">
          {/* iPhone Screen */}
          <div className="w-full h-[600px] rounded-[38px] flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-500">
            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10"></div>
            
            {/* Status Bar */}
            <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-8 z-20">
              <div className="flex items-center space-x-1">
                <span className="text-white text-xs font-semibold">9:41</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-3 bg-white rounded-sm"></div>
                  <div className="w-1 h-3 bg-white rounded-sm"></div>
                  <div className="w-1 h-3 bg-white rounded-sm"></div>
                  <div className="w-1 h-3 bg-white rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Back button */}
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="absolute top-12 left-4 z-30 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors duration-200"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Custom scrollbar styles */}
            <style>
              {`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 0px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: transparent;
                }
                .custom-scrollbar {
                  scrollbar-width: none;
                }
              `}
            </style>

            {/* Profile Content */}
            <div className="w-full h-full flex flex-col pt-16 pb-8 px-4 custom-scrollbar overflow-y-auto">
        {/* Overlay for blur when any popup is open */}
        {isAnyPopupOpen && (
          <div
                  className="fixed inset-0 bg-black/20 z-40"
            onClick={() => { setShowProfileShare(false); setShowInputIndex(null); setShowMoreOptions(false); }}
          />
        )}
              
              <div className={`rounded-2xl p-6 ${theme.container} transition-all duration-300 relative flex-1`}>
          {/* Three-dot icon at top right for profile share */}
          <div className="absolute top-4 right-4 z-40" onClick={() => { setShowProfileShare(true); setShowInputIndex(null); setShowMoreOptions(false); }}>
            {threeDotIcon}
          </div>
                
          <div className="text-center">
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-white shadow-lg transform hover:scale-105 transition-transform duration-300"
              />
            )}
            <h1 className={`text-3xl font-bold mb-3 ${theme.text}`}>@{user.username}</h1>
            {user.bio && (
              <p className={`mb-8 ${theme.text} opacity-90`}>{user.bio}</p>
            )}
          </div>

                                {/* Profile share popup - iOS Style */}
          {showProfileShare && (
                  <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                    {/* Backdrop */}
                    <div 
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                      onClick={() => setShowProfileShare(false)}
                    />
                    
                    {/* Share Sheet */}
                    <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out">
                      {/* Handle */}
                      <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                      
                      {/* Header */}
                      <div className="px-6 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 text-center">Share Profile</h2>
                      </div>
                      
                      {/* Preview */}
                      <div className="px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xl text-gray-500">👤</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">@{user.username}</p>
                            <p className="text-xs text-gray-500 truncate">{profileUrl}</p>
                          </div>
                      </div>
                      </div>
                      
                      {/* Share Options */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-4 gap-4">
                          {/* Copy Link */}
                          <button 
                            className="flex flex-col items-center space-y-2"
                            onClick={() => {
                              navigator.clipboard.writeText(profileUrl);
                              setShowProfileShare(false);
                            }}
                          >
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                      </div>
                            <span className="text-xs text-gray-600">Copy</span>
                    </button>
                          
                          {/* X (Twitter) */}
                          <button 
                            className="flex flex-col items-center space-y-2"
                            onClick={() => {
                              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}`, '_blank');
                              setShowProfileShare(false);
                            }}
                          >
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231l5.45-6.231Zm-1.161 17.52h1.833L7.045 4.126H5.078L17.044 19.77Z"/>
                              </svg>
                      </div>
                            <span className="text-xs text-gray-600">X</span>
                    </button>
                          
                          {/* Facebook */}
                          <button 
                            className="flex flex-col items-center space-y-2"
                            onClick={() => {
                              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank');
                              setShowProfileShare(false);
                            }}
                          >
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"/>
                        </svg>
                      </div>
                            <span className="text-xs text-gray-600">Facebook</span>
                    </button>
                          
                          {/* WhatsApp */}
                          <button 
                            className="flex flex-col items-center space-y-2"
                            onClick={() => {
                              window.open(`https://wa.me/?text=${encodeURIComponent(profileUrl)}`, '_blank');
                              setShowProfileShare(false);
                            }}
                          >
                            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                      </div>
                            <span className="text-xs text-gray-600">WhatsApp</span>
                    </button>
                      </div>
                      </div>
                      
                      {/* Cancel Button */}
                      <div className="px-6 pb-6">
                        <button 
                          className="w-full py-3 text-center text-red-600 font-medium rounded-2xl hover:bg-red-50 transition-colors"
                          onClick={() => setShowProfileShare(false)}
                        >
                          Cancel
                    </button>
                      </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {user.links.map((link, index) => {
              const faviconUrl = getFaviconUrl(link.url);

              return link.active && (
                <div key={index} className="flex items-center w-full p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group relative cursor-pointer" onClick={async () => {
                  try {
                    await axios.post(`https://link-tree-backend-theta.vercel.app/api/users/${user.username}/links/${index}/click`);
                        } catch {
                          // Ignore click tracking errors
                        }
                  window.open(link.url, '_blank');
                }}>
                  {faviconUrl && (
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <img
                        src={faviconUrl}
                        alt={link.title}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <span className="flex-grow text-center font-medium text-gray-700 group-hover:text-gray-900">
                    {link.title}
                  </span>
                  <div
                    className="ml-2 flex-shrink-0"
                    onClick={(e) => { 
                      e.stopPropagation();
                      setShowInputIndex(showInputIndex === index ? null : index); 
                      setShowProfileShare(false); 
                      setShowMoreOptions(false); 
                    }}
                  >
                    {threeDotIcon}
                  </div>
                  
                  {/* Link share popup - iOS Style */}
                  {showInputIndex === index && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                      {/* Backdrop */}
                      <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowInputIndex(null)}
                      />
                      
                      {/* Share Sheet */}
                      <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                        
                        {/* Header */}
                        <div className="px-6 pb-4 border-b border-gray-100">
                          <h2 className="text-lg font-semibold text-gray-900 text-center">Share Link</h2>
                      </div>
                        
                        {/* Preview */}
                        <div className="px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                        {faviconUrl ? (
                              <img src={faviconUrl} alt={link.title} className="w-12 h-12 rounded-2xl object-contain bg-gray-50" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                                <span className="text-xl text-gray-500">🔗</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
                              <p className="text-xs text-gray-500 truncate">{link.url}</p>
                            </div>
                          </div>
                      </div>
                        
                        {/* Share Options */}
                        <div className="px-6 py-4">
                          <div className="grid grid-cols-4 gap-4">
                            {/* Copy Link */}
                            <button 
                              className="flex flex-col items-center space-y-2"
                              onClick={() => {
                                navigator.clipboard.writeText(link.url);
                                setShowInputIndex(null);
                              }}
                            >
                              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-600">Copy</span>
                            </button>
                            
                            {/* X (Twitter) */}
                            <button 
                              className="flex flex-col items-center space-y-2"
                              onClick={() => {
                                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(link.url)}`, '_blank');
                                setShowInputIndex(null);
                              }}
                            >
                              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231l5.45-6.231Zm-1.161 17.52h1.833L7.045 4.126H5.078L17.044 19.77Z"/>
                                </svg>
                              </div>
                              <span className="text-xs text-gray-600">X</span>
                            </button>
                            
                            {/* Facebook */}
                            <button 
                              className="flex flex-col items-center space-y-2"
                              onClick={() => {
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link.url)}`, '_blank');
                                setShowInputIndex(null);
                              }}
                            >
                              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02Z"/>
                                </svg>
                              </div>
                              <span className="text-xs text-gray-600">Facebook</span>
                            </button>
                            
                            {/* WhatsApp */}
                            <button 
                              className="flex flex-col items-center space-y-2"
                              onClick={() => {
                                window.open(`https://wa.me/?text=${encodeURIComponent(link.url)}`, '_blank');
                                setShowInputIndex(null);
                              }}
                            >
                              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </div>
                              <span className="text-xs text-gray-600">WhatsApp</span>
                            </button>
                              </div>
                              </div>
                        
                        {/* Cancel Button */}
                        <div className="px-6 pb-6">
                          <button 
                            className="w-full py-3 text-center text-red-600 font-medium rounded-2xl hover:bg-red-50 transition-colors"
                            onClick={() => setShowInputIndex(null)}
                          >
                            Cancel
                            </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
                </div>
              </div>
            </div>
            
            {/* iOS Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Profile as default };