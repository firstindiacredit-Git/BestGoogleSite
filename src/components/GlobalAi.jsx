import { useState } from 'react';
import './GlobalAi.css';

const GlobalAi = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Chat functionality
  const [activeMode, setActiveMode] = useState('image'); // 'image' or 'chat'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null);

  const API_KEY = '159abbb7-3568-48f4-a666-18c640a4e9e1';

  // Initialize chat session when switching to chat mode
  const initializeChatSession = async () => {
    try {
      // For DeepSeek chat completion API, we don't need to create a session first
      // We can directly send messages to the completion endpoint
      setChatSessionId('ready'); // Mark as ready to use
    } catch (err) {
      console.error('Error initializing chat:', err);
      // Fallback to mock responses if API fails
    }
  };

  const generateImageFromText = async (text) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY
        },
        body: JSON.stringify({
          text: text,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.output_url) {
        setGeneratedImage(data.output_url);
      } else {
        throw new Error('No image URL received from API');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image');
      console.error('Error generating image:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateImageFromFile = async (file) => {
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('text', file);

      const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
          'api-key': API_KEY
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.output_url) {
        setGeneratedImage(data.output_url);
      } else {
        throw new Error('No image URL received from API');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image from file');
      console.error('Error generating image from file:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      let aiResponse;
      
      if (chatSessionId) {
        // Use DeepSeek API
        aiResponse = await sendMessageToDeepSeek(message);
      } else {
        // Fallback to mock response
        aiResponse = await generateAIResponse();
      }
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setTimeout(() => {
        setChatMessages(prev => [...prev, aiMessage]);
        setChatLoading(false);
      }, 500);

    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setChatLoading(false);
    }
  };

  const sendMessageToDeepSeek = async (message) => {
    try {
      const response = await fetch('https://chat.deepseek.com/api/v0/chat/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://chat.deepseek.com/',
          'Origin': 'https://chat.deepseek.com'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the response from the API
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      } else if (data.response) {
        return data.response;
      } else {
        return 'I received your message but couldn&apos;t process it properly.';
      }
    } catch (err) {
      console.error('DeepSeek API error:', err);
      throw err;
    }
  };

  const generateAIResponse = async () => {
    // Mock AI responses - fallback when API is not available
    const responses = [
      "That&apos;s an interesting question! I&apos;d be happy to help you with that.",
      "I understand what you're asking. Let me think about the best way to approach this.",
      "Great question! Here&apos;s what I can tell you about that topic.",
      "I appreciate you asking that. Let me provide you with some insights.",
      "That&apos;s a fascinating topic! Here&apos;s my perspective on it.",
      "I&apos;m glad you brought that up. Let me share some thoughts with you.",
      "Excellent question! Here&apos;s what I know about that subject.",
      "I find that really interesting. Let me elaborate on that for you.",
      "That&apos;s a great point! Here&apos;s what I think about it.",
      "I&apos;m happy to discuss that with you. Here&apos;s my take on it."
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      generateImageFromText(prompt);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      generateImageFromFile(file);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
    }
  };

  const handleModeChange = (mode) => {
    setActiveMode(mode);
    if (mode === 'chat' && !chatSessionId) {
      initializeChatSession();
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = 'generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearResults = () => {
    setGeneratedImage(null);
    setError('');
    setPrompt('');
    setSelectedFile(null);
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatSessionId(null);
    if (activeMode === 'chat') {
      initializeChatSession();
    }
  };

  return (
    <div className="global-ai-container">
      <div className="global-ai-header">
        <h1>Global AI Assistant</h1>
        <p>Transform your ideas into images and chat with AI using advanced technology</p>
      </div>

      <div className="mode-selector">
        <button 
          className={`mode-btn ${activeMode === 'image' ? 'active' : ''}`}
          onClick={() => handleModeChange('image')}
        >
          🎨 Image Generator
        </button>
        <button 
          className={`mode-btn ${activeMode === 'chat' ? 'active' : ''}`}
          onClick={() => handleModeChange('chat')}
        >
          💬 AI Chat
        </button>
      </div>

      {activeMode === 'image' ? (
        <div className="global-ai-content">
          <div className="input-section">
            <div className="input-tabs">
              <button 
                className={`tab ${!selectedFile ? 'active' : ''}`}
                onClick={() => setSelectedFile(null)}
              >
                Text Input
              </button>
              <button 
                className={`tab ${selectedFile ? 'active' : ''}`}
                onClick={() => document.getElementById('fileInput').click()}
              >
                File Upload
              </button>
            </div>

            {!selectedFile ? (
              <form onSubmit={handleTextSubmit} className="text-input-form">
                <div className="input-group">
                  <label htmlFor="prompt">Describe the image you want to generate:</label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A beautiful sunset over mountains with a lake in the foreground..."
                    rows="4"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="generate-btn"
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? 'Generating...' : 'Generate Image'}
                </button>
              </form>
            ) : (
              <div className="file-input-section">
                <input
                  id="fileInput"
                  type="file"
                  accept=".txt,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div className="file-info">
                  <p>Selected file: {selectedFile?.name}</p>
                  <button 
                    onClick={() => document.getElementById('fileInput').click()}
                    className="change-file-btn"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="results-section">
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Generating your image...</p>
              </div>
            )}

            {error && (
              <div className="error-container">
                <p className="error-message">Error: {error}</p>
                <button onClick={clearResults} className="clear-btn">
                  Try Again
                </button>
              </div>
            )}

            {generatedImage && !loading && (
              <div className="image-result">
                <h3>Generated Image</h3>
                <div className="image-container">
                  <img 
                    src={generatedImage} 
                    alt="AI Generated" 
                    className="generated-image"
                  />
                </div>
                <div className="image-actions">
                  <button onClick={handleDownload} className="download-btn">
                    Download Image
                  </button>
                  <button onClick={clearResults} className="clear-btn">
                    Generate New Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h2>AI Chat Assistant</h2>
            <div className="chat-status">
              {chatSessionId ? (
                <span className="status-connected">🟢 Connected</span>
              ) : (
                <span className="status-connecting">🟡 Connecting...</span>
              )}
            </div>
            <button onClick={clearChat} className="clear-chat-btn">
              Clear Chat
            </button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-chat-icon">💬</div>
                <h3>Start a conversation</h3>
                <p>Ask me anything! I&apos;m here to help with your questions and ideas.</p>
                {!chatSessionId && (
                  <p className="connection-note">Connecting to AI service...</p>
                )}
              </div>
            ) : (
              chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`chat-message ${message.sender} ${message.isError ? 'error' : ''}`}
                >
                  <div className="message-content">
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">{message.timestamp}</div>
                  </div>
                </div>
              ))
            )}
            
            {chatLoading && (
              <div className="chat-message ai">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleChatSubmit} className="chat-input-form">
            <div className="chat-input-container">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message here..."
                disabled={chatLoading}
                className="chat-input"
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={chatLoading || !chatInput.trim()}
              >
                {chatLoading ? '⏳' : '➤'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Text to Image</h3>
            <p>Convert your creative descriptions into stunning visual artwork</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>AI Chat</h3>
            <p>Have intelligent conversations with our advanced AI assistant</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>File Upload</h3>
            <p>Upload text files to generate images from your content</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Smart</h3>
            <p>Get instant responses and AI-generated images in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAi;