import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const GlobalAi = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Chat functionality
  const [activeMode, setActiveMode] = useState('chat'); // 'image' or 'chat'
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Sidebar and chat management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState('gpt-5'); // 'gpt-5', 'gpt-4', 'dall-e', 'gemini', 'lamda', etc.
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [pollinationsStatus, setPollinationsStatus] = useState('unknown'); // 'unknown', 'available', 'unavailable'

  const OPENAI_API_KEY = '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';
  const DEEPSEEK_API_KEY = 'sk-bdc38f3a81c94ca8a0ecacf93d584618';
  const OPENROUTER_API_KEY = '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';
  const OPENROUTER_API_KEY_2 = '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';
  const GROQ_API_KEY = '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';
  
  // API Configuration for different models
  const API_CONFIGS = {
    groq: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "x-ai/grok-code-fast-1",
      name: "Grok Code",
      free: true
    },
    grok4: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "x-ai/grok-code-fast-1",
      name: "Grok 4",
      free: true
    },
    grok3: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "x-ai/grok-code-fast-1",
      name: "Grok 3",
      free: true
    },
    grok3mini: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "x-ai/grok-code-fast-1",
      name: "Grok 3 Mini",
      free: true
    },
    grok2vision: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "x-ai/grok-code-fast-1",
      name: "Grok 2 Vision",
      free: true
    },
    claude: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-sonnet",
      name: "Claude",
      free: true
    },
    claudeOpus41: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-opus",
      name: "Claude Opus 4.1",
      free: true
    },
    claudeSonnet4: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-sonnet",
      name: "Claude Sonnet 4",
      free: true
    },
    claudeOpus4: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-sonnet",
      name: "Claude Opus 4",
      free: true
    },
    claude37Sonnet: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-sonnet",
      name: "Claude 3.7 Sonnet",
      free: true
    },
    claude35Haiku: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "anthropic/claude-3.5-haiku",
      name: "Claude 3.5 Haiku",
      free: true
    },
    deepseek: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "deepseek/deepseek-r1-0528-qwen3-8b",
      name: "DeepSeek",
      free: true
    },
    deepseekR1: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "deepseek/deepseek-r1-0528-qwen3-8b",
      name: "DeepSeek R1",
      free: true
    },
    deepseekV30324: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "deepseek/deepseek-r1-0528-qwen3-8b",
      name: "DeepSeek V3 0324",
      free: true
    },
    deepseekProverV2: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "deepseek/deepseek-r1-0528-qwen3-8b",
      name: "DeepSeek Prover V2",
      free: true
    },
    phi4: {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: "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",
      model: "microsoft/phi-4",
      name: "Microsoft Phi-4",
      free: true
    },
    pixverse: {
      url: "https://app-api.pixverse.ai/openapi/v2/video/text/generate",
      key: "sk-32b1993927f5ca2bf141919883430143",
      model: "v5",
      name: "Pixverse AI",
      free: true
    }
  };
  const UNSTABILITY_API_KEY = 'your-unstability-api-key-here'; // Add your Unstability AI API key here
  const STABILITY_API_KEY = 'sk-VEhwXBAlRr8kwBtqUj5dNI0sVDaNcVGhv2SosAgOYflmhIG3'; // Stability AI API key

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('globalAiChatHistory');
    if (savedChatHistory) {
      try {
        const parsedHistory = JSON.parse(savedChatHistory);
        setChatHistory(parsedHistory);
        if (parsedHistory.length > 0) {
          setCurrentChatId(parsedHistory[0].id);
          setChatMessages(parsedHistory[0].messages);
          setSelectedVersion(parsedHistory[0].version || 'gpt-5');
        } else {
          createNewChat();
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // Check Pollinations API status on component mount
  useEffect(() => {
    const checkPollinationsStatus = async () => {
      try {
        const isAvailable = await testPollinationsAPI();
        setPollinationsStatus(isAvailable ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Error checking Pollinations status:', error);
        setPollinationsStatus('unavailable');
      }
    };
    
    checkPollinationsStatus();
    
    // Retry status check every 5 minutes
    const interval = setInterval(checkPollinationsStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('globalAiChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Auto-resize textarea when input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [chatInput]);

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      version: selectedVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setChatMessages([]);
    setChatInput('');
  };

  const selectChat = (chatId) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setChatMessages(chat.messages);
      setSelectedVersion(chat.version);
    }
  };

  const updateChatTitle = (chatId, title) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, title, updatedAt: new Date().toISOString() }
          : chat
      )
    );
  };

  const deleteChat = (chatId) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChatId === chatId) {
      if (chatHistory.length > 1) {
        const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
        selectChat(remainingChats[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const saveCurrentChat = () => {
    if (currentChatId && chatMessages.length > 0) {
      const title = chatMessages[0]?.text?.slice(0, 50) + '...' || 'New Chat';
      
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { 
                ...chat, 
                title,
                messages: chatMessages,
                version: selectedVersion,
                updatedAt: new Date().toISOString()
              }
            : chat
        )
      );
    }
  };

  // Check if message is for image generation
  const isImageGenerationRequest = (message) => {
    const trimmedMessage = message.trim().toLowerCase();
    return (
      trimmedMessage.startsWith("/imagine") ||
      trimmedMessage.startsWith("/image") ||
      trimmedMessage.startsWith("@image")
    );
  };

  // Remove the command prefix from the message
  const sanitizeImagePrompt = (message) => {
    const trimmedMessage = message.trim();
    if (trimmedMessage.toLowerCase().startsWith("/imagine")) {
      return trimmedMessage.substring("/imagine".length).trim();
    } else if (trimmedMessage.toLowerCase().startsWith("/image")) {
      return trimmedMessage.substring("/image".length).trim();
    } else if (trimmedMessage.toLowerCase().startsWith("@image")) {
      return trimmedMessage.substring("@image".length).trim();
    }
    return message;
  };

  const generateImageFromText = async (text) => {
    try {
      setLoading(true);
      setError('');
      
      // Use OpenAI API for image generation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: text,
          n: 1,
          size: "1024x1024"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedImage(data.data[0].url);
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
      
      // Read file content
      const text = await file.text();
      
      // Use OpenAI API for image generation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: text,
          n: 1,
          size: "1024x1024"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        setGeneratedImage(data.data[0].url);
      } else {
        throw new Error('No image  URL received from API');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate image from file');
      console.error('Error generating image from file:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateGeminiResponse = async (message) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyCdUfYEBIhbt8eCcwp-thTgl8kNmVITbhA', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful AI assistant. Provide clear, accurate, and helpful responses. Use markdown formatting when appropriate. User message: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          }
        })
    });
    
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.text) {
        return data.text;
      } else if (data.response) {
        return data.response;
      } else if (data.content && data.content.parts && data.content.parts.length > 0) {
        return data.content.parts[0].text;
      } else {
        console.error('Unexpected Gemini API response structure:', data);
        throw new Error('No valid response from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  };

  const generateLamdaResponse = async (message) => {
    try {
      const response = await fetch('https://www.gstatic.com/lamda/images/', {
           method: 'POST',
           headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          context: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses. Use markdown formatting when appropriate.",
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`LaMDA API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        return data.response;
      } else if (data.text) {
        return data.text;
      } else {
        throw new Error('No response from LaMDA API');
      }
    } catch (error) {
      console.error('LaMDA API error:', error);
      throw error;
    }
  };

    const generateDeepSeekResponse = async (message, modelKey = 'deepseek') => {
    try {
      const config = API_CONFIGS[modelKey] || API_CONFIGS.deepseek;
      
      const response = await fetch(config.url, {
           method: 'POST',
           headers: {
          'Authorization': `Bearer ${config.key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BestGoogleSite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses. Use markdown formatting when appropriate.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`${config.name} API error details:`, errorData);
        throw new Error(`${config.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error(`Unexpected ${config.name} API response structure:`, data);
        throw new Error(`No valid response from ${config.name} API`);
      }
    } catch (error) {
      console.error(`${modelKey} API error:`, error);
      throw error;
    }
  };

  const generateClaudeResponse = async (message, modelKey = 'claude', imageUrl = null) => {
    try {
      const config = API_CONFIGS[modelKey] || API_CONFIGS.claude;
      
      const messages = [
        {
          role: 'user',
          content: imageUrl ? [
            {
              type: 'text',
              text: message
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ] : message
        }
      ];

      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BestGoogleSite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`${config.name} API error details:`, errorData);
        throw new Error(`${config.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error(`Unexpected ${config.name} API response structure:`, data);
        throw new Error(`No valid response from ${config.name} API`);
      }
    } catch (error) {
      console.error(`${modelKey} API error:`, error);
      throw error;
    }
  };

  // Function to generate response using Microsoft Phi-4 via OpenRouter
  const generatePhi4Response = async (message) => {
    try {
      const config = API_CONFIGS.phi4;
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BestGoogleSite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`${config.name} API error details:`, errorData);
        throw new Error(`${config.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error(`Unexpected ${config.name} API response structure:`, data);
        throw new Error(`No valid response from ${config.name} API`);
      }
    } catch (error) {
      console.error('Phi-4 API error:', error);
      throw error;
    }
  };

  // Function to generate video using Pixverse AI
  const generatePixverseVideo = async (prompt) => {
    try {
      const config = API_CONFIGS.pixverse;
      
      // Generate a unique trace ID
      const traceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'API-KEY': config.key,
          'Ai-trace-id': traceId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aspect_ratio: "16:9",
          duration: 5,
          model: config.model,
          negative_prompt: "low quality, blurry, distorted",
          prompt: prompt,
          quality: "540p",
          seed: Math.floor(Math.random() * 1000000),
          water_mark: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`${config.name} API error details:`, errorData);
        throw new Error(`${config.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.video_url) {
        return { videoUrl: data.data.video_url };
      } else {
        console.error(`Unexpected ${config.name} API response structure:`, data);
        throw new Error(`No valid video URL from ${config.name} API`);
      }
    } catch (error) {
      console.error('Pixverse AI API error:', error);
      throw error;
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

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      // Check if this is an image generation request
      // Each AI model works independently - no automatic fallbacks between models
      const isImageRequest = isImageGenerationRequest(message);
      
      if (isImageRequest || selectedVersion === 'dall-e') {
        const prompt = isImageRequest ? sanitizeImagePrompt(message) : message;
        
        // Use OpenAI API for image generation
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024"
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate image (${response.status})`);
        }

        const data = await response.json();
        
        if (data.data && data.data[0] && data.data[0].url) {
          const aiMessage = {
            id: Date.now() + 1,
            type: 'image',
            imageUrl: data.data[0].url,
            text: `Generated image based on: "${prompt}"`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString()
          };
          const finalMessages = [...updatedMessages, aiMessage];
          setChatMessages(finalMessages);
          saveCurrentChat();
        } else {
          throw new Error('No image generated');
        }
      } else if (selectedVersion.startsWith('gemini')) {
        // Use Gemini API for text responses
        const responseText = await generateGeminiResponse(message);
        
        const aiMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setChatMessages(finalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'lamda') {
        // Use LaMDA API for text responses
        const lamdaResponseText = await generateLamdaResponse(message);
        
        const lamdaAiMessage = {
          id: Date.now() + 1,
          text: lamdaResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const lamdaFinalMessages = [...updatedMessages, lamdaAiMessage];
        setChatMessages(lamdaFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'deepseek') {
        // Use DeepSeek API for text responses
        const deepseekResponseText = await generateDeepSeekResponse(message);
        
        const deepseekAiMessage = {
          id: Date.now() + 1,
          text: deepseekResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const deepseekFinalMessages = [...updatedMessages, deepseekAiMessage];
        setChatMessages(deepseekFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'deepseekR1') {
        // Use DeepSeek R1 API for text responses
        const deepseekR1ResponseText = await generateDeepSeekResponse(message, 'deepseekR1');
        
        const deepseekR1AiMessage = {
          id: Date.now() + 1,
          text: deepseekR1ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const deepseekR1FinalMessages = [...updatedMessages, deepseekR1AiMessage];
        setChatMessages(deepseekR1FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'deepseekV30324') {
        // Use DeepSeek V3 0324 API for text responses
        const deepseekV30324ResponseText = await generateDeepSeekResponse(message, 'deepseekV30324');
        
        const deepseekV30324AiMessage = {
          id: Date.now() + 1,
          text: deepseekV30324ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const deepseekV30324FinalMessages = [...updatedMessages, deepseekV30324AiMessage];
        setChatMessages(deepseekV30324FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'deepseekProverV2') {
        // Use DeepSeek Prover V2 API for text responses
        const deepseekProverV2ResponseText = await generateDeepSeekResponse(message, 'deepseekProverV2');
        
        const deepseekProverV2AiMessage = {
          id: Date.now() + 1,
          text: deepseekProverV2ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const deepseekProverV2FinalMessages = [...updatedMessages, deepseekProverV2AiMessage];
        setChatMessages(deepseekProverV2FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'phi4') {
        // Use Microsoft Phi-4 API for text responses
        const phi4ResponseText = await generatePhi4Response(message);
        
        const phi4AiMessage = {
          id: Date.now() + 1,
          text: phi4ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const phi4FinalMessages = [...updatedMessages, phi4AiMessage];
        setChatMessages(phi4FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'pixverse') {
        // Use Pixverse AI API for video generation
        try {
          const pixverseVideoResponse = await generatePixverseVideo(message);
          
          const pixverseVideoMessage = {
            id: Date.now() + 1,
            text: `Generated video based on: "${message}"`,
            videoUrl: pixverseVideoResponse.videoUrl,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            type: 'video'
          };
          const pixverseVideoFinalMessages = [...updatedMessages, pixverseVideoMessage];
          setChatMessages(pixverseVideoFinalMessages);
          saveCurrentChat();
        } catch (error) {
          // Handle errors gracefully
          const errorMessage = {
            id: Date.now() + 1,
            text: `⚠️ ${error.message}. You can try using other video generation services instead.`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
          };
          const errorFinalMessages = [...updatedMessages, errorMessage];
          setChatMessages(errorFinalMessages);
          saveCurrentChat();
        }
      } else if (selectedVersion === 'claude') {
        // Use Claude API for text and image responses
        const claudeResponseText = await generateClaudeResponse(message);
        
        const claudeAiMessage = {
          id: Date.now() + 1,
          text: claudeResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claudeFinalMessages = [...updatedMessages, claudeAiMessage];
        setChatMessages(claudeFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'claudeOpus41') {
        // Use Claude Opus 4.1 API for text responses
        const claudeOpus41ResponseText = await generateClaudeResponse(message, 'claudeOpus41');
        
        const claudeOpus41AiMessage = {
          id: Date.now() + 1,
          text: claudeOpus41ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claudeOpus41FinalMessages = [...updatedMessages, claudeOpus41AiMessage];
        setChatMessages(claudeOpus41FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'claudeSonnet4') {
        // Use Claude Sonnet 4 API for text responses
        const claudeSonnet4ResponseText = await generateClaudeResponse(message, 'claudeSonnet4');
        
        const claudeSonnet4AiMessage = {
          id: Date.now() + 1,
          text: claudeSonnet4ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claudeSonnet4FinalMessages = [...updatedMessages, claudeSonnet4AiMessage];
        setChatMessages(claudeSonnet4FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'claudeOpus4') {
        // Use Claude Opus 4 API for text responses
        const claudeOpus4ResponseText = await generateClaudeResponse(message, 'claudeOpus4');
        
        const claudeOpus4AiMessage = {
          id: Date.now() + 1,
          text: claudeOpus4ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claudeOpus4FinalMessages = [...updatedMessages, claudeOpus4AiMessage];
        setChatMessages(claudeOpus4FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'claude37Sonnet') {
        // Use Claude 3.7 Sonnet API for text responses
        const claude37SonnetResponseText = await generateClaudeResponse(message, 'claude37Sonnet');
        
        const claude37SonnetAiMessage = {
          id: Date.now() + 1,
          text: claude37SonnetResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claude37SonnetFinalMessages = [...updatedMessages, claude37SonnetAiMessage];
        setChatMessages(claude37SonnetFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'claude35Haiku') {
        // Use Claude 3.5 Haiku API for text responses
        const claude35HaikuResponseText = await generateClaudeResponse(message, 'claude35Haiku');
        
        const claude35HaikuAiMessage = {
          id: Date.now() + 1,
          text: claude35HaikuResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const claude35HaikuFinalMessages = [...updatedMessages, claude35HaikuAiMessage];
        setChatMessages(claude35HaikuFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'gemini-image') {
        // Use Gemini API for image generation
        const geminiImageResponse = await generateGeminiImage(message);
        
        const geminiImageMessage = {
          id: Date.now() + 1,
          text: `Generated image based on: "${message}"`,
          imageUrl: geminiImageResponse,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
          type: 'image'
        };
        const geminiImageFinalMessages = [...updatedMessages, geminiImageMessage];
        setChatMessages(geminiImageFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'google-static-image') {
        // Use Google Static API for image generation
        try {
          const googleStaticImageResponse = await generateGoogleStaticImage(message);
          
          const googleStaticImageMessage = {
            id: Date.now() + 1,
            text: `Generated image based on: "${message}"`,
            imageUrl: googleStaticImageResponse,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            type: 'image'
          };
          const googleStaticImageFinalMessages = [...updatedMessages, googleStaticImageMessage];
          setChatMessages(googleStaticImageFinalMessages);
          saveCurrentChat();
        } catch (error) {
          // Handle rate limiting and other errors gracefully
          const errorMessage = {
            id: Date.now() + 1,
            text: `⚠️ ${error.message}. You can try using DALL-E or Gemini Image instead.`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
          };
          const errorFinalMessages = [...updatedMessages, errorMessage];
          setChatMessages(errorFinalMessages);
          saveCurrentChat();
        }
      } else if (selectedVersion === 'gemini-flash-image-preview') {
        // Use Gemini 2.5 Flash Image Preview API for image generation
        try {
          const geminiFlashImagePreviewResponse = await generateGeminiFlashImagePreview(message);
          
          const geminiFlashImagePreviewMessage = {
            id: Date.now() + 1,
            text: `Generated image based on: "${message}"`,
            imageUrl: geminiFlashImagePreviewResponse,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            type: 'image'
          };
          const geminiFlashImagePreviewFinalMessages = [...updatedMessages, geminiFlashImagePreviewMessage];
          setChatMessages(geminiFlashImagePreviewFinalMessages);
          saveCurrentChat();
        } catch (error) {
          // Handle rate limiting and other errors gracefully
          const errorMessage = {
            id: Date.now() + 1,
            text: `⚠️ ${error.message}. You can try using DALL-E or Gemini Image instead.`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
          };
          const errorFinalMessages = [...updatedMessages, errorMessage];
          setChatMessages(errorFinalMessages);
          saveCurrentChat();
        }
      } else if (selectedVersion === 'llama') {
        // Use Llama API for text and image responses
        const llamaResponseText = await generateLlamaResponse(message);
        
        const llamaAiMessage = {
          id: Date.now() + 1,
          text: llamaResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const llamaFinalMessages = [...updatedMessages, llamaAiMessage];
        setChatMessages(llamaFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'groq') {
        // Use Grok Code API for text responses
        const groqResponseText = await generateGroqResponse(message);
        
        const groqAiMessage = {
          id: Date.now() + 1,
          text: groqResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const groqFinalMessages = [...updatedMessages, groqAiMessage];
        setChatMessages(groqFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'grok4') {
        // Use Grok 4 API for text responses
        const grok4ResponseText = await generateGrokResponse(message, 'grok4');
        
        const grok4AiMessage = {
          id: Date.now() + 1,
          text: grok4ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const grok4FinalMessages = [...updatedMessages, grok4AiMessage];
        setChatMessages(grok4FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'grok3') {
        // Use Grok 3 API for text responses
        const grok3ResponseText = await generateGrokResponse(message, 'grok3');
        
        const grok3AiMessage = {
          id: Date.now() + 1,
          text: grok3ResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const grok3FinalMessages = [...updatedMessages, grok3AiMessage];
        setChatMessages(grok3FinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'grok3mini') {
        // Use Grok 3 Mini API for text responses
        const grok3MiniResponseText = await generateGrokResponse(message, 'grok3mini');
        
        const grok3MiniAiMessage = {
          id: Date.now() + 1,
          text: grok3MiniResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const grok3MiniFinalMessages = [...updatedMessages, grok3MiniAiMessage];
        setChatMessages(grok3MiniFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'grok2vision') {
        // Use Grok 2 Vision API for text responses
        const grok2VisionResponseText = await generateGrokResponse(message, 'grok2vision');
        
        const grok2VisionAiMessage = {
          id: Date.now() + 1,
          text: grok2VisionResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const grok2VisionFinalMessages = [...updatedMessages, grok2VisionAiMessage];
        setChatMessages(grok2VisionFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'unstability') {
        // Use Unstability AI API for text responses
        const unstabilityResponseText = await generateUnstabilityResponse(message);
        
        const unstabilityAiMessage = {
          id: Date.now() + 1,
          text: unstabilityResponseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const unstabilityFinalMessages = [...updatedMessages, unstabilityAiMessage];
        setChatMessages(unstabilityFinalMessages);
        saveCurrentChat();
      } else if (selectedVersion === 'stability') {
        // Use Stability AI API for image generation
        try {
          const stabilityImageResponse = await generateStabilityImage(message);
          
          const stabilityImageMessage = {
            id: Date.now() + 1,
            text: `Generated image based on: "${message}"`,
            imageUrl: stabilityImageResponse,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            type: 'image'
          };
          const stabilityImageFinalMessages = [...updatedMessages, stabilityImageMessage];
          setChatMessages(stabilityImageFinalMessages);
          saveCurrentChat();
        } catch (error) {
          // Handle errors gracefully
          const errorMessage = {
            id: Date.now() + 1,
            text: `⚠️ ${error.message}. You can try using DALL-E or Pollinations instead.`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true
          };
          const errorFinalMessages = [...updatedMessages, errorMessage];
          setChatMessages(errorFinalMessages);
          saveCurrentChat();
        }
      } else if (selectedVersion === 'pollinations') {
        // Use Pollinations AI API for image generation (FREE & No API Key Required)
        // New API format: https://image.pollinations.ai/prompt/{input}%20image?width=768&height=768&seed=22055&nologo=true&model=turbo
        
        // First, add a loading preview message
        const loadingMessageId = Date.now() + 1;
        
        const loadingMessage = {
          id: loadingMessageId,
          text: `🎨 Generating image with Pollinations Turbo...`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
          type: 'loading',
          isLoading: true
        };
        const loadingMessages = [...updatedMessages, loadingMessage];
        setChatMessages(loadingMessages);
        
        try {
          // Show initial progress
          const updatedMessages = loadingMessages.map(msg => 
            msg.id === loadingMessageId 
              ? { ...msg, text: `🎨 Generating image with Pollinations Turbo...` }
              : msg
          );
          setChatMessages(updatedMessages);
          
          const pollinationsImageResponse = await generatePollinationsImage(message);
          
          // Update the loading message with the final result
          const pollinationsImageMessage = {
            id: loadingMessageId,
            text: `✅ Image Generated Successfully!`,
            imageUrl: pollinationsImageResponse.imageUrl,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            type: 'image',
            isLoading: false
          };
          
          // Replace the loading message with the final result
          const finalMessages = loadingMessages.map(msg => 
            msg.id === loadingMessageId ? pollinationsImageMessage : msg
          );
          setChatMessages(finalMessages);
          saveCurrentChat();
        } catch {
          // Handle Pollinations errors without fallback to other models
          const errorMessage = {
            id: loadingMessageId,
            text: `❌ Image Generation Failed!`,
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            isError: true,
            isLoading: false
          };
          
          // Replace the loading message with the error message
          const errorFinalMessages = loadingMessages.map(msg => 
            msg.id === loadingMessageId ? errorMessage : msg
          );
          setChatMessages(errorFinalMessages);
          saveCurrentChat();
        }
      } else {
        // Use OpenAI API for text responses
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant. Provide clear, accurate, and helpful responses. Use markdown formatting when appropriate."
              },
              {
                role: "user",
                content: message
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get response from AI (${response.status})`);
        }

        const data = await response.json();
        
        const responseText = data.choices?.[0]?.message?.content || 
          "Sorry, I couldn't process that request.";

        const aiMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setChatMessages(finalMessages);
        saveCurrentChat();
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, there was an error processing your request. ${err.message}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      saveCurrentChat();
    } finally {
      setChatLoading(false);
    }
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
    if (currentChatId) {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [] }
            : chat
        )
      );
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Function to speak text using Web Speech API
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Natural') || 
        voice.name.includes('Premium')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to generate image using Gemini API via OpenRouter
  const generateGeminiImage = async (prompt, imageUrl = null) => {
    try {
      const messages = [
        {
          role: 'user',
          content: imageUrl ? [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ] : prompt
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://bestgooglesite.com',
          'X-Title': 'Global AI Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected OpenRouter Gemini API response structure:', data);
        throw new Error('No valid response from OpenRouter Gemini API');
      }
    } catch (error) {
      console.error('OpenRouter Gemini API error:', error);
      throw error;
    }
  };

  // Rate limiting state - use ref to persist across renders
  const lastApiCallRef = useRef(0);
  const API_COOLDOWN = 3000; // 3 seconds between calls

  // Function to generate image using Gemini 2.5 Flash via OpenRouter
  const generateGoogleStaticImage = async (prompt, imageUrl = null) => {
    try {
      const messages = [
        {
          role: 'user',
          content: imageUrl ? [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ] : prompt
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://bestgooglesite.com',
          'X-Title': 'Global AI Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Gemini 2.5 Flash API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected OpenRouter Gemini 2.5 Flash API response structure:', data);
        throw new Error('No valid response from OpenRouter Gemini 2.5 Flash API');
      }
    } catch (error) {
      console.error('OpenRouter Gemini 2.5 Flash API error:', error);
      throw error;
    }
  };

  // Function to generate image using Gemini 2.5 Flash Image Preview via OpenRouter
  const generateGeminiFlashImagePreview = async (prompt, imageUrl = null) => {
    try {
      const messages = [
        {
          role: 'user',
          content: imageUrl ? [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ] : prompt
        }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY_2}`,
          'HTTP-Referer': 'https://bestgooglesite.com',
          'X-Title': 'Global AI Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview:free',
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter Gemini 2.5 Flash Image Preview API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected OpenRouter Gemini 2.5 Flash Image Preview API response structure:', data);
        throw new Error('No valid response from OpenRouter Gemini 2.5 Flash Image Preview API');
      }
    } catch (error) {
      console.error('OpenRouter Gemini 2.5 Flash Image Preview API error:', error);
      throw error;
    }
  };

  // Function to generate response using Grok Code via OpenRouter
  const generateGroqResponse = async (prompt) => {
    try {
      const requestBody = {
        model: API_CONFIGS.groq.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };
      
      console.log('Grok Code API request:', requestBody);
      
      const response = await fetch(API_CONFIGS.groq.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CONFIGS.groq.key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BestGoogleSite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Grok Code API error details:', errorData);
        throw new Error(`Grok Code API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected Grok Code API response structure:', data);
        throw new Error('No valid response from Grok Code API');
      }
    } catch (error) {
      console.error('Grok Code API error:', error);
      throw error;
    }
  };

  // Generic function to generate response using any Grok model via OpenRouter
  const generateGrokResponse = async (prompt, modelKey) => {
    try {
      const config = API_CONFIGS[modelKey];
      if (!config) {
        throw new Error(`Unknown model key: ${modelKey}`);
      }

      const requestBody = {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };
      
      console.log(`${config.name} API request:`, requestBody);
      
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.key}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'BestGoogleSite',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`${config.name} API error details:`, errorData);
        throw new Error(`${config.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error(`Unexpected ${config.name} API response structure:`, data);
        throw new Error(`No valid response from ${config.name} API`);
      }
    } catch (error) {
      console.error(`${modelKey} API error:`, error);
      throw error;
    }
  };

  // Function to generate response using Llama via Groq
  const generateLlamaResponse = async (prompt, imageUrl = null) => {
    try {
      const messages = [
        {
          role: 'user',
          content: imageUrl ? [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ] : prompt
        }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: messages,
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })
      });

      if (!response.ok) {
        throw new Error(`Groq Llama API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content;
      } else {
        console.error('Unexpected Groq Llama API response structure:', data);
        throw new Error('No valid response from Groq Llama API');
      }
    } catch (error) {
      console.error('Groq Llama API error:', error);
      throw error;
    }
  };

  // Function to generate response using Unstability AI
  const generateUnstabilityResponse = async (message) => {
    try {
      const response = await fetch('https://www.unstability.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${UNSTABILITY_API_KEY}`,
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: JSON.stringify({
          prompt: message,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Unstability AI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response) {
        return data.response;
      } else if (data.text) {
        return data.text;
      } else if (data.content) {
        return data.content;
      } else {
        console.error('Unexpected Unstability AI API response structure:', data);
        throw new Error('No valid response from Unstability AI API');
      }
    } catch (error) {
      console.error('Unstability AI API error:', error);
      throw error;
    }
  };

  // Function to download image
  const downloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ai-generated-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // Function to download video
  const downloadVideo = async (videoUrl, filename) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ai-generated-video.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video. Please try again.');
    }
  };

  // Function to render a message with markdown support
  const renderMessage = (message) => {
    if (message.sender === "user") {
      // User messages are displayed as plain text
      return (
        <div className="dark:text-white text-sm leading-6">
          {message.text}
        </div>
      );
    } else if (message.type === "image") {
      // Render image response with download button
      return (
        <div>
          <p className="mb-3 text-gray-300 text-sm">{message.text}</p>
          <div className="relative group">
            <img 
              src={message.imageUrl} 
              alt="Generated by AI" 
              className="w-full max-w-md rounded-lg shadow-lg"
            />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
              <button
                onClick={() => downloadImage(message.imageUrl, `ai-image-${Date.now()}.png`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 backdrop-blur-sm bg-opacity-90"
                title="Download image"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4h14v-2H5v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    } else if (message.type === "video") {
      // Render video response with download button
      return (
        <div>
          <p className="mb-3 text-gray-300 text-sm">{message.text}</p>
          <div className="relative group">
            <video 
              src={message.videoUrl} 
              controls
              className="w-full max-w-md rounded-lg shadow-lg"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
              <button
                onClick={() => downloadVideo(message.videoUrl, `ai-video-${Date.now()}.mp4`)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 backdrop-blur-sm bg-opacity-90"
                title="Download video"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm-7 4h14v-2H5v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      );
    } else if (message.type === "loading") {
      // Render loading message with spinner
      return (
        <div>
          <p className="mb-3 text-gray-300 text-sm">{message.text}</p>
          <div className="relative">
            <div className="w-full max-w-md h-64 bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Generating content...</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // AI messages support markdown with improved styling and speaker button
      return (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => speakText(message.text)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
              title="Speak this response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
          <div className="text-gray-900 text-base leading-7 font-normal">
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // Style code blocks
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <div className="relative group my-4">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          copyToClipboard(String(children).replace(/\n$/, ""))
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        title="Copy code"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-200 rounded-lg p-4 overflow-x-auto my-2 text-sm font-mono">
                      <code
                        className={match ? `language-${match[1]}` : ""}
                        {...props}
                      >
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code
                    className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Style headings
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium mt-5 mb-2 text-gray-900">
                  {children}
                </h3>
              ),
              // Improve list styling
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-4 space-y-2 text-gray-800">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-800">{children}</ol>
              ),
              // Add space between list items
              li: ({ children }) => (
                <li className="mb-2 leading-6">{children}</li>
              ),
              // Improve paragraph spacing
              p: ({ children }) => (
                <p className="mb-4 text-gray-800 leading-7">{children}</p>
              ),
              // Style links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {children}
                </a>
              ),
              // Style blockquotes
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-700">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
        </div>
      );
    }
  };

  // Function to test Pollinations API status
  const testPollinationsAPI = async () => {
    try {
      const testUrl = 'https://image.pollinations.ai/prompt/test%20image?width=768&height=768&seed=123&nologo=true&model=turbo';
      
      // Try HEAD request first
      try {
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // This might help with CORS issues
        });
        return true; // If HEAD request succeeds, assume API is available
      } catch (headError) {
        console.log('HEAD request failed, trying GET request...');
      }
      
      // Fallback to GET request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(testUrl, { 
          method: 'GET',
          signal: controller.signal,
          mode: 'no-cors'
        });
        clearTimeout(timeoutId);
        return true;
      } catch (getError) {
        clearTimeout(timeoutId);
        if (getError.name === 'AbortError') {
          console.error('Pollinations API test timed out');
        } else {
          console.error('Pollinations API test failed:', getError);
        }
        return false;
      }
    } catch (error) {
      console.error('Pollinations API test failed:', error);
      return false;
    }
  };

  // Function to generate image using Pollinations AI (FREE & No API Key Required)
  // Uses the new API format: https://image.pollinations.ai/prompt/{input}%20image?width=768&height=768&seed=22055&nologo=true&model=turbo
  // Users can trigger this by:
  // 1. Selecting Pollinations from the AI model dropdown
  // 2. Using commands like /imagine, /image, or @image followed by their prompt
  // 3. The system automatically adds "image" to the prompt and uses the turbo model
  const generatePollinationsImage = async (prompt) => {
    // Try multiple approaches if one fails
    const approaches = [
      () => generatePollinationsImageWithTurbo(prompt),
      () => generatePollinationsImageSimple(prompt)
    ];
    
    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying approach ${i + 1}...`);
        return await approaches[i]();
      } catch (error) {
        console.log(`Approach ${i + 1} failed:`, error.message);
        if (i === approaches.length - 1) {
          throw error;
        }
      }
    }
  };

  // Main approach with turbo model
  const generatePollinationsImageWithTurbo = async (prompt) => {
    try {
      // Clean and sanitize the prompt - allow more characters for better prompts
      // Remove special characters that might cause issues in URLs
      const cleanPrompt = prompt.trim()
        .replace(/[^\w\s\-.,!?()&%$#@]/g, '') // Remove problematic characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .substring(0, 150); // Limit length
      
      // Try multiple seeds if one fails
      const seeds = [Math.floor(Math.random() * 1000000), Math.floor(Math.random() * 1000000), Math.floor(Math.random() * 1000000)];
      
      for (let i = 0; i < seeds.length; i++) {
        try {
          console.log(`Trying seed ${seeds[i]} with turbo model...`);
          
          // Use the new API format with turbo model and nologo=true
          const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}%20image?width=768&height=768&seed=${seeds[i]}&nologo=true&model=turbo`;
          
          // Test if image loads with timeout
          const result = await new Promise((resolve, reject) => {
            const img = new Image();
            const startTime = Date.now();
            
            const timeout = setTimeout(() => {
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              reject(new Error(`Image load timeout after ${elapsed} seconds`));
            }, 30000); // 30 second timeout for Pollinations API
            
            img.onload = () => {
              clearTimeout(timeout);
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              console.log(`Image loaded successfully in ${elapsed} seconds with seed ${seeds[i]}`);
              resolve({ imageUrl, apiUrl: imageUrl, seed: seeds[i] });
            };
            img.onerror = () => {
              clearTimeout(timeout);
              const elapsed = Math.round((Date.now() - startTime) / 1000);
              console.log(`Image failed to load after ${elapsed} seconds with seed ${seeds[i]}`);
              // Check if it's a 500 error specifically
              if (imageUrl.includes('500')) {
                reject(new Error('Server error (500) - Pollinations AI service is experiencing issues'));
              } else {
                reject(new Error('Failed to generate image'));
              }
            };
            img.src = imageUrl;
          });
          
          return result;
        } catch (seedError) {
          console.log(`Seed ${seeds[i]} failed:`, seedError.message);
          if (i === seeds.length - 1) {
            // Test API status before giving up
            const apiStatus = await testPollinationsAPI();
            if (!apiStatus) {
              throw new Error('Pollinations AI service is currently unavailable. Please try again later or use a different AI service.');
            } else {
              throw new Error(`All attempts to generate image failed. Last error: ${seedError.message}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Pollinations API error:', error);
      throw error;
    }
  };

  // Simple fallback approach without turbo model
  const generatePollinationsImageSimple = async (prompt) => {
    try {
      // Clean and sanitize the prompt
      const cleanPrompt = prompt.trim()
        .replace(/[^\w\s\-.,!?()&%$#@]/g, '')
        .replace(/\s+/g, ' ')
        .substring(0, 100);
      
      // Try multiple seeds
      const seeds = [Math.floor(Math.random() * 1000000), Math.floor(Math.random() * 1000000)];
      
      for (let i = 0; i < seeds.length; i++) {
        try {
          // Use simpler URL format without turbo model
          const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}%20image?width=768&height=768&seed=${seeds[i]}&nologo=true`;
          
          // Test if image loads with timeout
          const result = await new Promise((resolve, reject) => {
            const img = new Image();
            const timeout = setTimeout(() => {
              reject(new Error('Image load timeout (30 seconds)'));
            }, 30000); // 30 second timeout for Pollinations API
            
            img.onload = () => {
              clearTimeout(timeout);
              resolve({ imageUrl, apiUrl: imageUrl, seed: seeds[i] });
            };
            img.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to generate image'));
            };
            img.src = imageUrl;
          });
          
          return result;
        } catch (seedError) {
          console.log(`Simple approach seed ${seeds[i]} failed:`, seedError.message);
          if (i === seeds.length - 1) {
            throw new Error('Simple approach also failed');
          }
        }
      }
    } catch (error) {
      console.error('Simple Pollinations API error:', error);
      throw error;
    }
  };

  // Function to generate image using Stability AI (Stable Diffusion)
  const generateStabilityImage = async (prompt) => {
    try {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30
        })
      });

      if (!response.ok) {
        throw new Error(`Stability AI API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.artifacts && data.artifacts.length > 0) {
        // Convert base64 to blob URL
        const base64Data = data.artifacts[0].base64;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        return URL.createObjectURL(blob);
      } else {
        throw new Error('No image generated from Stability AI');
      }
    } catch (error) {
      console.error('Stability AI API error:', error);
      throw error;
    }
  };

      return (  
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                   {selectedVersion.startsWith('gemini') ? (
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                       selectedVersion === 'gemini-2.5-pro' ? 'bg-blue-600' :
                       selectedVersion === 'gemini-thinking' ? 'bg-blue-400' : 'bg-blue-500'
                     }`}>
                       <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                       </svg>
                     </div>
                   ) : selectedVersion === 'dall-e' ? (
                     <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                     </div>
                   ) : selectedVersion === 'lamda' ? (
                     <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                   ) : selectedVersion === 'deepseek' ? (
                     <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                       </svg>
                     </div>
                   ) : selectedVersion === 'claude' ? (
                     <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                       </svg>
                     </div>
                   ) : selectedVersion === 'llama' ? (
                     <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                       </svg>
                     </div>
                   ) : selectedVersion === 'unstability' ? (
                     <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                       </svg>
                     </div>
                   ) : (
                     <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                       <svg className="w-5 h-5 rotate-90 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                       </svg>
                     </div>
                   )}
                   <h1 className="text-xl font-semibold text-gray-900">
                     {selectedVersion === 'dall-e' ? 'DALL-E' : 
                      selectedVersion === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                      selectedVersion === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                      selectedVersion === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' :
                      selectedVersion === 'gemini-thinking' ? 'Gemini Thinking' :
                      selectedVersion === 'gemini-image' ? 'Gemini 2.5 Flash' :
                      selectedVersion === 'google-static-image' ? 'Gemini 2.5 Flash Image' :
                      selectedVersion === 'gemini-flash-image-preview' ? 'Gemini Flash Image Preview' :
                      selectedVersion === 'lamda' ? 'LaMDA' :
                      selectedVersion === 'deepseek' ? 'DeepSeek' :
                     selectedVersion === 'deepseekR1' ? 'DeepSeek R1' :
                     selectedVersion === 'deepseekV30324' ? 'DeepSeek V3 0324' :
                     selectedVersion === 'deepseekProverV2' ? 'DeepSeek Prover V2' :
                     selectedVersion === 'phi4' ? 'Microsoft Phi-4' :
                     selectedVersion === 'pixverse' ? 'Pixverse AI' :
                      selectedVersion === 'claude' ? 'Claude' :
                     selectedVersion === 'claudeOpus41' ? 'Claude Opus 4.1' :
                     selectedVersion === 'claudeSonnet4' ? 'Claude Sonnet 4' :
                     selectedVersion === 'claudeOpus4' ? 'Claude Opus 4' :
                     selectedVersion === 'claude37Sonnet' ? 'Claude 3.7 Sonnet' :
                     selectedVersion === 'claude35Haiku' ? 'Claude 3.5 Haiku' :
                      selectedVersion === 'llama' ? 'Llama' :
                      selectedVersion === 'unstability' ? 'Unstability AI' :
                      selectedVersion.startsWith('gemini') ? 'Gemini' : selectedVersion.toUpperCase()}
                   </h1>
                 </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button> */}
            <button 
              onClick={createNewChat}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              New Chat
            </button>
            <button 
              onClick={clearChat}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container with Sidebar */}
      <div className="flex h-[calc(100vh-80px)] relative">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden h-full">
          <div className="flex flex-col h-full overflow-y-auto">
            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-200">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>

            {/* Version Selector */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Models</h3>
              <div className="space-y-2">
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-5' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-5')}
                >
                      <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                      </div>
                  <span className="text-sm font-medium">GPT-5</span>
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">New</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-5-mini' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-5-mini')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  
                  <span className="text-sm font-medium">GPT-5 mini</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-5-nano' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-5-nano')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-5 nano</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4.1' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4.1')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4.1</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4.1-mini' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4.1-mini')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4.1 mini</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4.1-nano' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4.1-nano')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4.1 nano</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4o' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4o')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4o</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4o-mini' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4o-mini')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4o mini</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4o-mini-search' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4o-mini-search')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4o-mini Search Preview</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gpt-4o-search' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gpt-4o-search')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">GPT-4o Search Preview</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'dall-e' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('dall-e')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon-lg"><path d="M11.2475 18.25C10.6975 18.25 10.175 18.1455 9.67999 17.9365C9.18499 17.7275 8.74499 17.436 8.35999 17.062C7.94199 17.205 7.50749 17.2765 7.05649 17.2765C6.31949 17.2765 5.63749 17.095 5.01049 16.732C4.38349 16.369 3.87749 15.874 3.49249 15.247C3.11849 14.62 2.93149 13.9215 2.93149 13.1515C2.93149 12.8325 2.97549 12.486 3.06349 12.112C2.62349 11.705 2.28249 11.2375 2.04049 10.7095C1.79849 10.1705 1.67749 9.6095 1.67749 9.0265C1.67749 8.4325 1.80399 7.8605 2.05699 7.3105C2.30999 6.7605 2.66199 6.2875 3.11299 5.8915C3.57499 5.4845 4.10849 5.204 4.71349 5.05C4.83449 4.423 5.08749 3.862 5.47249 3.367C5.86849 2.861 6.35249 2.465 6.92449 2.179C7.49649 1.893 8.10699 1.75 8.75599 1.75C9.30599 1.75 9.82849 1.8545 10.3235 2.0635C10.8185 2.2725 11.2585 2.564 11.6435 2.938C12.0615 2.795 12.496 2.7235 12.947 2.7235C13.684 2.7235 14.366 2.905 14.993 3.268C15.62 3.631 16.1205 4.126 16.4945 4.753C16.8795 5.38 17.072 6.0785 17.072 6.8485C17.072 7.1675 17.028 7.514 16.94 7.888C17.38 8.295 17.721 8.768 17.963 9.307C18.205 9.835 18.326 10.3905 18.326 10.9735C18.326 11.5675 18.1995 12.1395 17.9465 12.6895C17.6935 13.2395 17.336 13.718 16.874 14.125C16.423 14.521 15.895 14.796 15.29 14.95C15.169 15.577 14.9105 16.138 14.5145 16.633C14.1295 17.139 13.651 17.535 13.079 17.821C12.507 18.107 11.8965 18.25 11.2475 18.25ZM7.17199 16.1875C7.72199 16.1875 8.20049 16.072 8.60749 15.841L11.7095 14.059C11.8195 13.982 11.8745 13.8775 11.8745 13.7455V12.3265L7.88149 14.62C7.63949 14.763 7.39749 14.763 7.15549 14.62L4.03699 12.8215C4.03699 12.8545 4.03149 12.893 4.02049 12.937C4.02049 12.981 4.02049 13.047 4.02049 13.135C4.02049 13.696 4.15249 14.213 4.41649 14.686C4.69149 15.148 5.07099 15.511 5.55499 15.775C6.03899 16.05 6.57799 16.1875 7.17199 16.1875ZM7.33699 13.498C7.40299 13.531 7.46349 13.5475 7.51849 13.5475C7.57349 13.5475 7.62849 13.531 7.68349 13.498L8.92099 12.7885L4.94449 10.4785C4.70249 10.3355 4.58149 10.121 4.58149 9.835V6.2545C4.03149 6.4965 3.59149 6.8705 3.26149 7.3765C2.93149 7.8715 2.76649 8.4215 2.76649 9.0265C2.76649 9.5655 2.90399 10.0825 3.17899 10.5775C3.45399 11.0725 3.81149 11.4465 4.25149 11.6995L7.33699 13.498ZM11.2475 17.161C11.8305 17.161 12.3585 17.029 12.8315 16.765C13.3045 16.501 13.6785 16.138 13.9535 15.676C14.2285 15.214 14.366 14.697 14.366 14.125V10.561C14.366 10.429 14.311 10.33 14.201 10.264L12.947 9.538V14.1415C12.947 14.4275 12.826 14.642 12.584 14.785L9.46549 16.5835C10.0045 16.9685 10.5985 17.161 11.2475 17.161ZM11.8745 11.122V8.878L10.01 7.822L8.12899 8.878V11.122L10.01 12.178L11.8745 11.122ZM7.05649 5.8585C7.05649 5.5725 7.17749 5.358 7.41949 5.215L10.538 3.4165C9.99899 3.0315 9.40499 2.839 8.75599 2.839C8.17299 2.839 7.64499 2.971 7.17199 3.235C6.69899 3.499 6.32499 3.862 6.04999 4.324C5.78599 4.786 5.65399 5.303 5.65399 5.875V9.4225C5.65399 9.5545 5.70899 9.659 5.81899 9.736L7.05649 10.462V5.8585ZM15.4385 13.7455C15.9885 13.5035 16.423 13.1295 16.742 12.6235C17.072 12.1175 17.237 11.5675 17.237 10.9735C17.237 10.4345 17.0995 9.9175 16.8245 9.4225C16.5495 8.9275 16.192 8.5535 15.752 8.3005L12.6665 6.5185C12.6005 6.4745 12.54 6.458 12.485 6.469C12.43 6.469 12.375 6.4855 12.32 6.5185L11.0825 7.2115L15.0755 9.538C15.1965 9.604 15.2845 9.692 15.3395 9.802C15.4055 9.901 15.4385 10.022 15.4385 10.165V13.7455ZM12.122 5.3635C12.364 5.2095 12.606 5.2095 12.848 5.3635L15.983 7.195C15.983 7.118 15.983 7.019 15.983 6.898C15.983 6.37 15.851 5.8695 15.587 5.3965C15.334 4.9125 14.9655 4.5275 14.4815 4.2415C14.0085 3.9555 13.4585 3.8125 12.8315 3.8125C12.2815 3.8125 11.803 3.928 11.396 4.159L8.29399 5.941C8.18399 6.018 8.12899 6.1225 8.12899 6.2545V7.6735L12.122 5.3635Z"></path></svg>
                  </div>
                  <span className="text-sm font-medium">DALL-E</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-2.5-pro' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-2.5-pro')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini 2.5 Pro</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-2.5-flash' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-2.5-flash')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini 2.5 Flash</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-2.0-flash' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-2.0-flash')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini 2.0 Flash</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-thinking' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-thinking')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini Thinking</span>
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Experimental</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-image' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-image')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini 2.5 Flash</span>
                 
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'google-static-image' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('google-static-image')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini 2.5 Flash Image</span>
                 
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'gemini-flash-image-preview' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('gemini-flash-image-preview')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="" />
                  </div>
                  <span className="text-sm font-medium">Gemini Flash Image Preview</span>
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Free</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'deepseek' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('deepseek')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4225.png" alt=""/>
                  </div>
                  <span className="text-sm font-medium">DeepSeek</span>
                  
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'deepseekR1' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('deepseekR1')}
                >
                <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4225.png" alt=""/>
                  </div>
                  <span className="text-sm font-medium">DeepSeek R1</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Fast</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'deepseekV30324' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('deepseekV30324')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4225.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">DeepSeek V3 0324</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Stable</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'deepseekProverV2' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('deepseekProverV2')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4225.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">DeepSeek Prover V2</span>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Pro</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'phi4' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('phi4')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                   <img src="https://static.glbgpt.com/logo2/4367.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Microsoft Phi-4</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Fast</span>
                </button>
                {/* <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'pixverse' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('pixverse')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Pixverse AI</span>
                  <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Video</span>
                </button> */}
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claude' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claude')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude</span>
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">New</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claudeOpus41' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claudeOpus41')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude Opus 4.1</span>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Latest</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claudeSonnet4' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claudeSonnet4')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude Sonnet 4</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Stable</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claudeOpus4' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claudeOpus4')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude Opus 4</span>
                  <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Pro</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claude37Sonnet' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claude37Sonnet')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude 3.7 Sonnet</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Fast</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'claude35Haiku' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('claude35Haiku')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4336.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Claude 3.5 Haiku</span>
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Light</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'llama' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('llama')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4331.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Llama</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Groq</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'groq' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('groq')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4222.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Grok Code</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Fast</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'grok4' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('grok4')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4222.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Grok 4</span>
                 
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'grok3' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('grok3')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4222.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Grok 3</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Stable</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'grok3mini' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('grok3mini')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4222.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Grok 3 Mini</span>
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Light</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'grok2vision' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('grok2vision')}
                >
                 <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <img src="https://static.glbgpt.com/logo2/4222.png" alt="" />
                  </div>
                  <span className="text-sm font-medium">Grok 2 Vision</span>
                  <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded">Vision</span>
                </button>
                {/* <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'unstability' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('unstability')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Unstability AI</span>
                  <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded">New</span>
                </button> */}
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'stability' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('stability')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <span className="text-sm font-medium bg-green-500 text-white px-2.5 py-1 rounded-full">S</span>
                     </div>
                  <span className="text-sm font-medium">Stability AI</span>
                  <span className="ml-auto text-xs  bg-green-100 text-green-600 px-2 py-1 rounded">Premium</span>
                </button>
                <button 
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedVersion === 'pollinations' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedVersion('pollinations')}
                >
                  <div className="w-6 h-6 rounded-sm flex items-center justify-center">
                    <span className="text-sm font-medium bg-pink-500 text-white px-2.5 py-1 rounded-full">P</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-sm font-medium">Pollinations</span>
                    {pollinationsStatus === 'available' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Service available"></div>
                    )}
                    {pollinationsStatus === 'unavailable' && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="Service unavailable"></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPollinationsStatus('unknown');
                            testPollinationsAPI().then(isAvailable => {
                              setPollinationsStatus(isAvailable ? 'available' : 'unavailable');
                            });
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                          title="Retry connection"
                        >
                          ↻
                        </button>
                      </div>
                    )}
                    {pollinationsStatus === 'unknown' && (
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" title="Checking status..."></div>
                    )}
                  </div>
                  <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded">Turbo</span>
                </button>
              </div>
            </div>

                                  {/* Chat History */}
                                              <div className="flex-1">
                         <div className="p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Recent Chats
                          </h3>
                          <div className="space-y-1">
                            {chatHistory.map((chat) => (
                              <div 
                                key={chat.id}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                  currentChatId === chat.id 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => selectChat(chat.id)}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {chat.title}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="text-xs text-gray-500">
                                      {new Date(chat.updatedAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {chat.version && (
                                        <>
                                          <div className={`w-3 h-3 rounded-full ${
                                            chat.version.startsWith('gemini') ? 'bg-blue-500' :
                                            chat.version === 'dall-e' ? 'bg-purple-500' :
                                            chat.version === 'deepseek' ? 'bg-purple-500' :
                                            chat.version === 'claude' ? 'bg-orange-500' :
                                            chat.version === 'llama' ? 'bg-green-500' :
                                            chat.version === 'unstability' ? 'bg-red-500' :
                                            'bg-gradient-to-br from-purple-500 to-blue-500'
                                          }`}></div>
                                          <span className="text-xs text-gray-400 font-medium">
                                            {chat.version === 'dall-e' ? 'DALL-E' :
                                             chat.version === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                                             chat.version === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                                             chat.version === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' :
                                             chat.version === 'gemini-thinking' ? 'Gemini Thinking' :
                                             chat.version === 'deepseek' ? 'DeepSeek' :
                                             chat.version === 'claude' ? 'Claude' :
                                             chat.version === 'llama' ? 'Llama' :
                                             chat.version === 'unstability' ? 'Unstability AI' :
                                             chat.version.startsWith('gemini') ? 'Gemini' :
                                             chat.version.toUpperCase()}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                  }}
                                >
                                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

            {/* Sidebar Toggle */}
            <div className="p-4 border-t border-gray-200">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Hide Sidebar
              </button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Sidebar Toggle Button (when sidebar is hidden) */}
          {/* {!sidebarOpen && (
            <button 
              onClick={() => setSidebarOpen(true)}
              className="absolute left-4 top-4 z-10 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )} */}
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto bg-white">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How can I help you today?
                </h3>
                <p className="text-gray-600 mb-6">
                  I'm an AI assistant that can help you with questions, writing, analysis, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => sendChatMessage("Write a professional email")}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Write a professional email</div>
                    <div className="text-sm text-gray-500">to a colleague about a project</div>
                  </button>
                  <button 
                    onClick={() => sendChatMessage("Explain quantum computing")}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Explain quantum computing</div>
                    <div className="text-sm text-gray-500">in simple terms</div>
                  </button>
                  <button 
                    onClick={() => sendChatMessage("/imagine a futuristic city")}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Generate an image</div>
                    <div className="text-sm text-gray-500">of a futuristic city</div>
                  </button>
                  <button 
                    onClick={() => sendChatMessage("Help me plan a trip")}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">Help me plan a trip</div>
                    <div className="text-sm text-gray-500">to Europe this summer</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' 
                          ? 'bg-gray-600' 
                          : 'bg-green-500'
                      }`}>
                        {message.sender === 'user' ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        )}
                      </div>
                      <div className={`flex-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-4 rounded-2xl ${
                          message.sender === 'user' 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'bg-white text-gray-900'
                        }`}>
                          <div className={`${message.sender === 'user' ? 'text-sm leading-6' : 'text-base leading-7 max-w-3xl'}`}>
                            {renderMessage(message)}
                          </div>
                        </div>
                        {message.sender === 'ai' && (
                          <div className="flex items-center gap-2 mt-2 justify-start">
                            <button 
                              onClick={() => copyToClipboard(message.text)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="Copy to clipboard"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start p-4">
                  <div className="w-full">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block p-4 rounded-2xl bg-gray-100">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

                        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            {/* Plus Banner */}
            <div className="bg-gray-700 text-white rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold">Unlock more with Plus</div>
                <div className="text-sm text-gray-300">ChatGPT Plus gives you higher limits, smarter models, and Sora for video.</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                  Get Plus
                </button>
                <button className="text-gray-400 hover:text-gray-300 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleChatSubmit} className="relative">
              <div className="relative">
                <div className="flex items-center  bg-white border border-gray-300 rounded-full p-2">
                  <button 
                    type="button"
                    className="p-4 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask ${selectedVersion === 'dall-e' ? 'DALL-E' : 
                     selectedVersion === 'gemini-2.5-pro' ? 'Gemini 2.5 Pro' :
                     selectedVersion === 'gemini-2.5-flash' ? 'Gemini 2.5 Flash' :
                     selectedVersion === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' :
                     selectedVersion === 'gemini-thinking' ? 'Gemini Thinking' :
                     selectedVersion === 'gemini-image' ? 'Gemini 2.5 Flash' :
                     selectedVersion === 'google-static-image' ? 'Gemini 2.5 Flash Image' :
                     selectedVersion === 'gemini-flash-image-preview' ? 'Gemini Flash Image Preview' :
                     selectedVersion === 'lamda' ? 'LaMDA' :
                     selectedVersion === 'deepseek' ? 'DeepSeek' :
                     selectedVersion === 'claude' ? 'Claude' :
                     selectedVersion === 'llama' ? 'Llama' :
                     selectedVersion === 'groq' ? 'Grok Code' :
                     selectedVersion === 'grok4' ? 'Grok 4' :
                     selectedVersion === 'grok3' ? 'Grok 3' :
                     selectedVersion === 'grok3mini' ? 'Grok 3 Mini' :
                     selectedVersion === 'grok2vision' ? 'Grok 2 Vision' :
                     selectedVersion === 'unstability' ? 'Unstability AI' :
                     selectedVersion.startsWith('gemini') ? 'Gemini' : selectedVersion.toUpperCase()} anything...`}
                    disabled={chatLoading}
                    rows={1}
                    className="flex-1 px-3 py-2 border-0 focus:ring-0 focus:outline-none resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 text-gray-900"
                    style={{
                      minHeight: '44px',
                      maxHeight: '200px',
                      height: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db #f3f4f6'
                    }}
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <button 
                      type="submit" 
                      disabled={chatLoading || !chatInput.trim()}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        chatInput.trim() && !chatLoading
                          ? 'bg-black hover:bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                ChatGPT can make mistakes. Check important info. See Cookie Preferences.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default GlobalAi;