with open('static/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's use a brute force string replace for the exact remaining broken Code Block
broken_block = """            const data = await response.json();
            if (data.success) {
                try {
                    const t = data.translations;
                    if (t.symptoms) document.getElementById('fert-ingredients-text').textContent = t.symptoms;
                    if (t.causes) document.getElementById('fert-usage-text').textContent = t.causes;
                    if (t.treatment) document.getElementById('fert-targets-text').textContent = t.treatment;
                    if (t.prevention) document.getElementById('fert-safety-text').textContent = t.prevention;
                } catch (e) { console.warn('Translation render error', e); }
            } else {
                console.error('Translation failed from server:', data.error);
            }
        } catch (e) { console.error('Translation network error', e); }
    });"""

js = js.replace(broken_block, "")

broken_block_soil = """            const data = await response.json();
            if (data.success) {
                try {
                    const t = data.translations;
                    if (t.symptoms) document.getElementById('soil-characteristics-text').textContent = t.symptoms;
                    if (t.causes) document.getElementById('soil-composition-text').textContent = t.causes;
                    if (t.treatment) document.getElementById('soil-treatment-text').textContent = t.treatment;
                    if (t.prevention) document.getElementById('soil-crops-text').textContent = t.prevention;
                } catch (e) { console.warn('Translation render error', e); }
            } else {
                console.error('Translation failed from server:', data.error);
            }
        } catch (e) { console.error('Translation network error', e); }
    });"""

js = js.replace(broken_block_soil, "")

with open('static/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("SUCCESS - Pruned final translation block")
