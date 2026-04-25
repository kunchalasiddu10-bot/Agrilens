import os
import re

with open('app.py', 'r', encoding='utf-8') as f:
    app_py = f.read()

# 1. Update imports
app_py = app_py.replace(
    'from predictor import analyze_image',
    'from predictor import analyze_image, analyze_soil, analyze_fertilizer'
)

# 2. Extract predict function
pattern = re.compile(r"(@app\.route\('/predict', methods=\['POST'\]\).*?)(?=@app\.route\('/uploads/<name>')", re.DOTALL)
match = pattern.search(app_py)

if match:
    predict_func = match.group(1)
    
    # 3. Create soil endpoint
    soil_func = predict_func.replace("'/predict'", "'/analyze-soil'")
    soil_func = soil_func.replace("def predict():", "def predict_soil():")
    soil_func = soil_func.replace("analyze_image(filepath)", "analyze_soil(filepath)")
    soil_func = soil_func.replace("PREDICTION", "SOIL_ANALYSIS")
    soil_func = soil_func.replace("Predicted", "Analyzed")
    
    # 4. Create fertilizer endpoint
    fert_func = predict_func.replace("'/predict'", "'/analyze-fertilizer'")
    fert_func = fert_func.replace("def predict():", "def predict_fertilizer():")
    fert_func = fert_func.replace("analyze_image(filepath)", "analyze_fertilizer(filepath)")
    fert_func = fert_func.replace("PREDICTION", "FERTILIZER_OCR")
    fert_func = fert_func.replace("Predicted", "Scanned")
    
    # 5. Insert back into app.py right before the /uploads route
    new_app = app_py.replace(
        "@app.route('/uploads/<name>')",
        soil_func + "\n" + fert_func + "\n@app.route('/uploads/<name>')"
    )
    
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write(new_app)
    print("SUCCESS")
else:
    print("MATCH FAILED")
