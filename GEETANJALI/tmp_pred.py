import os

with open('predictor.py', 'r', encoding='utf-8') as f:
    original = f.read()

# I will write the two new functions and append them to predictor.py
soil_func = """
def analyze_soil(image_path, retries=5):
    if not api_key:
        return {"success": False, "error": "Gemini API Key missing. Check .env file."}
        
    client = genai.Client(api_key=api_key)
    
    try:
        img = Image.open(image_path)
    except Exception as e:
        return {"success": False, "error": f"Failed to open image: {str(e)}"}
        
    prompt = '''
    You are an expert AI agricultural soil scientist. Analyze this image of farm soil.
    Identify the exact soil type and its likely moisture level or health.
    
    CRITICAL INSTRUCTION: You MUST dynamically generate a comprehensive scientific response containing 
    the characteristics, composition, improvements, and recommended actions.
    
    You MUST return ONLY a raw JSON object string with the following exact schema (no markdown, no extra text):
    {
        "detected_crop": "List 1-2 Recommended Crops (e.g., Cotton, Groundnut)",
        "prediction": "Specific name of the soil type (e.g., Red Soil, Black Cotton Soil, Sandy Loam)",
        "confidence": A number from 0.0 to 99.9 representing your certainty,
        "disease_details": {
            "scientific_name": "pH Level Estimate (e.g., pH 6.5 - 7.5)",
            "symptoms": "Detailed paragraph describing visual characteristics and texture",
            "causes": "Detailed paragraph describing its mineral composition and organic matter",
            "severity": "Moisture Level (Low, Medium, or High) or Quality (Poor, Good, Excellent)",
            "treatment": "Detailed paragraph describing soil improvement strategies (ploughing, mulching)",
            "prevention": "Detailed paragraph expanding on the best crops suited for this soil",
            "affected_parts": ["Texture", "Color", "Moisture"],
            "recommended_chemicals": ["Organic Compost", "Gypsum", "Specific Fertilizer 1"]
        }
    }
    '''
    
    last_error = ""
    for attempt in range(retries):
        try:
            print(f"\\n--- Calling Gemini AI Soil Analyzer (Attempt {attempt+1}/{retries}) ---")
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, img],
                config=types.GenerateContentConfig(temperature=0.2)
            )
            
            response_text = response.text.strip()
            if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"): response_text = response_text[3:-3].strip()
                
            ai_data = json.loads(response_text)
            
            if "disease_details" not in ai_data:
                raise ValueError("JSON response missing requested dict.")
                
            return {
                "success": True,
                "detected_crop": ai_data.get("detected_crop", "Various"),
                "prediction": ai_data.get("prediction", "Unknown Soil"),
                "confidence": ai_data.get("confidence", 85.0),
                "disease_details": ai_data["disease_details"]
            }
        except Exception as e:
            error_str = str(e)
            print(f"Soil API Error: {error_str}")
            if "503" in error_str or "UNAVAILABLE" in error_str:
                time.sleep(2 ** attempt)
            else:
                time.sleep(2)
    return {"success": False, "error": f"Soil Analysis completely failed after {retries} retries."}
"""

fert_func = """
def analyze_fertilizer(image_path, retries=5):
    if not api_key:
        return {"success": False, "error": "Gemini API Key missing."}
        
    client = genai.Client(api_key=api_key)
    
    try:
        img = Image.open(image_path)
    except Exception as e:
        return {"success": False, "error": f"Failed to open image: {str(e)}"}
        
    prompt = '''
    You are an expert agricultural chemist and OCR (Optical Character Recognition) AI. 
    Analyze this image of a fertilizer or agricultural chemical bottle/packet.
    Read the label carefully and extract its purpose and safe usage.
    
    CRITICAL INSTRUCTION: You MUST dynamically generate a comprehensive and safety-focused response containing 
    the active ingredients, usage instructions, safety precautions, and target pests/crops.
    
    You MUST return ONLY a raw JSON object string with the following exact schema (no markdown, no extra text):
    {
        "detected_crop": "Target Crop(s) usually applied to",
        "prediction": "Brand Name OR Primary Chemical Name (e.g., Urea 46%, Neem Oil, Glyphosate)",
        "confidence": A number from 0.0 to 99.9 representing how clear the label is,
        "disease_details": {
            "scientific_name": "Chemical Formula or IUPAC name (or N/A)",
            "symptoms": "Detailed paragraph listing Active Ingredients and their concentrations",
            "causes": "Detailed paragraph explaining exactly how to mix and use this product (Usage Instructions)",
            "severity": "Toxicity/Safety Level (Danger, Warning, Caution, or Safe)",
            "treatment": "Detailed paragraph describing the exact pests, diseases, or growth stages this targets",
            "prevention": "Detailed paragraph listing Safety Precautions (e.g., wear gloves, keep away from eyes, wait 14 days before harvest)",
            "affected_parts": ["Foliar", "Soil", "Seed Treatment"],
            "recommended_chemicals": ["Recommended Adjuvant", "Alternative Organic Option"]
        }
    }
    '''
    
    last_error = ""
    for attempt in range(retries):
        try:
            print(f"\\n--- Calling Gemini AI Fertilizer OCR (Attempt {attempt+1}/{retries}) ---")
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, img],
                config=types.GenerateContentConfig(temperature=0.1)
            )
            
            response_text = response.text.strip()
            if response_text.startswith("```json"): response_text = response_text[7:-3].strip()
            elif response_text.startswith("```"): response_text = response_text[3:-3].strip()
                
            ai_data = json.loads(response_text)
            
            if "disease_details" not in ai_data:
                raise ValueError("JSON response missing requested dict.")
                
            return {
                "success": True,
                "detected_crop": ai_data.get("detected_crop", "General Use"),
                "prediction": ai_data.get("prediction", "Unknown Chemical"),
                "confidence": ai_data.get("confidence", 90.0),
                "disease_details": ai_data["disease_details"]
            }
        except Exception as e:
            error_str = str(e)
            print(f"Fertilizer API Error: {error_str}")
            if "503" in error_str or "UNAVAILABLE" in error_str:
                time.sleep(2 ** attempt)
            else:
                time.sleep(2)
    return {"success": False, "error": f"Fertilizer OCR completely failed after {retries} retries."}
"""

with open('predictor.py', 'a', encoding='utf-8') as f:
    f.write("\\n" + soil_func + "\\n" + fert_func)
    
print("SUCCESS appending functions!")
