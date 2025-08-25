import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';

const Dashboard = ({ user: propUser, onLogout, onViewProfile }) => {
  const { user: authUser, logout: authLogout } = useAuth();
  const user = propUser || authUser;
  const logout = onLogout || authLogout;
  const [profile, setProfile] = useState({
    bio: '',
    avatar: '',
    theme: 'default',
    links: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newLink, setNewLink] = useState({
    platform: '',
    url: ''
  });
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [editLinkData, setEditLinkData] = useState({ title: '', url: '' });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);

  // Theme color logic (copied from Profile.jsx)
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/users/me/profile');
      
      setProfile({
        bio: res.data.bio || '',
        avatar: res.data.avatar || '',
        theme: res.data.theme || 'default',
        links: res.data.links || []
      });
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback to default profile if API fails
      setProfile({
        bio: 'Welcome to my LinkNest page!',
        avatar: '',
        theme: 'default',
        links: []
      });
      setError('Failed to load profile from server, using default');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleNewLinkChange = (field, value) => {
    setNewLink(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const addLink = async () => {
    if (!newLink.platform || !newLink.url) {
      setError('Please enter both platform name and URL');
      return;
    }

    // Validate URL format
    try {
      new URL(newLink.url);
    } catch (err) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

    const newLinkEntry = {
      title: newLink.platform,
      url: newLink.url,
      active: true
    };

      // Create a new array with the new link
      const updatedLinks = [...profile.links, newLinkEntry];

      // Send only the links array to update
      const response = await axios.post('/users/update', {
        links: updatedLinks
      });

      // Update the profile with the response data
    setProfile(prev => ({
      ...prev,
        links: response.data.links
    }));
    
      // Clear the form
    setNewLink({ platform: '', url: '' });
      setSuccess('Link added successfully!');
    } catch (err) {
      console.error('Error adding link:', err);
      setError('Failed to add link: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const removeLink = async (index) => {
    try {
      setLoading(true);
    setError('');
    setSuccess('');

      // Create a new array without the link to be removed
      const updatedLinks = profile.links.filter((_, i) => i !== index);

      // Send only the links array to update
      const response = await axios.post('/users/update', {
        links: updatedLinks
      });

      // Update the profile with the response data
      setProfile(prev => ({
        ...prev,
        links: response.data.links
      }));

      setSuccess('Link removed successfully!');
    } catch (err) {
      console.error('Error removing link:', err);
      setError('Failed to remove link: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const invalidLinks = profile.links.filter(link => !link.title || !link.url);
      if (invalidLinks.length > 0) {
        throw new Error('All links must have both platform name and URL');
      }

      const response = await axios.post('/users/update', {
        bio: profile.bio,
        theme: profile.theme,
        links: profile.links
      });

      // Update the profile state with the response data
      setProfile(prev => ({
        ...prev,
        bio: response.data.bio,
        theme: response.data.theme,
        links: response.data.links
      }));

      setSuccess('Profile saved successfully!');
      setShowUpdateModal(false);
    } catch (err) {
      setError('Failed to save profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const getFaviconUrl = (url) => {
    try {
      const urlObject = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObject.hostname}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  // In the right-side profile preview, use the selected theme
  const theme = themes[profile.theme || 'default'];

  const handleEditLink = (index) => {
    const link = profile.links[index];
    setEditingLink(index);
    setEditLinkData({ title: link.title, url: link.url });
  };

  const handleEditLinkChange = (field, value) => {
    setEditLinkData(prev => ({ ...prev, [field]: value }));
  };

  const saveEditLink = async () => {
    if (!editLinkData.title || !editLinkData.url) {
      setError('Please enter both platform name and URL');
      return;
    }

    // Validate URL format
    try {
      new URL(editLinkData.url);
    } catch (err) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create a new array with the updated link
      const updatedLinks = [...profile.links];
      updatedLinks[editingLink] = {
        ...updatedLinks[editingLink],
        title: editLinkData.title,
        url: editLinkData.url
      };

      // Send only the links array to update
      const response = await axios.post('/users/update', {
        links: updatedLinks
      });

      // Update the profile with the response data
      setProfile(prev => ({
        ...prev,
        links: response.data.links
      }));

      setEditingLink(null);
      setEditLinkData({ title: '', url: '' });
      setSuccess('Link updated successfully!');
    } catch (err) {
      console.error('Error updating link:', err);
      setError('Failed to update link: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setEditLinkData({ title: '', url: '' });
  };

  const toggleLink = async (index) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Create a new array with the toggled link
      const updatedLinks = [...profile.links];
      updatedLinks[index] = {
        ...updatedLinks[index],
        active: !updatedLinks[index].active
      };

      // Send only the links array to update
      const response = await axios.post('/users/update', {
        links: updatedLinks
      });

      // Update the profile with the response data
      setProfile(prev => ({
        ...prev,
        links: response.data.links
      }));

      setSuccess(`Link ${updatedLinks[index].active ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error toggling link:', err);
      setError('Failed to update link status: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({ ...prev, avatar: response.data.avatar }));
      setSuccess('Avatar updated successfully!');
    } catch (err) {
      setError('Failed to upload avatar: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Helper for public profile URL
  const publicProfileUrl = `${window.location.origin}/${user?.username || 'user'}`;

  // Add this function to handle QR code download
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${user?.username || 'user'}-linktree-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Add this function to handle sharing
  const handleShare = async (platform) => {
    const shareData = {
      title: `${user?.username || 'User'}'s Linktree`,
      text: `Check out my Linktree profile!`,
      url: publicProfileUrl
    };

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.error('Error sharing:', err);
          }
        }
        break;
      default:
        break;
    }
    setShowShareOptions(false);
  };

  // Add this new function for handling social media sharing
  const handleSocialShare = (platform, link) => {
    const shareData = {
      title: link.title,
      text: `Check out my ${link.title} profile!`,
      url: link.url
    };

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${shareData.url}`)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`, '_blank');
        break;
      case 'native':
        if (navigator.share) {
          navigator.share(shareData)
            .catch(err => {
              console.error('Error sharing:', err);
              setError('Failed to share: ' + err.message);
            });
        }
        break;
      default:
        break;
    }
    setShowSharePopup(false);
  };

  // Debug logging
  console.log('Dashboard render:', { user, loading, profile });

  // Show loading if user is not available yet
  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
          <p className="text-white text-sm mt-2">User: {user ? 'Available' : 'Not available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Main Content without header */}
      <div className="pt-0">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 lg:py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-24">
            {/* Left Column - Social Links */}
            <div className="lg:col-span-2">
              {/* Linktree Live Box */}
              <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-2xl px-4 sm:px-6 py-4 gap-4 sm:gap-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl">🔥</span>
                  <span className="font-semibold text-gray-700">Your Linktree is live:</span>
                  <a
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 w-[ch] max-w-[15ch] truncate underline text-blue-700 hover:text-blue-900"
                  >
                    {publicProfileUrl}
                  </a>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="flex-1 sm:flex-none bg-white font-semibold px-4 sm:px-6 py-2 rounded-full shadow hover:bg-gray-100 transition border border-gray-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v2m0 5h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-gray-600">QR Code</span> 
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publicProfileUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="flex-1 sm:flex-none bg-white text-gray-600 font-semibold px-4 sm:px-6 py-2 rounded-full shadow hover:bg-gray-100 transition border border-gray-200"
                  >
                    {copied ? 'Copied!' : 'Copy URL'}
                  </button>
                   <button
                     onClick={() => onViewProfile()}
                     className="flex-1 sm:flex-none bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 sm:px-3 py-2 rounded-full shadow hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                     title="View Profile"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                     </svg>
                     <span>Profile</span>
                   </button>
                
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow border border-gray-100">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Social Links
                  </h2>
                  <span className="text-sm text-gray-500">{profile.links.length} links</span>
                </div>

                {/* Add New Link Form */}
                <div className="mb-6 sm:mb-8 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-100">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Add New Link</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
                      <input
                        type="text"
                        value={newLink.platform}
                        onChange={(e) => handleNewLinkChange('platform', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        placeholder="e.g., YouTube, Instagram, Twitter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Platform URL</label>
                      <input
                        type="text"
                        value={newLink.url}
                        onChange={(e) => handleNewLinkChange('url', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        placeholder="https://www.example.com/"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addLink}
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    Add Social Link
                  </button>
                </div>

                {/* Links List */}
                <div className="space-y-4">
                  {profile.links && profile.links.length > 0 ? (
                    profile.links.map((link, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="p-3 sm:p-4 flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              {editingLink === idx ? (
                                <div className="space-y-3 w-full">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                    <input
                                      type="text"
                                      value={editLinkData.title}
                                      onChange={(e) => handleEditLinkChange('title', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                                      placeholder="Enter platform name"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform URL</label>
                                    <input
                                      type="text"
                                      value={editLinkData.url}
                                      onChange={(e) => handleEditLinkChange('url', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                                      placeholder="Enter platform URL"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={saveEditLink}
                                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{link.title}</span>
                                    <button 
                                      onClick={() => handleEditLink(idx)}
                                      className="text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </button>
                                  </div>
                                  <span className="text-sm text-gray-500 break-all">{link.url}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => toggleLink(idx)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                link.active ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`${
                                link.active ? 'translate-x-5' : 'translate-x-0'
                              } inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out`}></span>
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-gray-50 rounded-b-xl">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3h6m-6 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedLink(link);
                                setShowSharePopup(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => removeLink(idx)}
                              className="p-1.5 text-red-400 hover:text-red-600 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-300"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-sm text-gray-500">{link.clicks || 0} clicks</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <svg className="w-12 sm:w-16 h-12 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-gray-500">No links added yet. Add your first social link above!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Fixed Profile Preview */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                {/* iPhone Frame */}
                <div className="relative mx-auto w-[280px] sm:w-[320px]">
                  {/* iPhone Body */}
                  <div className="relative bg-black rounded-[45px] p-2 shadow-2xl">
                    {/* iPhone Screen */}
                    <div
                      className={`w-full h-[600px] rounded-[38px] flex flex-col items-center relative overflow-hidden ${theme.background} custom-scrollbar`}
                    >
                      {/* iPhone Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-10"></div>
                      
                      {/* Status Bar */}
                      <div className="absolute top-2 left-0 right-0 flex justify-between items-center px-8 z-20">
                        <div className="flex items-center space-x-1">
                          <span className="text-white text-xs font-semibold">9:41</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {/* Battery Indicator */}
                          <div className="flex space-x-0.5">
                            <div className="w-1 h-3 bg-white rounded-sm"></div>
                            <div className="w-1 h-3 bg-white rounded-sm"></div>
                            <div className="w-1 h-3 bg-white rounded-sm"></div>
                            <div className="w-1 h-3 bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>

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

                      {/* Content Area */}
                      <div className="w-full h-full flex flex-col items-center pt-16 pb-8 px-4">
                  {/* Avatar */}
                        <div className="mt-4 mb-4 relative">
                    <div 
                            className="w-20 h-20 rounded-full border-3 border-white mx-auto flex items-center justify-center overflow-hidden shadow-lg cursor-pointer group relative"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {profile.avatar ? (
                        <>
                          <img
                            src={profile.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <span className="text-white text-xs font-medium">Change Photo</span>
                          </div>
                        </>
                      ) : (
                              <span className="text-gray-400 text-3xl">?</span>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {uploadingAvatar && (
                      <div className="mt-2 text-center">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                        <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Username */}
                        <h1 className={`text-lg font-bold mb-1 ${theme.text}`}>@{user.username}</h1>
                  
                  {/* Bio */}
                        <p className={`text-sm mb-6 text-center text-gray-600 px-4 ${theme.text}`}>{profile.bio || 'No bio provided.'}</p>

                  {/* Links */}
                        <div className="w-full flex flex-col gap-3 items-center py-2 px-3 pb-6">
                    {profile.links && profile.links.length > 0 ? (
                      profile.links
                        .filter(link => link.active)
                        .map((link, idx) => (
                          <div 
                            key={idx} 
                                  className="w-full flex items-center bg-white/90 backdrop-blur-sm rounded-[20px] shadow-lg p-3 px-4 transition-all duration-300 group hover:shadow-xl hover:bg-white/95"
                          >
                            {getFaviconUrl(link.url) ? (
                              <img
                                src={getFaviconUrl(link.url)}
                                alt={link.title}
                                      className="w-6 h-6 rounded-full object-contain mr-3"
                                onError={e => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                              </div>
                            )}
                                  <span className="flex-1 text-[#222] font-medium text-sm truncate">
                              {link.title}
                            </span>
                                  <span className="ml-2 text-gray-400 text-xl font-bold select-none group-hover:text-gray-600 transition-colors">&#8230;</span>
                          </div>
                        ))
                    ) : (
                            <div className="text-gray-400 text-center py-6">
                              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <p>No links added yet.</p>
                      </div>
                    )}
                        </div>

                        {/* Home Indicator */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Update Profile
              </h2>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Avatar Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-20 h-20 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profile.avatar ? (
                      <>
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-xs font-medium">Change</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {profile.avatar ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    {uploadingAvatar && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={profile.theme}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="w-[80%] sm:w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Your Linktree QR Code
              </h2>
              <button
                onClick={() => setShowQRModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={publicProfileUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-medium hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR Code
                  </button>
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>

                {showShareOptions && (
                  <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-xl">
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span className="text-xs mt-2 text-gray-900">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-xs mt-2 text-gray-900">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-xs mt-2 text-gray-900">LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      <span className="text-xs mt-2 text-gray-900">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.306.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                      <span className="text-xs mt-2 text-gray-900">Telegram</span>
                    </button>
                    {navigator.share && (
                      <button
                        onClick={() => handleShare('native')}
                        className="flex flex-col items-center justify-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-xs mt-2 text-gray-900">More</span>
                      </button>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add this new Share Popup component */}
      {showSharePopup && selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Share {selectedLink.title}
              </h2>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleSocialShare('twitter', selectedLink)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <svg className="w-8 h-8 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span className="text-xs mt-2">Twitter</span>
              </button>
              <button
                onClick={() => handleSocialShare('facebook', selectedLink)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <svg className="w-8 h-8 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs mt-2">Facebook</span>
              </button>
              <button
                onClick={() => handleSocialShare('linkedin', selectedLink)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <svg className="w-8 h-8 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs mt-2">LinkedIn</span>
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp', selectedLink)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <svg className="w-8 h-8 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-xs mt-2">WhatsApp</span>
              </button>
              <button
                onClick={() => handleSocialShare('telegram', selectedLink)}
                className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <svg className="w-8 h-8 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.306.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                <span className="text-xs mt-2">Telegram</span>
              </button>
              {navigator.share && (
                <button
                  onClick={() => handleSocialShare('native', selectedLink)}
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-xs mt-2">More</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Dashboard.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func,
  onViewProfile: PropTypes.func
};

export default Dashboard; 