import React, { useState, useRef, useEffect } from "react";
import { SendOutlined, LoadingOutlined } from "@ant-design/icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Image } from "antd";

const ChatbotAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [user, setUser] = useState(null);
  // Scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          username: currentUser.username || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if message is for image generation
  const isImageGenerationRequest = (message) => {
    const trimmedMessage = message.trim().toLowerCase();
    return (
      trimmedMessage.startsWith("/imagine") ||
      trimmedMessage.startsWith("/image") ||
      trimmedMessage.startsWith("@image")
    );
  };

  // Check if the message is asking about the AI's name
  const isNameQuestion = (message) => {
    const trimmedMessage = message.trim().toLowerCase();
    const nameQuestions = [
      "what is your name",
      "who are you",
      "what should i call you",
      "what's your name",
      "whats your name",
      "tell me your name",
      "who is grobo",
      "what is grobo"
    ];
    return nameQuestions.some(question => trimmedMessage.includes(question));
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      setIsLoading(true);

      // Add user message
      setMessages([...messages, { text: inputMessage, sender: "user" }]);
      const currentMessage = inputMessage;
      setInputMessage("");

      try {
        // Check if this is an image generation request
        const isImageRequest = isImageGenerationRequest(currentMessage);
        console.log("Is image request:", isImageRequest);
        console.log("Original message:", currentMessage);

        const endpoint = isImageRequest ? "image" : "chat";
        console.log("Using endpoint:", endpoint);

        const prompt = isImageRequest
          ? sanitizeImagePrompt(currentMessage)
          : isNameQuestion(currentMessage)
          ? "My name is Grobo. I'm an AI assistant here to help you with your questions and tasks. How can I assist you today?"
          : currentMessage;
        console.log("Sanitized prompt:", prompt);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCdUfYEBIhbt8eCcwp-thTgl8kNmVITbhA`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  }
                ]
              }
            ]
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to get response from AI (${response.status})`
          );
        }

        // Parse the JSON response
        const data = await response.json();

        if (isImageRequest) {
          if (data.image) {
            // Show typing indicator for a moment
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Add the image response
            setMessages((prev) => [
              ...prev,
              {
                type: "image",
                imageUrl: data.image,
                text: "Generated image based on your prompt",
                sender: "ai",
              },
            ]);
          } else {
            throw new Error("No image generated");
          }
        } else {
          // Extract the response text from the Gemini API response format
          const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
            "Sorry, I couldn't process that request.";

          // Show typing indicator for 2 seconds
          await new Promise((resolve) => setTimeout(resolve, 2000));

          setMessages((prev) => [
            ...prev,
            {
              text: responseText,
              sender: "ai",
            },
          ]);
        }
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: `Sorry, there was an error processing your request. ${error.message}`,
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Function to render a message with markdown support
  const renderMessage = (message) => {
    if (message.sender === "user") {
      // User messages are displayed as plain text
      return (
        <div className="font-sans text-[15px] leading-relaxed">
          {message.text}
        </div>
      );
    } else if (message.type === "image") {
      // Render image response
      return (
        <div className="font-sans">
          <p className="mb-2 text-[15px] text-gray-300">{message.text}</p>
          <Image
            src={message.imageUrl}
            alt="Generated by AI"
            className="max-w-full rounded-md shadow-lg"
            loading="lazy"
          />
        </div>
      );
    } else {
      // AI messages support markdown with improved styling
      return (
        <div className="markdown-content text-left font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // Style code blocks
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline ? (
                  <div className="relative group my-4">
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          copyToClipboard(String(children).replace(/\n$/, ""))
                        }
                        className="bg-gray-700 hover:bg-gray-600 text-white p-1 rounded text-xs"
                        title="Copy code"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-800 rounded p-3 overflow-x-auto my-2 text-[14px] font-mono">
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
              // Style headings with proper spacing
              h1: ({ children }) => (
                <h1 className="text-xl font-semibold mt-6 mb-3 text-blue-300">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mt-5 mb-3 text-blue-300">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-md font-semibold mt-4 mb-2 text-blue-300">
                  {children}
                </h3>
              ),
              // Improve list styling with more spacing
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-3 space-y-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 my-3 space-y-2">{children}</ol>
              ),
              // Add space between list items
              li: ({ children }) => (
                <li className="mb-2 leading-relaxed">{children}</li>
              ),
              // Improve paragraph spacing
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-[15px]">{children}</p>
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
                <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300 leading-relaxed">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-white font-sans">
      {/* Empty/Welcome Screen */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <h1 className="text-2xl font-medium mb-2">
            Hi, {user?.displayName || "there"}
          </h1>
          <p className="text-xl mb-4">Can I help you with anything?</p>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Ready to assist you with anything you need? From answering questions
            to providing recommendations. Try image generation with /imagine or
            @image!
          </p>
          <div className="mt-6 bg-gray-800 p-4 rounded-md text-sm text-gray-300 max-w-md">
            <p className="mb-2 font-semibold">Pro tip: Generate images!</p>
            <p className="mb-1">
              • Use <span className="text-blue-400">/imagine</span> followed by
              a description
            </p>
            <p>
              • Or try <span className="text-blue-400">@image</span> with your
              image idea
            </p>
          </div>
        </div>
      ) : (
        // Chat messages
        <div
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-5 py-4 rounded ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-[#282a36] text-gray-100"
                } relative group`}
              >
                {renderMessage(message)}

                {/* Copy button for AI responses */}
                {message.sender === "ai" && !message.type && (
                  <button
                    onClick={() => copyToClipboard(message.text)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                )}

                {/* Download button for AI generated images */}
                {message.sender === "ai" && message.type === "image" && (
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = message.imageUrl;
                      link.download = `grobo-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] px-4 py-3 rounded bg-[#282a36] text-gray-300">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area - improved with better disabled state and visual feedback */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isLoading
                ? "Waiting for Grobo to respond..."
                : "Ask something or use /imagine for images..."
            }
            className={`flex-1 p-3 bg-[#282a36] text-white rounded-l border-0 focus:outline-none focus:ring-0 font-sans text-[15px] ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-3 rounded-r text-white flex items-center justify-center transition-colors ${
              isLoading || !inputMessage.trim()
                ? "bg-gray-600 opacity-50 cursor-not-allowed"
                : "bg-[#282a36] hover:bg-gray-700"
            }`}
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <LoadingOutlined className="text-lg" />
            ) : (
              <SendOutlined className="text-lg" />
            )}
          </button>
        </form>

        {/* Status message - show different message when loading */}
        <p className="text-gray-500 text-xs mt-2 text-center">
          {isLoading
            ? "Grobo is thinking... please wait for a response"
            : "Grobo AI may contain errors. Use /imagine or @image to generate images."}
        </p>
      </div>
    </div>
  );
};

export default ChatbotAI;
