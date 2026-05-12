from dotenv import load_dotenv
from google import genai
import os

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    print(f"API Key present: {bool(api_key)}")
    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(model='gemini-2.5-flash', contents="Hello")
    print("Success:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
