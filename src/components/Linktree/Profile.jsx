import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import PropTypes from 'prop-types';

const Profile = ({ username, onBackToDashboard }) => {
  const [user, setUser] = useState({
    username: '',
    bio: '',
    avatar: '',
    theme: 'default',
    linkTemplate: 'default',
    links: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileShare, setShowProfileShare] = useState(false);
  const [showInputIndex, setShowInputIndex] = useState(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Theme color logic
  const themes = {
    default: {
      background: 'bg-gradient-to-br from-purple-600 to-blue-500',
      text: 'text-white',
      button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    dark: {
      background: 'bg-gray-900',
      text: 'text-white',
      button: 'bg-gray-800 text-white hover:bg-gray-700 transform hover:scale-105 border border-gray-600',
      container: 'bg-gray-800/50 backdrop-blur-md'
    },
    light: {
      background: 'bg-gray-100',
      text: 'text-gray-900',
      button: 'bg-white text-gray-900 hover:bg-gray-50 transform hover:scale-105 border border-gray-200 shadow-sm',
      container: 'bg-white/80 backdrop-blur-md'
    },
    sunset: {
      background: 'bg-gradient-to-br from-orange-400 to-pink-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    ocean: {
      background: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      text: 'text-white',
      button: 'bg-white text-cyan-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    forest: {
      background: 'bg-gradient-to-br from-green-500 to-emerald-600',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    midnight: {
      background: 'bg-gradient-to-br from-indigo-900 to-purple-900',
      text: 'text-white',
      button: 'bg-indigo-800 text-white hover:bg-indigo-700 transform hover:scale-105 border border-indigo-600',
      container: 'bg-indigo-800/30 backdrop-blur-md'
    },
    rose: {
      background: 'bg-gradient-to-br from-rose-400 to-pink-500',
      text: 'text-white',
      button: 'bg-white text-rose-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    gold: {
      background: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      text: 'text-white',
      button: 'bg-white text-yellow-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    minimal: {
      background: 'bg-white',
      text: 'text-gray-900',
      button: 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-105',
      container: 'bg-gray-50 border border-gray-200'
    },
    // New themes inspired by Linktree
    linktree: {
      background: 'bg-gradient-to-br from-green-400 to-green-600',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    coral: {
      background: 'bg-gradient-to-br from-red-400 to-pink-500',
      text: 'text-white',
      button: 'bg-white text-red-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    lavender: {
      background: 'bg-gradient-to-br from-purple-400 to-indigo-500',
      text: 'text-white',
      button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    sky: {
      background: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      text: 'text-white',
      button: 'bg-white text-blue-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    sunset2: {
      background: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    aurora: {
      background: 'bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500',
      text: 'text-white',
      button: 'bg-white text-teal-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    berry: {
      background: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500',
      text: 'text-white',
      button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    earth: {
      background: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600',
      text: 'text-white',
      button: 'bg-white text-amber-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    ocean2: {
      background: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600',
      text: 'text-white',
      button: 'bg-white text-blue-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    spring: {
      background: 'bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    // iPhone Wallpaper Inspired Themes
    iphonePurple: {
      background: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500',
      text: 'text-white',
      button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    iphoneBlue: {
      background: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
      text: 'text-white',
      button: 'bg-white text-blue-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    iphoneGreen: {
      background: 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    iphoneOrange: {
      background: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    iphonePink: {
      background: 'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-500',
      text: 'text-white',
      button: 'bg-white text-pink-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    // Live Wallpaper Inspired Themes
    galaxyLive: {
      background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
      text: 'text-white',
      button: 'bg-white text-indigo-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    oceanLive: {
      background: 'bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-700',
      text: 'text-white',
      button: 'bg-white text-blue-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    sunsetLive: {
      background: 'bg-gradient-to-br from-yellow-500 via-orange-500 via-red-500 to-pink-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    forestLive: {
      background: 'bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    auroraLive: {
      background: 'bg-gradient-to-br from-teal-400 via-cyan-400 via-blue-500 to-indigo-500',
      text: 'text-white',
      button: 'bg-white text-teal-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    // Abstract Wallpaper Themes
    geometric: {
      background: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600',
      text: 'text-white',
      button: 'bg-white text-gray-800 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    neon: {
      background: 'bg-gradient-to-br from-cyan-400 via-pink-400 to-purple-400',
      text: 'text-white',
      button: 'bg-white text-cyan-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    holographic: {
      background: 'bg-gradient-to-br from-indigo-400 via-purple-400 via-pink-400 to-orange-400',
      text: 'text-white',
      button: 'bg-white text-indigo-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    metallic: {
      background: 'bg-gradient-to-br from-gray-400 via-gray-300 to-gray-200',
      text: 'text-gray-900',
      button: 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-105',
      container: 'bg-white/20 backdrop-blur-md'
    },
    // Nature Wallpaper Themes
    mountain: {
      background: 'bg-gradient-to-br from-gray-600 via-gray-500 to-blue-400',
      text: 'text-white',
      button: 'bg-white text-gray-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    desert: {
      background: 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400',
      text: 'text-white',
      button: 'bg-white text-yellow-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    tropical: {
      background: 'bg-gradient-to-br from-green-400 via-blue-400 to-cyan-400',
      text: 'text-white',
      button: 'bg-white text-green-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    arctic: {
      background: 'bg-gradient-to-br from-blue-200 via-cyan-200 to-white',
      text: 'text-gray-800',
      button: 'bg-gray-800 text-white hover:bg-gray-700 transform hover:scale-105',
      container: 'bg-white/30 backdrop-blur-md'
    },
    // Modern Wallpaper Themes
    glassmorphism: {
      background: 'bg-gradient-to-br from-white/20 via-white/10 to-transparent',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: 'bg-white/10 backdrop-blur-md'
    },
    gradientMesh: {
      background: 'bg-gradient-to-br from-purple-400 via-pink-400 via-yellow-400 to-orange-400',
      text: 'text-white',
      button: 'bg-white text-purple-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    darkMode: {
      background: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
      text: 'text-white',
      button: 'bg-gray-700 text-white hover:bg-gray-600 transform hover:scale-105',
      container: 'bg-gray-800/50 backdrop-blur-md'
    },
    lightMode: {
      background: 'bg-gradient-to-br from-gray-100 via-white to-gray-50',
      text: 'text-gray-900',
      button: 'bg-gray-900 text-white hover:bg-gray-800 transform hover:scale-105',
      container: 'bg-white/80 backdrop-blur-md'
    },
    // Linktree Official Background Inspired Theme
    linktreeOfficial: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://ugc.production.linktr.ee/AXotfmrhQq2bOhoy2bjv_00GnVL9m9h5xunYr?io=true&size=background-profile-v1_0")',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    // Additional Linktree-Inspired Wallpaper Themes
    linktreeWarm: {
      background: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeSunset: {
      background: 'bg-gradient-to-br from-pink-400 via-rose-500 to-purple-500',
      text: 'text-white',
      button: 'bg-white text-pink-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeVibrant: {
      background: 'bg-gradient-to-br from-orange-500 via-pink-500 via-purple-500 to-indigo-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeSoft: {
      background: 'bg-gradient-to-br from-orange-300 via-pink-400 to-purple-500',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeBold: {
      background: 'bg-gradient-to-br from-orange-600 via-pink-600 to-purple-700',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeModern: {
      background: 'bg-gradient-to-br from-orange-400 via-pink-500 via-purple-600 to-indigo-600',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeElegant: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://ugc.production.linktr.ee/AXotfmrhQq2bOhoy2bjv_00GnVL9m9h5xunYr?io=true&size=background-profile-v1_0")',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeDynamic: {
      background: 'bg-gradient-to-br from-yellow-400 via-orange-500 via-pink-500 to-purple-600',
      text: 'text-white',
      button: 'bg-white text-orange-600 hover:bg-opacity-90 transform hover:scale-105',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeSky: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://ugc.production.linktr.ee/m7t0nuNRliLPZIPR8bvL_GEWhBdo8DONe3TCK?io=true&size=background-profile-v1_0")',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: 'bg-white/10 backdrop-blur-md'
    },
    linktreeSky2: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://e1.pxfuel.com/desktop-wallpaper/619/423/desktop-wallpaper-best-aesthetic-for-ios-14-black-white-gold-neon-red-blue-pink-orange-green-purple-and-more-aesthetic-black-and-grey-iphone.jpg")',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: ''
    },
    linktreeSky3: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://e1.pxfuel.com/desktop-wallpaper/72/256/desktop-wallpaper-purple-geometric-purple-and-grey-geometric.jpg")',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: ''
    }
  };

  // Link design templates
  const linkTemplates = {
    default: {
      container: 'flex items-center w-full p-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group relative cursor-pointer',
      icon: 'w-6 h-6 object-contain',
      fallback: 'w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500'
    },
    rounded: {
      container: 'flex items-center w-full p-4 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group relative cursor-pointer',
      icon: 'w-6 h-6 object-contain',
      fallback: 'w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500'
    },
    card: {
      container: 'flex items-center w-full p-6 rounded-xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group relative cursor-pointer',
      icon: 'w-8 h-8 object-contain',
      fallback: 'w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-500'
    },
    minimal: {
      container: 'flex items-center w-full p-3 rounded-md bg-white border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 group relative cursor-pointer',
      icon: 'w-5 h-5 object-contain',
      fallback: 'w-5 h-5 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500'
    },
    glass: {
      container: 'flex items-center w-full p-4 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 hover:bg-white/90 transition-all duration-300 group relative cursor-pointer',
      icon: 'w-6 h-6 object-contain',
      fallback: 'w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs text-gray-500'
    },
    gradient: {
      container: 'flex items-center w-full p-4 rounded-xl bg-gradient-to-r from-white/90 to-white/70 border border-white/20 hover:from-white/95 hover:to-white/85 transition-all duration-300 group relative cursor-pointer',
      icon: 'w-6 h-6 object-contain',
      fallback: 'w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs text-gray-500'
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    console.log('Profile component received username:', username);
    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    
    try {
      // Since we're likely getting the user's UID as username, try to get the LinkTree document directly first
      let userId = username;
      let linktreeDocRef = doc(db, 'users', userId, 'LinkTree', 'profile');
      console.log('Trying to fetch LinkTree document with ID:', userId);
      let linktreeDoc = await getDoc(linktreeDocRef);
      console.log('LinkTree document exists:', linktreeDoc.exists());
      
      // If direct lookup fails, try username mapping
      if (!linktreeDoc.exists()) {
        console.log('LinkTree document not found, trying username mapping for:', username);
        try {
          const usernamesLinktreeDocRef = doc(db, 'usernames', 'LinkTree');
          const usernamesLinktreeDoc = await getDoc(usernamesLinktreeDocRef);
          console.log('Usernames LinkTree document exists:', usernamesLinktreeDoc.exists());
          
          if (usernamesLinktreeDoc.exists()) {
            const usernamesData = usernamesLinktreeDoc.data();
            if (usernamesData[username]) {
              userId = usernamesData[username].uid;
              console.log('Found user ID from username mapping:', userId);
              linktreeDocRef = doc(db, 'users', userId, 'LinkTree', 'profile');
              linktreeDoc = await getDoc(linktreeDocRef);
              console.log('LinkTree document exists after username mapping:', linktreeDoc.exists());
            }
          }
        } catch (usernameError) {
          console.error('Error accessing username mapping:', usernameError);
          console.log('This is likely a permissions issue. Please update Firebase security rules.');
        }
      }
      
      // If still no document found, try to get current user's data directly
      if (!linktreeDoc.exists()) {
        try {
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.uid !== userId) {
            
            const currentUserLinktreeDocRef = doc(db, 'users', currentUser.uid, 'LinkTree', 'profile');
            const currentUserLinktreeDoc = await getDoc(currentUserLinktreeDocRef);
           
            
            if (currentUserLinktreeDoc.exists()) {
              linktreeDoc = currentUserLinktreeDoc;
              userId = currentUser.uid;
              console.log('Found data using current user UID');
            }
          }
        } catch (fallbackError) {
          console.error('Error accessing current user data:', fallbackError);
        }
      }
      
      if (linktreeDoc.exists()) {
        const linktreeData = linktreeDoc.data();
      
        
        // Use the LinkTree data directly
        const profileData = {
          username: username,
          bio: linktreeData.bio || '',
          avatar: linktreeData.avatar || '',
          theme: linktreeData.theme || 'default',
          linkTemplate: linktreeData.linkTemplate || 'default',
          links: linktreeData.links || []
        };
       
        console.log('Number of links found:', profileData.links.length);
        setUser(profileData);
      } else {
        // User document doesn't exist - show empty profile
        const emptyProfile = {
          username: username,
          bio: '',
          avatar: '',
          theme: 'default',
          linkTemplate: 'default',
          links: []
        };
        console.log('User document not found, showing empty profile for username:', username);
        setUser(emptyProfile);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Show empty profile on Firebase permission errors or other issues
      if (err.message.includes('permission') || err.message.includes('permissions') || err.message.includes('insufficient')) {
        const emptyProfile = {
          username: username,
          bio: '',
          avatar: '',
          theme: 'default',
          linkTemplate: 'default',
          links: []
        };
        setUser(emptyProfile);
      } else {
        setError('Profile not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      // Try multiple favicon sources for better compatibility
      const hostname = urlObject.hostname;
      const protocol = urlObject.protocol;
      
      // Return Google's favicon service as it's more reliable
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  };

  const trackLinkClick = async (username, linkIndex) => {
    try {
      // Use the same logic as fetchProfile for consistency
      let userId = username;
      let linktreeDocRef = doc(db, 'users', userId, 'LinkTree', 'profile');
      let linktreeDoc = await getDoc(linktreeDocRef);
      
      // If direct lookup fails, try username mapping
      if (!linktreeDoc.exists()) {
        try {
          const usernamesLinktreeDocRef = doc(db, 'usernames', 'LinkTree');
          const usernamesLinktreeDoc = await getDoc(usernamesLinktreeDocRef);
          
          if (usernamesLinktreeDoc.exists()) {
            const usernamesData = usernamesLinktreeDoc.data();
            if (usernamesData[username]) {
              userId = usernamesData[username].uid;
              linktreeDocRef = doc(db, 'users', userId, 'LinkTree', 'profile');
            }
          }
        } catch (usernameError) {
          console.error('Error accessing username mapping in trackLinkClick:', usernameError);
        }
      }

      // Use the new click tracking collection for public access
      const clickTrackingRef = doc(db, 'clickTracking', userId);
      await setDoc(clickTrackingRef, {
        [`links.${linkIndex}.clicks`]: increment(1),
        [`links.${linkIndex}.lastClicked`]: new Date()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error tracking link click:', error);
      // Don't throw error, just log it - this prevents the app from breaking
      // due to permission issues
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
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
  const linkTemplate = linkTemplates[user.linkTemplate || 'default'];

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
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      {/* iPhone 16 Frame */}
      <div className="relative mx-auto w-[280px] sm:w-[320px]">
        {/* iPhone Body */}
        <div className="relative bg-black rounded-[45px] p-2 shadow-2xl">
          {/* iPhone Screen */}
          <div 
            className={`w-full h-[600px] rounded-[38px] flex flex-col items-center relative overflow-hidden ${theme.background}`}
            style={theme.backgroundImage ? { backgroundImage: theme.backgroundImage } : {}}
          >
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
              
              <div className={`rounded-2xl p-6 ${user.backgroundBlur !== false ? theme.container : theme.container.replace(/bg-[^/]+\/[^s]+/, 'bg-transparent').replace('backdrop-blur-md', '')} transition-all duration-300 relative flex-1`}>
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
            {Array.isArray(user.links) && user.links.length > 0 ? user.links.map((link, index) => {
              const faviconUrl = getFaviconUrl(link.url);

              return link && link.active && link.title && link.url && (
                <div key={index} className={`${linkTemplate.container} transition-all duration-300 group relative cursor-pointer`} onClick={async () => {
                  try {
                    await trackLinkClick(user.username, index);
                        } catch {
                          // Ignore click tracking errors
                        }
                  window.open(link.url, '_blank');
                }}>
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    {faviconUrl ? (
                      <img
                        src={faviconUrl}
                        alt={link.title}
                        className={linkTemplate.icon}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className={linkTemplate.fallback} style={{ display: faviconUrl ? 'none' : 'flex' }}>
                      🔗
                    </div>
                  </div>
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
                              }) : (
                <div className="text-center text-white/80 py-8">
                  <p>No links available.</p>
                  <p className="text-sm">This user hasn&apos;t added any links yet.</p>
                </div>
              )}
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

Profile.propTypes = {
  username: PropTypes.string.isRequired,
  onBackToDashboard: PropTypes.func
};

export { Profile as default };