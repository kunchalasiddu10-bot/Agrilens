import re

with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# The specific syntax errors are caused by these hanging closures in both Soil and Fert blocks:
hanging_closures = [
    "// Language Selector skipped\\n        });",
    "// voice over skipped\\n        });",
    "// whatsapp skipped\\n    });",
    "// pdf skipped\\n    });",
    "// chat skipped\\n    });"
]

for closure in hanging_closures:
    js = js.replace(closure, closure.split('\\n')[0]) # Keep the comment, remove the \n});

# Also, there's a dangling '}' from the skipped Theme Toggle in both blocks:
js = js.replace("// Theme toggle skipped\\n    }", "// Theme toggle skipped")

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Removed SyntaxErrors")
