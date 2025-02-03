import React, { useState } from 'react';
import axios from 'axios';
import { Back } from './back';
import './styles/LinkChecker.css';

const LinkChecker = () => {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [workingLinks, setWorkingLinks] = useState([]);
  const [nonWorkingLinks, setNonWorkingLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const proxyUrl = 'https://api.allorigins.win/get?url=';

  const fetchLinksFromWebsite = async () => {
    setLoading(true);
    try {
      const response = await axios.get(proxyUrl + encodeURIComponent(url));
      const htmlString = response.data.contents;

      const anchorTags = htmlString.match(/<a[^>]+href=["']([^"']+)["']/g);
      const extractedLinks = anchorTags
        ? anchorTags.map((tag) => {
            const href = tag.match(/href=["']([^"']+)["']/)[1];
            if (href.startsWith('http')) {
              return href;
            } else if (href.startsWith('#')) {
              return url + href;
            } else if (href.startsWith('/')) {
              return new URL(href, url).href;
            } else {
              return new URL(href, url).href;
            }
          })
        : [];

      const uniqueLinks = [...new Set(extractedLinks)];
      setLinks(uniqueLinks);
      await checkLinks(uniqueLinks);
    } catch (error) {
      console.error('Error fetching website:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLinks = async (links) => {
    const working = [];
    const nonWorking = [];

    const alwaysWorkingPatterns = [
      /^https?:\/\/(www\.)?(facebook|youtube|linkedin|instagram|twitter)\.com/,
      /^https?:\/\/api\.whatsapp\.com/,
      /^https?:\/\/firstindiacredit\.com/,
      /^https?:\/\/mail\.google\.com/,
      /^#/
    ];

    for (let link of links) {
      if (alwaysWorkingPatterns.some(pattern => pattern.test(link))) {
        working.push(link);
        continue;
      }

      const urlWithoutFragment = link.split('#')[0];

      try {
        const response = await axios.get(proxyUrl + encodeURIComponent(urlWithoutFragment), {
          timeout: 10000,
          validateStatus: function (status) {
            return status === 200;
          }
        });

        if (response.data.status && response.data.status.http_code >= 200 && response.data.status.http_code < 500) {
          working.push(link);
        } else {
          nonWorking.push(link);
        }
      } catch (error) {
        working.push(link);
      }
    }

    setWorkingLinks(working);
    setNonWorkingLinks(nonWorking);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLinksFromWebsite();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <Back />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Website Link Checker
            </h1>
            <p className="mt-4 text-gray-600">
              Analyze and verify all links on any website
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-xl shadow-lg">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="flex-1 px-6 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-4 rounded-lg font-semibold text-white transition-all transform hover:scale-105 
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg'
                  }`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scanning...
                  </div>
                ) : (
                  'Scan Links'
                )}
              </button>
            </div>
          </form>

          {(workingLinks.length > 0 || nonWorkingLinks.length > 0) && (
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <h2 className="text-xl font-bold text-gray-800">Working Links ({workingLinks.length})</h2>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {workingLinks.length > 0 ? (
                    <ul className="space-y-3">
                      {workingLinks.map((link, index) => (
                        <li key={index} className="group">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg hover:bg-gray-50 transition-all text-green-600 hover:text-green-700 break-all"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No working links found</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <h2 className="text-xl font-bold text-gray-800">Non-Working Links ({nonWorkingLinks.length})</h2>
                </div>
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {nonWorkingLinks.length > 0 ? (
                    <ul className="space-y-3">
                      {nonWorkingLinks.map((link, index) => (
                        <li
                          key={index}
                          className="p-3 rounded-lg bg-red-50 text-red-600 break-all"
                        >
                          {link}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No broken links found</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkChecker;
