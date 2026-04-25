with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Currently, app.js looks like this:
# window.onerror...
# console.log...
# // ===================== MODE SELECTOR ...
# function selectMode(mode) { ... }
#
# BUT! In my earlier debug script, I did this:
# js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\\n    console.log('DOMContentLoaded block started.');")
#
# Let's see where the DOMContentLoaded actually starts.

lines = js.split('\\n')
new_lines = []

for line in lines:
    if "document.addEventListener('DOMContentLoaded'" in line and "block started" in line:
        # Move it back to where it belongs! Right before the original block (now starting at line 200).
        continue
    new_lines.append(line)

js = "\\n".join(new_lines)

# Re-insert the DOMContentLoaded at the correct place (right before // ===================== DOM ELEMENTS =====================)
js = js.replace("// ===================== DOM ELEMENTS =====================", "document.addEventListener('DOMContentLoaded', () => {\\n    // ===================== DOM ELEMENTS =====================")

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Restored global scope to selectMode")
