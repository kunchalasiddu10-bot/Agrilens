import os

with open('app.py', 'r', encoding='utf-8') as f:
    app_py = f.read()

new_endpoints = """
@app.route('/weather', methods=['POST'])
def weather():
    data = request.get_json()
    location = data.get('location', '')
    if not location:
        return jsonify({'error': 'No location provided'}), 400
    try:
        from dotenv import load_dotenv
        from google import genai
        import os
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        
        prompt = f"You are an expert AI agricultural meteorologist. The user is asking for local weather advice for farming in '{location}'. Provide a short 3-4 sentence practical weather-based farming advice for this location right now. Keep it concise, and tailored to Indian farming if the location is in India."
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        return jsonify({'success': True, 'reply': response.text.strip()})
    except Exception as e:
        print(f"Weather error: {e}")
        return jsonify({'success': False, 'reply': f"Sorry, could not connect to Weather AI right now. Error: {str(e)}"})

@app.route('/market', methods=['POST'])
def market():
    data = request.get_json()
    crop = data.get('crop', '')
    if not crop:
        return jsonify({'error': 'No crop provided'}), 400
    try:
        from dotenv import load_dotenv
        from google import genai
        import os
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=api_key)
        
        prompt = f"You are an expert AI agricultural economist. The user wants to know the current market price trend and advice for the crop: {crop}. Provide a concise 3-4 sentence market analysis, simulated realistic price trend (in INR/Quintal), and advice on whether to sell or hold. Keep it highly practical for an Indian farmer."
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        return jsonify({'success': True, 'reply': response.text.strip()})
    except Exception as e:
        print(f"Market error: {e}")
        return jsonify({'success': False, 'reply': f"Sorry, could not connect to Market AI right now. Error: {str(e)}"})
"""

app_py = app_py.replace("@app.route('/predict', methods=['POST'])", new_endpoints + "\n@app.route('/predict', methods=['POST'])")

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(app_py)

print("SUCCESS")
