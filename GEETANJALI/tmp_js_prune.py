import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Instead of tricky string replacement, lets find the sections and use regex dotall
# to remove the ENTIRE block for each unsupported feature in the duplicated scanners.

patterns_to_prune = [
    r"// ===================== LANGUAGE SELECTOR =====================\s*// Language Selector skipped.*?}\);",
    r"// ===================== VOICE OUTPUT =====================\s*// voice over skipped.*?}\);",
    r"// ===================== WHATSAPP SHARE =====================\s*// whatsapp skipped.*?}\);",
    r"// ===================== PDF DOWNLOAD =====================\s*// pdf skipped.*?}\);"
]

for pattern in patterns_to_prune:
    js = re.sub(pattern, "", js, flags=re.DOTALL)

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Pruned all dead code blocks")
