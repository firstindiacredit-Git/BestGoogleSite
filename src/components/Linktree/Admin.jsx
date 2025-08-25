import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUser();
  }, [username]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`https://link-tree-backend-theta.vercel.app/api/users/${username}`);
      setUser(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user profile');
      setUser({ username, bio: '', avatar: '', links: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
    </div>
  );

  const handleChange = (index, field, value) => {
    const links = [...user.links];
    links[index][field] = value;
    setUser({ ...user, links });
    setSuccess('');
  };

  const addLink = () => {
    setUser({ ...user, links: [...user.links, { title: '', url: '' }] });
    setSuccess('');
  };

  const saveProfile = async () => {
    try {
      await axios.post(`https://link-tree-backend-theta.vercel.app/api/users/update/${username}`, user);
      setSuccess('Profile saved successfully!');
      setError('');
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Profile: @{username}</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Bio</label>
              <textarea
                placeholder="Tell us about yourself..."
                value={user.bio}
                onChange={e => setUser({ ...user, bio: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Avatar URL</label>
              <input
                placeholder="https://example.com/avatar.jpg"
                value={user.avatar}
                onChange={e => setUser({ ...user, avatar: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Links</h2>
                <button
                  onClick={addLink}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Add Link
                </button>
              </div>

              <div className="space-y-4">
                {user.links.map((link, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <input
                      placeholder="Title"
                      value={link.title}
                      onChange={e => handleChange(i, 'title', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                    />
                    <input
                      placeholder="URL"
                      value={link.url}
                      onChange={e => handleChange(i, 'url', e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveProfile}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
