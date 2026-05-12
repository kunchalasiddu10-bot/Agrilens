import requests

url = "http://127.0.0.1:5000/predict"
img_path = r"c:\Users\SUDHESHNA DEVI\OneDrive\GEETANJALI\uploads\IMG20260306201548.jpg"

try:
    with open(img_path, 'rb') as f:
        print("Uploading image...")
        r = requests.post(url, files={'file': f})
        print(f"Status: {r.status_code}")
        print(r.json())
except Exception as e:
    print("Error:", e)
