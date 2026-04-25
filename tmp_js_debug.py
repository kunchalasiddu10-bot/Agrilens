with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

debug_inject = """
window.onerror = function(message, source, lineno, colno, error) {
    console.error("GLOBAL APP ERROR:", message, "at line:", lineno);
    alert("JS ERROR: " + message + " at line " + lineno);
    return true; 
};
console.log("App.js Loaded.");
"""

js = debug_inject + js

js = js.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\\n    console.log('DOMContentLoaded block started.');")

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Injected debug logs")
