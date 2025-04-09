export const getChatResponse = async (userMessage) => {
    const apiKey = "AIzaSyA0ybH14Kne8HjMxrC7YOCstJ5LwHTzi_0"; // Replace with your API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: userMessage,
                    },
                ],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error("API Error:", await response.json());
            return "Sorry, there was an error processing your request.";
        }

        const data = await response.json();
        console.log("Full API Response:", JSON.stringify(data, null, 2));

        // Extract text response
        const textResponse =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Sorry, I couldn't understand that request.";
        
        return textResponse;
    } catch (error) {
        console.error("Error fetching chat response:", error);
        return "Sorry, there was an error processing your request.";
    }
};
