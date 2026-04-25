import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Pattern to extract the DOMContentLoaded block for the disease scanner
pattern = re.compile(r"document\.addEventListener\('DOMContentLoaded', \(\) => \{(.*?)\}\);", re.DOTALL)
matches = pattern.findall(js)

if len(matches) >= 2:
    disease_js = matches[1]  # The second DOMContentLoaded block is the scanner (first is chat)
    
    # We strip out theme toggle and history from the duplicates so they don't run 3 times
    # Theme toggle is lines 164-175, History is 483-500
    # Actually it's safer to just replace them or leave them out. Let's do replacements.
    
    def transform_js(prefix, endpoint):
        code = disease_js
        # Replace DOM element IDs
        replacements = [
            ("'drop-zone'", f"'{prefix}drop-zone'"),
            ("'file-input'", f"'{prefix}file-input'"),
            ("'default-state'", f"'{prefix}default-state'"),
            ("'preview-state'", f"'{prefix}preview-state'"),
            ("'image-preview'", f"'{prefix}image-preview'"),
            ("'remove-btn'", f"'{prefix}remove-btn'"),
            ("'analyze-btn'", f"'{prefix}analyze-btn'"),
            ("'loading-overlay'", f"'{prefix}loading-overlay'"),
            ("'loading-status-text'", f"'{prefix}loading-status-text'"),
            ("'results-section'", f"'{prefix}results-section'"),
            ("'scan-new-btn'", f"'{prefix}scan-new-btn'"),
            ("'result-card-image'", f"'{prefix}result-card-image'"),
            ("'result-image'", f"'{prefix}result-image'"),
            ("'conf-value'", f"'{prefix}conf-value'"),
            ("'conf-bar'", f"'{prefix}conf-bar'"),
            ("'health-score'", f"'{prefix}health-score'"),
            ("'data-card'", f"'{prefix}data-card'"),
            ("'disease-name'", f"'{prefix}type-name'"),
            ("'crop-tag'", f"'{prefix}crop-tag'"),
            ("'scientific-name'", f"'{prefix}scientific-name'"),
            ("'severity-badge'", f"'{prefix}severity-badge'"),
            ("'symptoms-text'", f"'{prefix}characteristics-text'" if prefix=='soil-' else f"'{prefix}ingredients-text'"),
            ("'causes-text'", f"'{prefix}composition-text'" if prefix=='soil-' else f"'{prefix}usage-text'"),
            ("'prevention-text'", f"'{prefix}crops-text'" if prefix=='soil-' else f"'{prefix}safety-text'"),
            ("'treatment-text'", f"'{prefix}treatment-text'" if prefix=='soil-' else f"'{prefix}targets-text'"),
            ("'chemicals-list'", f"'{prefix}fertilizers-list'" if prefix=='soil-' else f"'{prefix}recommendations-list'"),
            ("'/predict'", f"'{endpoint}'"),
            ("'theme-toggle-btn'", "'invalid-id-duplicate'"), # Prevent duplicate theme toggles
            ("'history-section'", "'invalid-history-dup'") # Prevent duplicate history setup
        ]
        
        for old, new in replacements:
            code = code.replace(old, new)
        return code

    soil_js = transform_js('soil-', '/analyze-soil')
    fert_js = transform_js('fert-', '/analyze-fertilizer')
    
    new_js = js + "\n\n// --- SOIL SCANNER --- \ndocument.addEventListener('DOMContentLoaded', () => {" + soil_js + "});\n\n// --- FERTILIZER SCANNER --- \ndocument.addEventListener('DOMContentLoaded', () => {" + fert_js + "});\n"
    
    with open('static/js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("SUCCESS")
else:
    print("FAILED TO MATCH")
