import React, { useState, useRef, useEffect } from "react";
import {
  SendOutlined,
  LoadingOutlined,
  RobotOutlined,
  UserOutlined,
  CopyOutlined,
} from "@ant-design/icons";

const ChatbotAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Sample quick reply suggestions
  const suggestions = [
    "What can you help me with?",
    "How to add a new bookmark?",
    "What's the best Google site?",
    "Tell me about this website",
  ];

  // Scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (inputMessage.trim()) {
      setIsLoading(true);
      setShowSuggestions(false);

      // Add user message
      setMessages([...messages, { text: inputMessage, sender: "user" }]);
      setInputMessage("");

      try {
        const response = await fetch("https://chatai.nouvous.com/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: inputMessage }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response from AI");
        }

        // Parse the JSON response instead of using text()
        const data = await response.json();
        // Extract the actual response text from the "response" field
        const responseText =
          data.response || "Sorry, I couldn't process that request.";

        // Show typing indicator for 1-2 seconds based on response length
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.min(Math.max(responseText.length * 10, 1000), 2000)
          )
        );

        setMessages((prev) => [
          ...prev,
          {
            text: responseText,
            sender: "ai",
          },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            text: "Sorry, there was an error processing your request.",
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    handleSubmit();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat messages area */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-blue-500 text-6xl mb-4">
              <RobotOutlined />
            </div>
            <div className="text-center text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Hello! I'm Grobo AI Assistant
            </div>
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm max-w-xs">
              I can help you find information, answer questions, and assist with
              tasks.
            </div>

            {showSuggestions && (
              <div className="mt-6 grid grid-cols-1 gap-2 w-full max-w-xs">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                {message.sender === "ai" && (
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                    <RobotOutlined />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none"
                  } relative group`}
                >
                  {message.text}

                  {/* Copy button for AI responses */}
                  {message.sender === "ai" && (
                    <button
                      onClick={() => copyToClipboard(message.text)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <CopyOutlined style={{ fontSize: "12px" }} />
                    </button>
                  )}
                </div>
                {message.sender === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center ml-2 flex-shrink-0">
                    <UserOutlined />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="h-8 w-8 rounded-full bg-indigo-500 dark:-bg-[#28283a] text-white flex items-center justify-center mr-2 flex-shrink-0">
                  <RobotOutlined />
                </div>
                <div className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-800 dark:text-gray-200">
                  <div className="flex space-x-1">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 pl-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? <LoadingOutlined /> : <SendOutlined />}
          </button>
        </form>
      </div>
    </div>
  );
};

// Add custom animation
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default ChatbotAI;
