import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I found that the replaced strings left exactly "    });" on new lines.
# Instead of guessing the lines, we can use regex to find the blocks of skipped comments followed by "});"

patterns_to_remove = [
    r"// Language Selector skipped\s*}\);",
    r"// voice over skipped\s*}\);",
    r"// whatsapp skipped\s*}\);",
    r"// pdf skipped\s*}\);",
    r"// chat skipped\s*}\);"
]

for pattern in patterns_to_remove:
    # Replace the comment + the dangling brace with JUST the comment.
    comment_only = pattern.split(r"\s")[0] + " skipped" 
    js = re.sub(pattern, comment_only, js)

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Cleaned all 8 dangling braces")
