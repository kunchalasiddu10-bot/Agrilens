import sys
import codecs

# Fix utf-8 printing for console
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

lines = js.split('\\n')
counts = []
b_count = 0
for i, line in enumerate(lines):
    # Only count actual braces, not ones inside strings (rough heuristic, avoiding complex parsing)
    clean_line = line.replace("'{'", "").replace("'}'", "").replace('"{"', '').replace('"}"', '')
    
    # Check if this line is just an empty closure
    if clean_line.strip() == '});' or clean_line.strip() == '}':
        b_count -= 1
        if b_count < 0:
            print(f"Line {i+1}: POSSIBLY DANGLING '{clean_line.strip()}' -> {line}")
            b_count = 0 
    else:
        # Normal counting
        b_count += clean_line.count('{') - clean_line.count('}')
        if b_count < 0:
            print(f"Line {i+1}: POSSIBLY DANGLING BRACE -> {line}")
            b_count = 0

print(f"Total lines analyzed: {len(lines)}")
