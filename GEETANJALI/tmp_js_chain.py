with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace all direct addEventListeners with optional chaining, EXCEPT for document.body and window
lines = js.split('\\n')
for i in range(len(lines)):
    line = lines[i]
    if '.addEventListener' in line and not 'window.addEventListener' in line and not 'document.body.addEventListener' in line and not '?.addEventListener' in line:
        # Example: element.addEventListener -> element?.addEventListener
        lines[i] = line.replace('.addEventListener', '?.addEventListener')

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write('\\n'.join(lines))

print("SUCCESS - Applied optional chaining to all event listeners")
