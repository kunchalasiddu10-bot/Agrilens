with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add a console log to the very start of selectMode
js = js.replace('function selectMode(mode) {', 'function selectMode(mode) {\\n    console.log("selectMode triggered with:", mode);\\n    alert("selectMode triggered with: " + mode);')

# We should also log at the very top of the script
if "console.log('App.js is fully loaded and executing top-to-bottom');" not in js:
    js = js.replace('console.log("App.js Loaded.");', 'console.log("App.js Loaded.");\\nconsole.log("App.js is fully loaded and executing top-to-bottom");\\nwindow.selectMode = selectMode; // FORCE GLOBAL BINDING') 

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Injected tracing logs and forced global binding of selectMode")
