import React, { useState, useRef, useEffect } from "react";
import { SendOutlined, LoadingOutlined } from "@ant-design/icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (inputMessage.trim()) {
      setIsLoading(true);

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

        // Parse the JSON response
        const data = await response.json();
        const responseText =
          data.response || "Sorry, I couldn't process that request.";

        // Show typing indicator for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] text-white font-mono">
      {/* Empty/Welcome Screen */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="mb-6">
            <div className="inline-block bg-white dark:bg-gray-800 rounded-full p-4">
              <img
                src="/logo-small.png"
                alt="AI Logo"
                className="w-12 h-12"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
          <h1 className="text-2xl font-medium mb-2">
            Hi, {user?.displayName || "there"}
          </h1>
          <p className="text-xl mb-4">Can I help you with anything?</p>
          <p className="text-gray-400 text-sm max-w-md">
            Ready to assist you with anything you need? From answering
            questions, generation to providing recommendations. Let's get
            started!
          </p>
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
                className={`max-w-[80%] px-4 py-2 rounded ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-[#282a36] text-gray-100"
                } relative group`}
              >
                {message.text}

                {/* Copy button for AI responses */}
                {message.sender === "ai" && (
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

      {/* Input area */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 p-3 bg-[#282a36] text-white rounded-l border-0 focus:outline-none focus:ring-0"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-3 rounded-r bg-[#282a36] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <LoadingOutlined className="text-lg" />
            ) : (
              <SendOutlined className="text-lg" />
            )}
          </button>
        </form>
        <p className="text-gray-500 text-xs mt-2 text-center">
          Grobo AI may contain errors. We recommend checking important
          information.
        </p>
      </div>
    </div>
  );
};

export default ChatbotAI;
