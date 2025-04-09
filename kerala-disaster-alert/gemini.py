import requests

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
headers = {"Content-Type": "application/json"}
api_key = "paste ur api key here"
payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": "Explain how AI works"
                }
            ]
        }
    ]
}

response = requests.post(f"{url}?key={api_key}", json=payload, headers=headers)
print(response.json())
