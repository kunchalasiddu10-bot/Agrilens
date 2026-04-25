with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# The syntax checker is reporting that the file ends prematurely without closing
# the DOMContentLoaded blocks for Soil and Fertilizer.

# Let's count the DOMContentLoaded openers
open_blocks = js.count("document.addEventListener('DOMContentLoaded', () => {")

# Right now the file ends abruptly after renderHistory() in the fert block.
# We need to append the missing closures.

# Let's cleanly split on the scanner declarations to fix their endings.
blocks = js.split("// --- ")

fixed_blocks = [blocks[0]]

for block in blocks[1:]:
    # Determine the name: SOIL SCANNER --- or FERTILIZER SCANNER ---
    name = block.split(' ---')[0]
    
    # Ensure this block ends with });
    if not block.strip().endswith('});'):
        block = block.rstrip() + "\\n});\\n"
        
    fixed_blocks.append("// --- " + block)

js = "".join(fixed_blocks)

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Restored missing closing braces to main blocks")
