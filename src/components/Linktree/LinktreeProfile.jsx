import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { auth } from '../../firebase'; // Added auth import

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
      container: 'bg-white/10 backdrop-blur-sm'
    },
    linktreeSky: {
      background: 'bg-cover bg-center bg-no-repeat',
      backgroundImage: 'url("https://ugc.production.linktr.ee/m7t0nuNRliLPZIPR8bvL_GEWhBdo8DONe3TCK?io=true&size=background-profile-v1_0")',
      text: 'text-white',
      button: 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105 backdrop-blur-md',
      container: 'bg-white/10 backdrop-blur-sm'
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
    container: 'block w-full p-4 rounded-lg text-center font-medium transition-all shadow-lg hover:shadow-xl',
    icon: 'w-5 h-5 object-contain',
    fallback: 'w-5 h-5 bg-white/20 rounded flex items-center justify-center text-xs'
  },
  rounded: {
    container: 'block w-full p-4 rounded-full text-center font-medium transition-all shadow-lg hover:shadow-xl',
    icon: 'w-5 h-5 object-contain',
    fallback: 'w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs'
  },
  card: {
    container: 'block w-full p-6 rounded-xl text-center font-medium transition-all shadow-lg hover:shadow-xl border border-white/20',
    icon: 'w-6 h-6 object-contain',
    fallback: 'w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-sm'
  },
  minimal: {
    container: 'block w-full p-3 rounded-md text-center font-medium transition-all border-2 border-white/30 hover:border-white/50',
    icon: 'w-4 h-4 object-contain',
    fallback: 'w-4 h-4 bg-white/20 rounded flex items-center justify-center text-xs'
  },
  glass: {
    container: 'block w-full p-4 rounded-lg text-center font-medium transition-all backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20',
    icon: 'w-5 h-5 object-contain',
    fallback: 'w-5 h-5 bg-white/20 rounded flex items-center justify-center text-xs'
  },
  gradient: {
    container: 'block w-full p-4 rounded-lg text-center font-medium transition-all bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 border border-white/20',
    icon: 'w-5 h-5 object-contain',
    fallback: 'w-5 h-5 bg-white/20 rounded flex items-center justify-center text-xs'
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
      console.log('Fetching profile for username:', username);
      
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
            console.log('Usernames data:', usernamesData);
            
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
        console.log('LinkTree data found:', linktreeData);
        console.log('Number of links:', linktreeData.links ? linktreeData.links.length : 0);
        
        // Use the LinkTree data directly
        setUser({
          username: username,
          bio: linktreeData.bio || '',
          avatar: linktreeData.avatar || '',
          theme: linktreeData.theme || 'default',
          links: linktreeData.links || [],
          linkTemplate: linktreeData.linkTemplate || 'default' // Add linkTemplate to user state
        });
      } else {
        console.log('LinkTree document not found for user ID:', userId);
        
        // Try alternative approaches to find the user's data
        // Check if there are any LinkTree documents in the users collection
        console.log('Attempting to find any LinkTree documents for this user...');
        
        // For now, show empty profile but log the issue
        setUser({
          username: username,
          bio: '',
          avatar: '',
          theme: 'default',
          links: [],
          linkTemplate: 'default' // Default to default template if profile not found
        });
        
        console.log('No profile data found. User may need to create their profile first.');
        console.log('To fix this issue:');
        console.log('1. The user should log into their LinkNest dashboard');
        console.log('2. Add some links to their profile');
        console.log('3. Save their profile to create the username mapping');
      }
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Show empty profile on Firebase permission errors or other issues
      if (err.message.includes('permission') || err.message.includes('permissions') || err.message.includes('insufficient')) {
      setUser({
        username: username || 'user',
        bio: '',
        avatar: '',
        theme: 'default',
          links: [],
          linkTemplate: 'default' // Default to default template on error
      });
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
          <p className="text-white/60 text-sm mt-2">Create your own LinkNest profile to share your links!</p>
        </div>
      </div>
    );
  }

  const theme = themes[user.theme || 'default'];
  const linkTemplate = linkTemplates[user.linkTemplate || 'default'];

  return (
    <div 
      className={`min-h-screen ${theme.background} ${theme.text} flex items-center justify-center p-4`}
      style={theme.backgroundImage ? { backgroundImage: theme.backgroundImage } : {}}
    >
      <div className={`${user.backgroundBlur !== false ? theme.container : theme.container.replace(/bg-[^/]+\/[^s]+/, 'bg-transparent').replace('backdrop-blur-md', '')} rounded-2xl p-8 max-w-md w-full`}>
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
          {Array.isArray(user.links) && user.links.length > 0 ? user.links.map((link, index) => {
            const faviconUrl = getFaviconUrl(link.url);

            return link && link.active && link.title && link.url && (
              <a
                key={link._id || index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkTemplate.container} ${theme.button}`}
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
                    {faviconUrl ? (
                      <img 
                        src={faviconUrl} 
                        alt={link.title} 
                        className={linkTemplate.icon}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={linkTemplate.fallback} style={{ display: faviconUrl ? 'none' : 'flex' }}>
                      🔗
                    </div>
                  </div>
                  <span>{link.title || link.platform}</span>
                </div>
              </a>
            );
          }) : (
            <div className="text-center py-8">
              <p className="opacity-75 mb-2">No links available</p>
              <p className="text-sm opacity-50">This user hasn&apos;t added any links yet.</p>
              <p className="text-xs opacity-40 mt-2">If this is your profile, please log in to your LinkNest dashboard to add links.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm opacity-75">Powered by LinkNest</p>
        </div>
      </div>
    </div>
  );
};

export default LinktreeProfile;