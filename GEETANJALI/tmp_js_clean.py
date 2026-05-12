import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Remove the broken theme toggle lines
js = re.sub(r"const themeBtn = document\.getElementById\('invalid-id-duplicate'\);.*?\n.*?\}", "", js, flags=re.DOTALL)

# Remove the broken language selector lines
js = re.sub(r"const langSelector = document\.getElementById\('invalid-lang-dup'\);.*?\n.*?\}\);", "", js, flags=re.DOTALL)

# Remove the broken history lines that cause 'Cannot read properties of null (reading style)'
js = re.sub(r"historySection\.style\.display = 'block';\n        historyList\.innerHTML = '';", "if(historySection) { historySection.style.display = 'block'; historyList.innerHTML = ''; }", js)
js = re.sub(r"historyList\.appendChild\(item\);", "if(historyList) historyList.appendChild(item);", js)

# Remove the missing button listeners that throw 'Cannot read properties of null (reading addEventListener)'
js = re.sub(r"document\.getElementById\('language-selector'\)\?\.addEventListener\('change', .*?\}\);", "", js, flags=re.DOTALL)

# Remove any raw addEventListener calls on elements that might be null
js = js.replace("removeBtn.addEventListener('click'", "removeBtn?.addEventListener('click'")
js = js.replace("scanNewBtn.addEventListener('click'", "scanNewBtn?.addEventListener('click'")
js = js.replace("analyzeBtn.addEventListener('click'", "analyzeBtn?.addEventListener('click'")
js = js.replace("fileInput.addEventListener('change'", "fileInput?.addEventListener('change'")
js = js.replace("dropZone.addEventListener('drop'", "dropZone?.addEventListener('drop'")
js = js.replace("dropZone.addEventListener('click'", "dropZone?.addEventListener('click'")

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Cleaned app.js")
