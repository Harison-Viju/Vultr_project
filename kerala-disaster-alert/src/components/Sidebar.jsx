// Sidebar.jsx
import React, { useState } from "react";
import axios from "axios";

const Sidebar = ({ predictions }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  const handleChatSubmit = async () => {
    const api_url = "https://api.vultrinference.com/v1/chat/completions";
    const api_key = "BZINS2TPSF4KBTBSGAM47C7OZJM7TUP7A6JA";

    try {
      const response = await axios.post(
        api_url,
        {
          model: "llama2-7b-chat-Q5_K_M",
          messages: [{ role: "user", content: chatInput }],
        },
        { headers: { Authorization: `Bearer ${api_key}` } }
      );
      setChatResponse(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
    }
  };

  return (
    <div className="sidebar">
      <h3>High-Risk Districts</h3>
      {Object.entries(predictions)
        .filter(([_, info]) => info.risk === "High Risk")
        .map(([district, info]) => (
          <div key={district} className="high-risk">
            {district} - {info.probability.toFixed(2)}%
          </div>
        ))}
      <div className="chat-section">
        <textarea
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button onClick={handleChatSubmit}>Send</button>
        {chatResponse && <div className="chat-response">{chatResponse}</div>}
      </div>
    </div>
  );
};

export default Sidebar;
