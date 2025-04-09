import React, { useState } from "react";
import { getChatResponse } from "./api";

import './ChatBox.css';

const ChatBox = () => {
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!userMessage.trim()) return;

        // Add user message to chat
        const newChat = [{ sender: "You", message: userMessage }, ...chatHistory];
        setChatHistory(newChat);

        // Show loading spinner
        setIsLoading(true);

        // Fetch AI response
        const aiResponse = await getChatResponse(userMessage);

        // Add bot response to chat
        setChatHistory([{ sender: "Bot", message: aiResponse }, ...newChat]);

        // Hide loading spinner and clear input
        setIsLoading(false);
        setUserMessage("");
    };

    return (
        <div className="container">
            {/* Chat History */}
            <div className="chat-box">
                {isLoading &&<div class="spinner">  <span></span>  <span></span><span></span><span></span> <span></span> <span></span><span></span><span></span></div>}
                {chatHistory.map((chat, index) => (
                    <div
                        key={index}
                        className={`message ${chat.sender.toLowerCase()}`}
                    >
                        <strong>{chat.sender}:</strong> {chat.message}
                    </div>
                ))}
            </div>

            {/* Input Box */}
            <div className="input-box">
                <input
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message here..."
                />
               
                <button  onClick={handleSend} class="send-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
