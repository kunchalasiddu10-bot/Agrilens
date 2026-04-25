import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# First, let's remove everything after the first end of the disease scanner.
# The disease scanner ends with:
#     renderHistory(); // Render any existing history on page load
# });
split_marker = "    renderHistory(); // Render any existing history on page load\n});"
parts = js.split(split_marker)

if len(parts) >= 2:
    clean_base_js = parts[0] + split_marker
else:
    print("Could not find split marker!")
    exit(1)

# The disease scanner code starts at line 187: "document.addEventListener('DOMContentLoaded', () => {"
# Let's extract it cleanly using string split:
start_marker = "document.addEventListener('DOMContentLoaded', () => {\n\n    // ===================== DOM ELEMENTS ====================="
blocks = clean_base_js.split(start_marker)
if len(blocks) >= 2:
    disease_js = start_marker + blocks[-1]
else:
    print("Could not find start marker!")
    exit(1)

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
        ("'history-section'", "'invalid-history-dup'"), # Prevent duplicate history setup
        ("saveToHistory(data, currentFile);", "// History save disabled for secondary modes"), # Disable history save
        ("renderHistory(); // Render any existing history on page load", ""),
        # Theme toggle is global, no need to duplicate its listeners:
        ("const themeBtn = document.getElementById('theme-toggle-btn');\n    const savedTheme = localStorage.getItem('agrilens_theme');\n    if (savedTheme === 'light') document.body.classList.add('light-mode');\n    if (themeBtn) {\n        themeBtn.addEventListener('click', () => {\n            document.body.classList.toggle('light-mode');\n            const isLight = document.body.classList.contains('light-mode');\n            localStorage.setItem('agrilens_theme', isLight ? 'light' : 'dark');\n            themeBtn.innerHTML = isLight ? '<i class=\"fa-solid fa-sun\"></i>' : '<i class=\"fa-solid fa-moon\"></i>';\n        });\n        themeBtn.innerHTML = savedTheme === 'light' ? '<i class=\"fa-solid fa-sun\"></i>' : '<i class=\"fa-solid fa-moon\"></i>';\n    }", "// Theme toggle skipped"),
        # Language Selector:
        ("langSelector?.addEventListener('change', async () => {", "// Language Selector skipped"),
        # PDF/Voice/Whatsapp (assuming we don't want them or they share the same IDs)
        ("document.getElementById('voice-btn')?.addEventListener('click', () => {", "// voice over skipped"),
        ("document.getElementById('whatsapp-btn')?.addEventListener('click', () => {", "// whatsapp skipped"),
        ("document.getElementById('pdf-btn')?.addEventListener('click', () => {", "// pdf skipped"),
        # Disable Chatbot duplicate initialization for these modes
        ("chatSendBtn?.addEventListener('click', sendChatMessage);", "// chat skipped"),
        ("chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });", "")
    ]
    
    for old, new in replacements:
        code = code.replace(old, new)
        
    return code

soil_js = transform_js('soil-', '/analyze-soil')
fert_js = transform_js('fert-', '/analyze-fertilizer')

new_js = clean_base_js + "\n\n// --- SOIL SCANNER --- \n" + soil_js + "\n\n// --- FERTILIZER SCANNER --- \n" + fert_js + "\n"

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
    
print("SUCCESS - Restored app.js and appended the FULL Scanner script blocks")
