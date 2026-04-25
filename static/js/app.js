// ===================== MODE SELECTOR (Global Scope) =====================
function selectMode(mode) {
    const modeSelector = document.getElementById('mode-selector');
    const diseaseSection = document.getElementById('disease-mode-section');
    const soilSection = document.getElementById('soil-mode-section');
    const fertSection = document.getElementById('fertilizer-mode-section');
    const chatSection = document.getElementById('chat-mode-section');
    const calendarSection = document.getElementById('calendar-mode-section');
    const equipmentSection = document.getElementById('equipment-mode-section');
    const profitSection = document.getElementById('profit-mode-section');
    const schemesSection = document.getElementById('schemes-mode-section');

    if (!modeSelector) return;

    modeSelector.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    modeSelector.style.opacity = '0';
    modeSelector.style.transform = 'scale(0.97)';

    setTimeout(() => {
        modeSelector.classList.add('hidden');
        modeSelector.style.opacity = '';
        modeSelector.style.transform = '';

        if (diseaseSection) diseaseSection.classList.add('hidden');
        if (soilSection) soilSection.classList.add('hidden');
        if (fertSection) fertSection.classList.add('hidden');
        if (chatSection) chatSection.classList.add('hidden');
        if (calendarSection) calendarSection.classList.add('hidden');
        if (equipmentSection) equipmentSection.classList.add('hidden');
        if (profitSection) profitSection.classList.add('hidden');
        if (schemesSection) schemesSection.classList.add('hidden');

        if (mode === 'disease' && diseaseSection) diseaseSection.classList.remove('hidden');
        else if (mode === 'soil' && soilSection) soilSection.classList.remove('hidden');
        else if (mode === 'fertilizer' && fertSection) fertSection.classList.remove('hidden');
        else if (mode === 'chat' && chatSection) chatSection.classList.remove('hidden');
        else if (mode === 'calendar' && calendarSection) calendarSection.classList.remove('hidden');
        else if (mode === 'equipment' && equipmentSection) equipmentSection.classList.remove('hidden');
        else if (mode === 'profit' && profitSection) profitSection.classList.remove('hidden');
        else if (mode === 'schemes' && schemesSection) schemesSection.classList.remove('hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 380);
}

function goBack() {
    const modeSelector = document.getElementById('mode-selector');
    const diseaseSection = document.getElementById('disease-mode-section');
    const soilSection = document.getElementById('soil-mode-section');
    const fertSection = document.getElementById('fertilizer-mode-section');
    const chatSection = document.getElementById('chat-mode-section');

    if (diseaseSection) diseaseSection.classList.add('hidden');
    if (soilSection) soilSection.classList.add('hidden');
    if (fertSection) fertSection.classList.add('hidden');
    if (chatSection) chatSection.classList.add('hidden');
    const calendarSection = document.getElementById('calendar-mode-section');
    if (calendarSection) calendarSection.classList.add('hidden');
    const equipmentSection = document.getElementById('equipment-mode-section');
    if (equipmentSection) equipmentSection.classList.add('hidden');
    const profitSection = document.getElementById('profit-mode-section');
    if (profitSection) profitSection.classList.add('hidden');
    const schemesSection = document.getElementById('schemes-mode-section');
    if (schemesSection) schemesSection.classList.add('hidden');

    if (modeSelector) {
        modeSelector.classList.remove('hidden');
        modeSelector.style.opacity = '0';
        modeSelector.style.transform = 'scale(0.97)';
        setTimeout(() => {
            modeSelector.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            modeSelector.style.opacity = '1';
            modeSelector.style.transform = 'scale(1)';
        }, 50);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function suggestQuestion(text) {
    const input = document.getElementById('crop-chat-input');
    if (input) { input.value = text; input.focus(); }
}

// ===================== MAIN INIT =====================
document.addEventListener('DOMContentLoaded', () => {

    // ===== OFFLINE MEMORY ENGINE (INDEXEDDB) =====
    const AgriDB = {
        db: null,
        init: function() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("AgriLensOfflineDB", 1);
                request.onupgradeneeded = e => {
                    const db = e.target.result;
                    if(!db.objectStoreNames.contains("scans")) {
                        db.createObjectStore("scans", { keyPath: "id", autoIncrement: true });
                    }
                };
                request.onsuccess = e => {
                    this.db = e.target.result;
                    resolve();
                };
                request.onerror = e => reject(e);
            });
        },
        save: function(type, payload) {
            if(!this.db) return;
            const tx = this.db.transaction("scans", "readwrite");
            const store = tx.objectStore("scans");
            store.add({ type, payload, timestamp: new Date().toLocaleString() });
        },
        getAll: function() {
            return new Promise((resolve) => {
                if(!this.db) return resolve([]);
                const tx = this.db.transaction("scans", "readonly");
                const store = tx.objectStore("scans");
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result.reverse());
            });
        }
    };
    AgriDB.init();

    // Attach Offline History Button
    const historyBtn = document.getElementById('offline-history-btn');
    const offlineModal = document.getElementById('offline-modal');
    if (historyBtn && offlineModal) {
        historyBtn.addEventListener('click', async () => {
            offlineModal.classList.remove('hidden');
            const listDiv = document.getElementById('offline-list');
            listDiv.innerHTML = '<p>Loading offline memory...</p>';
            const records = await AgriDB.getAll();
            if(records.length === 0) {
                listDiv.innerHTML = '<p>No offline data saved yet.</p>';
                return;
            }
            listDiv.innerHTML = '';
            records.forEach(r => {
                const item = document.createElement('div');
                item.style.borderBottom = '1px solid var(--border-color)';
                item.style.padding = '15px 0';
                item.innerHTML = `
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px;">${r.timestamp} • ${r.type.toUpperCase()}</div>
                    <div style="font-size: 0.95rem;">${JSON.stringify(r.payload).substring(0, 100)}...</div>
                `;
                listDiv.appendChild(item);
            });
        });
    }

    // ===== PWA SERVICE WORKER =====
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('ServiceWorker registration successful');
            }).catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // ===== LANGUAGE SELECTOR =====
    const langSelector = document.getElementById('lang-selector');
    if (langSelector) {
        const savedLang = localStorage.getItem('agrilens_lang');
        if (savedLang) langSelector.value = savedLang;
        langSelector.addEventListener('change', () => {
            localStorage.setItem('agrilens_lang', langSelector.value);
        });
    }
    
    function getLang() {
        return localStorage.getItem('agrilens_lang') || 'English';
    }

    // ===== SPEECH TO TEXT =====
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    function setupMic(micBtnId, inputId) {
        const btn = document.getElementById(micBtnId);
        const input = document.getElementById(inputId);
        if(!btn || !input || !SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        // recognition.lang can be mapped if needed
        btn.addEventListener('click', () => {
            btn.style.color = '#ef4444'; 
            recognition.start();
        });
        recognition.onresult = (e) => {
            input.value = e.results[0][0].transcript;
            btn.style.color = 'var(--text-muted)';
        };
        recognition.onerror = () => btn.style.color = 'var(--text-muted)';
        recognition.onend = () => btn.style.color = 'var(--text-muted)';
    }
    
    setupMic('disease-mic-btn', 'disease-chat-input');
    setupMic('soil-mic-btn', 'soil-chat-input');
    setupMic('fert-mic-btn', 'fert-chat-input');
    setupMic('crop-chat-mic-btn', 'crop-chat-input');

    // ===== TEXT TO SPEECH =====
    function speakText(elementId, btnId) {
        const btn = document.getElementById(btnId);
        const el = document.getElementById(elementId);
        if(!btn || !el) return;
        btn.addEventListener('click', () => {
            const synth = window.speechSynthesis;
            if(synth.speaking) {
                synth.cancel();
                return;
            }
            const text = el.innerText || el.textContent;
            const utterThis = new SpeechSynthesisUtterance(text);
            const lang = getLang();
            if(lang === 'Telugu') utterThis.lang = 'te-IN';
            else if(lang === 'Hindi') utterThis.lang = 'hi-IN';
            else if(lang === 'Tamil') utterThis.lang = 'ta-IN';
            else if(lang === 'Marathi') utterThis.lang = 'mr-IN';
            else utterThis.lang = 'en-US';
            synth.speak(utterThis);
        });
    }

    speakText('data-card', 'disease-voice-btn');
    speakText('soil-data-card', 'soil-voice-btn');
    speakText('fert-data-card', 'fert-voice-btn');

    // ===== PDF EXPORT =====
    function setupPDF(btnId, targetId, filename) {
        const btn = document.getElementById(btnId);
        if(!btn) return;
        btn.addEventListener('click', () => {
            const element = document.getElementById(targetId);
            
            // Temporary styles for PDF rendering to fix blank/dark mode issues
            const origBg = element.style.background;
            const origColor = element.style.color;
            element.style.background = '#ffffff';
            element.style.color = '#000000';
            element.style.padding = '20px';

            const opt = {
                margin:       0.5,
                filename:     filename,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                // Restore original styles
                element.style.background = origBg;
                element.style.color = origColor;
                element.style.padding = '';
            });
        });
    }
    
    setupPDF('disease-pdf-btn', 'data-card', 'disease-report.pdf');
    setupPDF('soil-pdf-btn', 'soil-data-card', 'soil-report.pdf');
    setupPDF('fert-pdf-btn', 'fert-data-card', 'fertilizer-report.pdf');

    // ===== THEME TOGGLE =====
    const themeBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('agrilens_theme');
    if (savedTheme === 'light') document.body.classList.add('light-mode');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('agrilens_theme', isLight ? 'light' : 'dark');
            themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        });
        themeBtn.innerHTML = savedTheme === 'light' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    // ===================================================
    // DISEASE DETECTION SCANNER
    // ===================================================
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const defaultState = document.getElementById('default-state');
    const previewState = document.getElementById('preview-state');
    const imagePreview = document.getElementById('image-preview');
    const removeBtn = document.getElementById('remove-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingStatusText = document.getElementById('loading-status-text');
    const resultsSection = document.getElementById('results-section');
    const featuresSection = document.getElementById('features-section');
    const scanNewBtn = document.getElementById('scan-new-btn');
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    let currentFile = null;
    let lastResult = null;
    let soilLastResult = null;
    let fertLastResult = null;
    let scanHistory = JSON.parse(localStorage.getItem('agrilens_history') || '[]');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
            dropZone.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); }, false);
            document.body.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.add('dragover'), false));
        ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, () => dropZone.classList.remove('dragover'), false));
        dropZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files), false);
        dropZone.addEventListener('click', () => { if (!currentFile && fileInput) fileInput.click(); });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () { if (this.files && this.files.length > 0) handleFiles(this.files); });
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.match('image.*')) { alert('Please upload an image file (JPG, PNG, WEBP)'); return; }
            if (file.size > 16 * 1024 * 1024) { alert('File is too large. Maximum size is 16MB.'); return; }
            currentFile = file;
            showPreview(file);
        }
    }

    function showPreview(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            if (imagePreview) imagePreview.src = reader.result;
            if (defaultState) defaultState.classList.add('hidden');
            if (previewState) previewState.classList.remove('hidden');
            if (analyzeBtn) analyzeBtn.disabled = false;
        };
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', e => { e.stopPropagation(); resetUploadState(); });
    }

    function resetUploadState() {
        currentFile = null;
        if (fileInput) fileInput.value = '';
        if (imagePreview) imagePreview.src = '#';
        if (previewState) previewState.classList.add('hidden');
        if (defaultState) defaultState.classList.remove('hidden');
        if (analyzeBtn) analyzeBtn.disabled = true;
    }

    if (scanNewBtn) {
        scanNewBtn.addEventListener('click', () => {
            if (resultsSection) resultsSection.classList.add('hidden');
            if (featuresSection) featuresSection.classList.remove('hidden');
            if (historySection) historySection.style.display = 'none';
            resetUploadState();
        });
    }

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            if (!currentFile) return;
            const formData = new FormData();
            formData.append('file', currentFile);
            formData.append('lang', getLang());
            if (loadingOverlay) loadingOverlay.classList.remove('hidden');
            if (analyzeBtn) analyzeBtn.disabled = true;

            const statusMessages = ['Connecting to Remote Server...', 'Analyzing leaf image...', 'Identifying disease patterns...', 'Generating treatment recommendations...'];
            let statusIdx = 0;
            const statusInterval = setInterval(() => {
                statusIdx = (statusIdx + 1) % statusMessages.length;
                if (loadingStatusText) loadingStatusText.textContent = statusMessages[statusIdx];
            }, 1500);

            try {
                const response = await fetch('/predict', { method: 'POST', body: formData });
                clearInterval(statusInterval);
                if (loadingOverlay) loadingOverlay.classList.add('hidden');

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    alert('Error: ' + (errData.error || 'Server error. Please try again.'));
                    if (analyzeBtn) analyzeBtn.disabled = false;
                    return;
                }
                const data = await response.json();
                dataHtml += `</div>`;
                dataCard.innerHTML = dataHtml;
                dataCard.classList.remove('hidden');
                
                AgriDB.save('Disease Scan', jsonData); // Save to offline memory
            } catch (error) {
                clearInterval(statusInterval);
                if (loadingOverlay) loadingOverlay.classList.add('hidden');
                alert('Connection error. Please check your internet and try again.');
                if (analyzeBtn) analyzeBtn.disabled = false;
            }
        });
    }

    function displayResults(data) {
        if (resultsSection) resultsSection.classList.remove('hidden');
        if (featuresSection) featuresSection.classList.add('hidden');

        const resultImage = document.getElementById('result-image');
        if (resultImage && imagePreview) resultImage.src = imagePreview.src;

        // The backend returns: { success, prediction, confidence, disease_details, image_url }
        const details = data.disease_details || {};
        const confValue = data.confidence || 95.0;
        const el = (id) => document.getElementById(id);
        if (el('conf-value')) el('conf-value').textContent = confValue.toFixed(1) + '%';
        if (el('conf-bar')) el('conf-bar').style.width = confValue + '%';
        if (el('health-score')) el('health-score').textContent = details.health_score || Math.round(100 - confValue * 0.5);
        if (el('crop-tag')) el('crop-tag').textContent = details.crop || data.prediction || 'Unknown Crop';
        if (el('disease-name')) el('disease-name').textContent = data.prediction || 'Analysis Complete';
        if (el('scientific-name')) el('scientific-name').textContent = details.scientific_name || '';
        if (el('severity-badge')) el('severity-badge').textContent = details.severity || 'Moderate';
        if (el('symptoms-text')) el('symptoms-text').textContent = details.symptoms || 'No symptoms data.';
        if (el('causes-text')) el('causes-text').textContent = details.causes || 'No causes data.';
        if (el('prevention-text')) el('prevention-text').textContent = details.prevention || 'No prevention data.';
        if (el('treatment-text')) el('treatment-text').textContent = details.treatment || 'No treatment data.';

        const chemicalsList = el('chemicals-list');
        if (chemicalsList) {
            chemicalsList.innerHTML = '';
            const chemicals = details.chemicals || ['Consult a local agronomist for tailored recommendations.'];
            chemicals.forEach(c => {
                const li = document.createElement('li');
                li.textContent = c;
                chemicalsList.appendChild(li);
            });
        }

        if (historySection) historySection.style.display = 'block';
        const historyListEl = document.getElementById('history-list');
        if (historyListEl) renderHistory(historyListEl);
    }

    function addToHistory(file, data) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function () {
            const details = data.disease_details || {};
            scanHistory.unshift({ image: reader.result, disease: data.prediction, crop: details.crop || 'Unknown', date: new Date().toLocaleString() });
            if (scanHistory.length > 10) scanHistory = scanHistory.slice(0, 10);
            localStorage.setItem('agrilens_history', JSON.stringify(scanHistory));
        };
    }


    function renderHistory(listEl) {
        if (!listEl) return;
        listEl.innerHTML = '';
        scanHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<img src="${item.image}" alt="scan"><div><strong>${item.disease}</strong><p>${item.crop} — ${item.date}</p></div>`;
            listEl.appendChild(div);
        });
    }

    // ===== SETUP CHATBOTS =====
    function setupModeChatbot(inputId, btnId, messagesId, getContextStr) {
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);
        const messages = document.getElementById(messagesId);
        if (!input || !btn || !messages) return;
        
        async function sendChatMessage() {
            const msg = input.value.trim();
            if (!msg) return;
            input.value = '';
            
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-msg user-msg';
            userMsg.textContent = msg;
            messages.appendChild(userMsg);
            messages.scrollTop = messages.scrollHeight;

            const context = getContextStr();
            try {
                const res = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: msg, context, lang: getLang() })
                });
                const data = await res.json();
                const aiMsg = document.createElement('div');
                aiMsg.className = 'chat-msg ai-msg';
                const formatted = (data.reply || 'Sorry, no response.')
                    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px; margin: 8px 0; display:block;">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
                aiMsg.innerHTML = `<i class="fa-solid fa-leaf"></i> ${formatted}`;
                messages.appendChild(aiMsg);
                messages.scrollTop = messages.scrollHeight;
            } catch (e) {
                const errMsg = document.createElement('div');
                errMsg.className = 'chat-msg ai-msg';
                errMsg.innerHTML = `<i class="fa-solid fa-leaf"></i> Sorry, connection error.`;
                messages.appendChild(errMsg);
            }
        }
        btn.addEventListener('click', sendChatMessage);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
    }

    setupModeChatbot('disease-chat-input', 'disease-chat-send-btn', 'disease-chatbot-messages', 
        () => lastResult ? `Prediction: ${lastResult.prediction || 'Unknown'}, Crop: ${lastResult.disease_details?.crop || 'Unknown'}` : ''
    );
    
    setupModeChatbot('soil-chat-input', 'soil-chat-send-btn', 'soil-chatbot-messages', 
        () => soilLastResult ? `Soil type: ${soilLastResult.prediction || 'Unknown'}, Crop: ${soilLastResult.disease_details?.crop || 'Unknown'}` : ''
    );

    setupModeChatbot('fert-chat-input', 'fert-chat-send-btn', 'fert-chatbot-messages', 
        () => fertLastResult ? `Label: ${fertLastResult.prediction || 'Unknown'}, Crop: ${fertLastResult.disease_details?.crop || 'Unknown'}` : ''
    );

    // ===================================================
    // SOIL ANALYZER SCANNER
    // ===================================================
    const soilDropZone = document.getElementById('soil-drop-zone');
    const soilFileInput = document.getElementById('soil-file-input');
    const soilDefaultState = document.getElementById('soil-default-state');
    const soilPreviewState = document.getElementById('soil-preview-state');
    const soilImagePreview = document.getElementById('soil-image-preview');
    const soilRemoveBtn = document.getElementById('soil-remove-btn');
    const soilAnalyzeBtn = document.getElementById('soil-analyze-btn');
    const soilLoadingOverlay = document.getElementById('soil-loading-overlay');
    const soilResultsSection = document.getElementById('soil-results-section');
    const soilScanNewBtn = document.getElementById('soil-scan-new-btn');

    let soilCurrentFile = null;

    if (soilDropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
            soilDropZone.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(e => soilDropZone.addEventListener(e, () => soilDropZone.classList.add('dragover'), false));
        ['dragleave', 'drop'].forEach(e => soilDropZone.addEventListener(e, () => soilDropZone.classList.remove('dragover'), false));
        soilDropZone.addEventListener('drop', e => handleSoilFiles(e.dataTransfer.files), false);
        soilDropZone.addEventListener('click', () => { if (!soilCurrentFile && soilFileInput) soilFileInput.click(); });
    }
    if (soilFileInput) {
        soilFileInput.addEventListener('change', function () { if (this.files && this.files.length > 0) handleSoilFiles(this.files); });
    }

    function handleSoilFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.match('image.*')) { alert('Please upload an image file.'); return; }
            soilCurrentFile = file;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                if (soilImagePreview) soilImagePreview.src = reader.result;
                if (soilDefaultState) soilDefaultState.classList.add('hidden');
                if (soilPreviewState) soilPreviewState.classList.remove('hidden');
                if (soilAnalyzeBtn) soilAnalyzeBtn.disabled = false;
            };
        }
    }

    if (soilRemoveBtn) {
        soilRemoveBtn.addEventListener('click', e => {
            e.stopPropagation();
            soilCurrentFile = null;
            if (soilFileInput) soilFileInput.value = '';
            if (soilImagePreview) soilImagePreview.src = '#';
            if (soilPreviewState) soilPreviewState.classList.add('hidden');
            if (soilDefaultState) soilDefaultState.classList.remove('hidden');
            if (soilAnalyzeBtn) soilAnalyzeBtn.disabled = true;
        });
    }

    if (soilScanNewBtn) {
        soilScanNewBtn.addEventListener('click', () => {
            if (soilResultsSection) soilResultsSection.classList.add('hidden');
            soilCurrentFile = null;
            if (soilFileInput) soilFileInput.value = '';
            if (soilImagePreview) soilImagePreview.src = '#';
            if (soilPreviewState) soilPreviewState.classList.add('hidden');
            if (soilDefaultState) soilDefaultState.classList.remove('hidden');
            if (soilAnalyzeBtn) soilAnalyzeBtn.disabled = true;
        });
    }

    if (soilAnalyzeBtn) {
        soilAnalyzeBtn.addEventListener('click', async () => {
            if (!soilCurrentFile) return;
            const formData = new FormData();
            formData.append('file', soilCurrentFile);
            formData.append('lang', getLang());
            if (soilLoadingOverlay) soilLoadingOverlay.classList.remove('hidden');
            soilAnalyzeBtn.disabled = true;

            try {
                const response = await fetch('/analyze-soil', { method: 'POST', body: formData });
                if (soilLoadingOverlay) soilLoadingOverlay.classList.add('hidden');
                if (!response.ok) { alert('Error analyzing soil image. Please try again.'); soilAnalyzeBtn.disabled = false; return; }
                const data = await response.json();
                soilLastResult = data;
                displaySoilResults(data);
            } catch (error) {
                if (soilLoadingOverlay) soilLoadingOverlay.classList.add('hidden');
                alert('Connection error. Please try again.');
                soilAnalyzeBtn.disabled = false;
            }
        });
    }

    function displaySoilResults(data) {
        if (soilResultsSection) soilResultsSection.classList.remove('hidden');
        const el = (id) => document.getElementById(id);
        const soilResultImg = el('soil-result-image');
        if (soilResultImg && soilImagePreview) soilResultImg.src = soilImagePreview.src;

        // Use disease_details from the API response
        const details = data.disease_details || {};
        const conf = data.confidence || 92.0;
        if (el('soil-conf-value')) el('soil-conf-value').textContent = conf.toFixed(1) + '%';
        if (el('soil-conf-bar')) el('soil-conf-bar').style.width = conf + '%';
        if (el('soil-health-score')) el('soil-health-score').textContent = details.health_score || 80;
        if (el('soil-crop-tag')) el('soil-crop-tag').textContent = data.prediction || 'Unknown Soil';
        if (el('soil-type-name')) el('soil-type-name').textContent = details.soil_name || data.prediction || 'Soil Analysis Complete';
        if (el('soil-scientific-name')) el('soil-scientific-name').textContent = details.scientific_name || '';
        if (el('soil-severity-badge')) el('soil-severity-badge').textContent = details.severity || 'Analysis Complete';
        if (el('soil-characteristics-text')) el('soil-characteristics-text').textContent = details.symptoms || details.characteristics || 'See full report below.';
        if (el('soil-composition-text')) el('soil-composition-text').textContent = details.causes || details.composition || 'Composition data available.';
        if (el('soil-crops-text')) el('soil-crops-text').textContent = details.prevention || details.recommended_crops || 'See recommendations.';
        if (el('soil-treatment-text')) el('soil-treatment-text').textContent = details.treatment || 'Follow the AI recommendations below.';

        const soilFertilizersList = el('soil-fertilizers-list');
        if (soilFertilizersList) {
            soilFertilizersList.innerHTML = '';
            const recs = details.chemicals || details.recommendations || ['Consult a local agricultural expert for detailed soil advice.'];
            recs.forEach(r => {
                const li = document.createElement('li');
                li.textContent = r;
                soilFertilizersList.appendChild(li);
            });
        }
    }

    // ===================================================
    // FERTILIZER OCR SCANNER
    // ===================================================
    const fertDropZone = document.getElementById('fert-drop-zone');
    const fertFileInput = document.getElementById('fert-file-input');
    const fertDefaultState = document.getElementById('fert-default-state');
    const fertPreviewState = document.getElementById('fert-preview-state');
    const fertImagePreview = document.getElementById('fert-image-preview');
    const fertRemoveBtn = document.getElementById('fert-remove-btn');
    const fertAnalyzeBtn = document.getElementById('fert-analyze-btn');
    const fertLoadingOverlay = document.getElementById('fert-loading-overlay');
    const fertResultsSection = document.getElementById('fert-results-section');
    const fertScanNewBtn = document.getElementById('fert-scan-new-btn');

    let fertCurrentFile = null;

    if (fertDropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
            fertDropZone.addEventListener(e, ev => { ev.preventDefault(); ev.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(e => fertDropZone.addEventListener(e, () => fertDropZone.classList.add('dragover'), false));
        ['dragleave', 'drop'].forEach(e => fertDropZone.addEventListener(e, () => fertDropZone.classList.remove('dragover'), false));
        fertDropZone.addEventListener('drop', e => handleFertFiles(e.dataTransfer.files), false);
        fertDropZone.addEventListener('click', () => { if (!fertCurrentFile && fertFileInput) fertFileInput.click(); });
    }
    if (fertFileInput) {
        fertFileInput.addEventListener('change', function () { if (this.files && this.files.length > 0) handleFertFiles(this.files); });
    }

    function handleFertFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (!file.type.match('image.*')) { alert('Please upload an image file.'); return; }
            fertCurrentFile = file;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                if (fertImagePreview) fertImagePreview.src = reader.result;
                if (fertDefaultState) fertDefaultState.classList.add('hidden');
                if (fertPreviewState) fertPreviewState.classList.remove('hidden');
                if (fertAnalyzeBtn) fertAnalyzeBtn.disabled = false;
            };
        }
    }

    if (fertRemoveBtn) {
        fertRemoveBtn.addEventListener('click', e => {
            e.stopPropagation();
            fertCurrentFile = null;
            if (fertFileInput) fertFileInput.value = '';
            if (fertImagePreview) fertImagePreview.src = '#';
            if (fertPreviewState) fertPreviewState.classList.add('hidden');
            if (fertDefaultState) fertDefaultState.classList.remove('hidden');
            if (fertAnalyzeBtn) fertAnalyzeBtn.disabled = true;
        });
    }

    if (fertScanNewBtn) {
        fertScanNewBtn.addEventListener('click', () => {
            if (fertResultsSection) fertResultsSection.classList.add('hidden');
            fertCurrentFile = null;
            if (fertFileInput) fertFileInput.value = '';
            if (fertImagePreview) fertImagePreview.src = '#';
            if (fertPreviewState) fertPreviewState.classList.add('hidden');
            if (fertDefaultState) fertDefaultState.classList.remove('hidden');
            if (fertAnalyzeBtn) fertAnalyzeBtn.disabled = true;
        });
    }

    if (fertAnalyzeBtn) {
        fertAnalyzeBtn.addEventListener('click', async () => {
            if (!fertCurrentFile) return;
            const formData = new FormData();
            formData.append('file', fertCurrentFile);
            formData.append('lang', getLang());
            if (fertLoadingOverlay) fertLoadingOverlay.classList.remove('hidden');
            fertAnalyzeBtn.disabled = true;

            try {
                const response = await fetch('/analyze-fertilizer', { method: 'POST', body: formData });
                if (fertLoadingOverlay) fertLoadingOverlay.classList.add('hidden');
                if (!response.ok) { alert('Error analyzing fertilizer label. Please try again.'); fertAnalyzeBtn.disabled = false; return; }
                const data = await response.json();
                fertLastResult = data;
                displayFertResults(data);
            } catch (error) {
                if (fertLoadingOverlay) fertLoadingOverlay.classList.add('hidden');
                alert('Connection error. Please try again.');
                fertAnalyzeBtn.disabled = false;
            }
        });
    }

    function displayFertResults(data) {
        if (fertResultsSection) fertResultsSection.classList.remove('hidden');
        const el = (id) => document.getElementById(id);
        const fertResultImg = el('fert-result-image');
        if (fertResultImg && fertImagePreview) fertResultImg.src = fertImagePreview.src;

        // The backend returns: { success, prediction, confidence, disease_details, image_url }
        const details = data.disease_details || {};
        const conf = data.confidence || 98.5;
        if (el('fert-conf-value')) el('fert-conf-value').textContent = conf.toFixed(1) + '%';
        if (el('fert-conf-bar')) el('fert-conf-bar').style.width = conf + '%';
        if (el('fert-health-score')) el('fert-health-score').textContent = details.health_score || 85;
        if (el('fert-crop-tag')) el('fert-crop-tag').textContent = details.crop || data.prediction || 'General Use';
        if (el('fert-type-name')) el('fert-type-name').textContent = data.prediction || 'Label Analysis Complete';
        if (el('fert-scientific-name')) el('fert-scientific-name').textContent = details.scientific_name || '';
        if (el('fert-severity-badge')) el('fert-severity-badge').textContent = details.severity || 'Moderate';
        if (el('fert-ingredients-text')) el('fert-ingredients-text').textContent = details.symptoms || details.active_ingredients || 'See label for ingredients.';
        if (el('fert-usage-text')) el('fert-usage-text').textContent = details.causes || details.usage_instructions || 'Follow manufacturer instructions.';
        if (el('fert-safety-text')) el('fert-safety-text').textContent = details.prevention || details.safety_precautions || 'Use with caution.';
        if (el('fert-targets-text')) el('fert-targets-text').textContent = details.treatment || details.treatment_practices || 'Consult packaging for full treatment details.';

        const fertRecsList = el('fert-recommendations-list');
        if (fertRecsList) {
            fertRecsList.innerHTML = '';
            const recs = details.chemicals || details.recommendations || ['Always read the label before use.', 'Wear protective gloves when handling.'];
            recs.forEach(r => {
                const li = document.createElement('li');
                li.textContent = r;
                fertRecsList.appendChild(li);
            });
        }
    }

    // ===================================================
    // CROP PLANNING AI CHATBOT
    // ===================================================
    const cropChatInput = document.getElementById('crop-chat-input');
    const cropChatSendBtn = document.getElementById('crop-chat-send-btn');
    const cropChatMessages = document.getElementById('crop-chat-messages');
    const clearCropChatBtn = document.getElementById('clear-crop-chat');

    function addCropMsg(text, isUser) {
        if (!cropChatMessages) return null;
        const msg = document.createElement('div');
        if (isUser) {
            msg.className = 'user-crop-msg';
            msg.textContent = text;
        } else {
            msg.className = 'chat-msg crop-ai-msg';
            const formatted = text
                .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%; border-radius:8px; margin: 8px 0; display:block;">')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>)/gs, '<ul style="padding-left:20px;margin:8px 0">$1</ul>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');
            msg.innerHTML = `<div class="chat-avatar-sm"><i class="fa-solid fa-robot"></i></div><div class="chat-bubble">${formatted}</div>`;
        }
        cropChatMessages.appendChild(msg);
        cropChatMessages.scrollTop = cropChatMessages.scrollHeight;
        return msg;
    }

    function addThinking() {
        if (!cropChatMessages) return null;
        const msg = document.createElement('div');
        msg.className = 'chat-msg crop-ai-msg';
        msg.id = 'thinking-indicator';
        msg.innerHTML = `<div class="chat-avatar-sm"><i class="fa-solid fa-robot"></i></div><div class="chat-bubble thinking-dots"><span></span><span></span><span></span></div>`;
        cropChatMessages.appendChild(msg);
        cropChatMessages.scrollTop = cropChatMessages.scrollHeight;
        return msg;
    }

    async function sendCropMessage() {
        if (!cropChatInput) return;
        const message = cropChatInput.value.trim();
        if (!message) return;
        cropChatInput.value = '';
        addCropMsg(message, true);
        const thinkingEl = addThinking();
        try {
            const res = await fetch('/crop-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, lang: getLang() })
            });
            const data = await res.json();
            if (thinkingEl) thinkingEl.remove();
            addCropMsg(data.reply || 'Sorry, no response received.', false);
        } catch (e) {
            if (thinkingEl) thinkingEl.remove();
            addCropMsg('Sorry, could not connect to AgriBot. Please check your internet connection.', false);
        }
    }

    if (cropChatSendBtn) cropChatSendBtn.addEventListener('click', sendCropMessage);
    if (cropChatInput) cropChatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendCropMessage(); });

    if (clearCropChatBtn) {
        clearCropChatBtn.addEventListener('click', () => {
            if (cropChatMessages) {
                cropChatMessages.innerHTML = `
                    <div class="chat-msg crop-ai-msg">
                        <div class="chat-avatar-sm"><i class="fa-solid fa-robot"></i></div>
                        <div class="chat-bubble">Chat cleared! Ask me anything about farming. 🌱</div>
                    </div>`;
            }
        });
    }

    // ===== WEATHER WIDGET =====
    const weatherBtn = document.getElementById('weather-btn');
    const weatherLocation = document.getElementById('weather-location');
    if (weatherBtn) {
        weatherBtn.addEventListener('click', async () => {
            const location = weatherLocation ? weatherLocation.value.trim() : '';
            if (!location) return;
            if (weatherLocation) weatherLocation.value = '';
            addCropMsg(`Get weather advice for ${location}`, true);
            const thinkingEl = addThinking();
            try {
                let bodyData = { location, lang: getLang() };
                if (window.lastCoords) bodyData.coords = window.lastCoords;
                
                const res = await fetch('/weather', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                window.lastCoords = null; // reset
                if (thinkingEl) thinkingEl.remove();
                addCropMsg(data.reply || 'Sorry, no response received.', false);
            } catch (e) {
                if (thinkingEl) thinkingEl.remove();
                addCropMsg('Sorry, could not connect to Weather AI right now.', false);
            }
        });
    }
    if (weatherLocation) {
        weatherLocation.addEventListener('keydown', e => { if (e.key === 'Enter' && weatherBtn) weatherBtn.click(); });
    }

    // ===== MARKET WIDGET =====
    const marketBtn = document.getElementById('market-btn');
    const marketCrop = document.getElementById('market-crop');
    if (marketBtn) {
        marketBtn.addEventListener('click', async () => {
            const crop = marketCrop ? marketCrop.value.trim() : '';
            if (!crop) return;
            if (marketCrop) marketCrop.value = '';
            addCropMsg(`Check market trends for ${crop}`, true);
            const thinkingEl = addThinking();
            try {
                let bodyData = { crop, lang: getLang() };
                if (window.lastCoords) bodyData.coords = window.lastCoords;

                const res = await fetch('/market', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                window.lastCoords = null; // reset
                if (thinkingEl) thinkingEl.remove();
                addCropMsg(data.reply || 'Sorry, no response received.', false);
            } catch (e) {
                if (thinkingEl) thinkingEl.remove();
                addCropMsg('Sorry, could not connect to Market AI right now.', false);
            }
        });
    }
    if (marketCrop) {
        marketCrop.addEventListener('keydown', e => { if (e.key === 'Enter' && marketBtn) marketBtn.click(); });
    }

    // ===== GPS WIDGETS =====
    function setupGPSBtn(btnId, targetInputId, defaultTopicMsg) {
        const btn = document.getElementById(btnId);
        const targetInput = document.getElementById(targetInputId);
        if(!btn || !targetInput) return;
        btn.addEventListener('click', () => {
            if(!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                return;
            }
            btn.style.color = '#ef4444';
            navigator.geolocation.getCurrentPosition((pos) => {
                window.lastCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                targetInput.value = "My GPS Location";
                btn.style.color = 'var(--primary-color)';
                
                // Trigger Pest Warning check automatically
                fetch('/pest_warning', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coords: window.lastCoords, lang: getLang() })
                }).then(r=>r.json()).then(data => {
                    if(data.success && data.warning) {
                        const banner = document.getElementById('pest-warning-banner');
                        document.getElementById('pest-warning-text').innerText = data.warning;
                        if(banner) banner.classList.remove('hidden');
                    }
                }).catch(e=>console.log("Pest warning fetch failed", e));

            }, () => {
                alert('Unable to retrieve your location');
                btn.style.color = 'var(--primary-color)';
            });
        });
    }

    setupGPSBtn('weather-gps-btn', 'weather-location');
    setupGPSBtn('market-gps-btn', 'market-crop');

    // ===== CROP CALENDAR SCHEDULER =====
    const calGenBtn = document.getElementById('calendar-generate-btn');
    if (calGenBtn) {
        calGenBtn.addEventListener('click', async () => {
            const crop = document.getElementById('calendar-crop').value.trim();
            const date = document.getElementById('calendar-date').value;
            
            if(!crop || !date) {
                alert("Please enter both Crop Name and Planting Date!");
                return;
            }

            document.getElementById('calendar-loading').classList.remove('hidden');
            document.getElementById('calendar-results').classList.add('hidden');
            calGenBtn.disabled = true;

            try {
                const res = await fetch('/calendar_schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ crop, date, lang: getLang() })
                });
                const data = await res.json();
                
                document.getElementById('calendar-loading').classList.add('hidden');
                calGenBtn.disabled = false;

                if (data.success && data.timeline) {
                    document.getElementById('calendar-results').classList.remove('hidden');
                    const timelineContainer = document.getElementById('timeline-container');
                    timelineContainer.innerHTML = '';
                    
                    data.timeline.forEach((item, index) => {
                        const div = document.createElement('div');
                        div.style.marginBottom = '20px';
                        div.style.position = 'relative';
                        div.innerHTML = `
                            <div style="position: absolute; left: -26px; top: 0; width: 12px; height: 12px; border-radius: 50%; background: #ec4899;"></div>
                            <h4 style="margin: 0 0 5px 0; color: #ec4899;">${item.date} (${item.stage})</h4>
                            <p style="margin: 0; color: var(--text-color);">${item.task}</p>
                        `;
                        timelineContainer.appendChild(div);
                    });
                    AgriDB.save('Crop Calendar', data.timeline);
                } else {
                    alert("Error: " + (data.error || "Failed to parse AI schedule."));
                }
            } catch(e) {
                document.getElementById('calendar-loading').classList.add('hidden');
                calGenBtn.disabled = false;
                alert("Connection failed.");
            }
        });
    }

    // ===== EQUIPMENT ADVISOR =====
    const equipBtn = document.getElementById('equipment-btn');
    if (equipBtn) {
        equipBtn.addEventListener('click', async () => {
            const size = document.getElementById('equipment-size').value;
            const crop = document.getElementById('equipment-crop').value;
            if(!size || !crop) return alert('Enter both size and crop.');
            
            document.getElementById('equipment-loading').classList.remove('hidden');
            document.getElementById('equipment-results').classList.add('hidden');
            try {
                const res = await fetch('/equipment_advisor', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ size, crop, lang: getLang() }) });
                const data = await res.json();
                document.getElementById('equipment-loading').classList.add('hidden');
                if(data.success) {
                    let html = `<h3 style="color: #f59e0b; margin-bottom: 10px;">${data.data.summary}</h3>`;
                    data.data.recommendations.forEach(r => {
                        html += `<div style="background: rgba(245,158,11,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #f59e0b;">
                                    <strong>${r.machine}</strong> <span style="badge; background: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; margin-left: 10px;">${r.action} (${r.cost_estimate})</span>
                                    <p style="margin: 5px 0 0; font-size: 0.9rem;">${r.reason}</p>
                                 </div>`;
                    });
                    document.getElementById('equipment-content').innerHTML = html;
                    document.getElementById('equipment-results').classList.remove('hidden');
                    AgriDB.save('Equipment Advisor', data.data);
                } else alert('Error: ' + data.error);
            } catch(e) { 
                document.getElementById('equipment-loading').classList.add('hidden');
                alert('Connection Error'); 
            }
        });
        setupPDF('equipment-pdf-btn', 'equipment-content', 'equipment_report.pdf');
    }

    // ===== PROFIT CALCULATOR =====
    const profitBtn = document.getElementById('profit-btn');
    if (profitBtn) {
        profitBtn.addEventListener('click', async () => {
            const crop = document.getElementById('profit-crop').value;
            const area = document.getElementById('profit-area').value;
            const yield_est = document.getElementById('profit-yield').value;
            if(!crop || !area || !yield_est) return alert('Enter all factors.');
            
            document.getElementById('profit-loading').classList.remove('hidden');
            document.getElementById('profit-results').classList.add('hidden');
            try {
                const res = await fetch('/profit_calculator', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ crop, area, yield_est, lang: getLang() }) });
                const data = await res.json();
                document.getElementById('profit-loading').classList.add('hidden');
                if(data.success) {
                    let html = `<h3 style="color: #10b981; margin-bottom: 10px;"><i class="fa-solid fa-chart-pie"></i> Financial Breakdown</h3>`;
                    data.data.costs.forEach(c => {
                        html += `<div style="display: flex; justify-content: space-between; border-bottom: 1px dotted var(--border-color); padding: 5px 0;"><span>${c.category}</span> <strong>${c.amount}</strong></div>`;
                    });
                    html += `
                        <div style="margin-top: 15px; padding: 15px; background: rgba(16,185,129,0.1); border-radius: 8px;">
                            <p style="display: flex; justify-content: space-between; margin: 0 0 5px;"><span>Total Cost:</span> <strong>${data.data.total_cost}</strong></p>
                            <p style="display: flex; justify-content: space-between; margin: 0 0 5px;"><span>Expected Revenue:</span> <strong style="color: #10b981;">${data.data.expected_revenue}</strong></p>
                            <h3 style="margin: 10px 0 0; text-align: center; color: #10b981; font-size: 1.5rem;">Net: ${data.data.profit_margin}</h3>
                        </div>
                        <p style="margin-top: 15px; font-style: italic; text-align: center;">"${data.data.advice}"</p>
                    `;
                    document.getElementById('profit-content').innerHTML = html;
                    document.getElementById('profit-results').classList.remove('hidden');
                    AgriDB.save('Profit Simulator', data.data);
                } else alert('Error: ' + data.error);
            } catch(e) { document.getElementById('profit-loading').classList.add('hidden'); alert('Connection Error'); }
        });
        setupPDF('profit-pdf-btn', 'profit-content', 'profit_report.pdf');
    }

    // ===== GOV SCHEMES FINDER =====
    const schemeBtn = document.getElementById('schemes-btn');
    if (schemeBtn) {
        schemeBtn.addEventListener('click', async () => {
            const state = document.getElementById('scheme-state').value;
            const crop = document.getElementById('scheme-crop').value;
            const cat = document.getElementById('scheme-cat').value;
            if(!state) return alert('State is required.');
            
            document.getElementById('schemes-loading').classList.remove('hidden');
            document.getElementById('schemes-results').classList.add('hidden');
            try {
                const res = await fetch('/gov_schemes', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ state, crop, cat, lang: getLang() }) });
                const data = await res.json();
                document.getElementById('schemes-loading').classList.add('hidden');
                if(data.success) {
                    let html = `<h3 style="color: #3b82f6; margin-bottom: 20px;">Eligible Schemes</h3>`;
                    data.data.schemes.forEach(s => {
                        html += `<div style="background: rgba(59,130,246,0.05); border-left: 3px solid #3b82f6; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                                    <h4 style="color: #3b82f6; margin: 0 0 10px;">${s.scheme_name}</h4>
                                    <p style="margin: 0 0 5px;"><strong>Benefits:</strong> ${s.benefits}</p>
                                    <p style="margin: 0 0 5px;"><strong>Eligibility:</strong> ${s.eligibility}</p>
                                    <p style="margin: 0; color: var(--text-muted);"><i class="fa-solid fa-link"></i> ${s.how_to_apply}</p>
                                 </div>`;
                    });
                    document.getElementById('schemes-content').innerHTML = html;
                    document.getElementById('schemes-results').classList.remove('hidden');
                    AgriDB.save('Gov Schemes', data.data);
                } else alert('Error: ' + data.error);
            } catch(e) { document.getElementById('schemes-loading').classList.add('hidden'); alert('Connection Error'); }
        });
        setupPDF('schemes-pdf-btn', 'schemes-content', 'schemes_report.pdf');
    }

    // Automatic Location Detection on Startup
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            window.userLat = position.coords.latitude;
            window.userLon = position.coords.longitude;
            console.log("Automatic Location Detected:", window.userLat, window.userLon);
        }, err => {
            console.log("Location access denied or failed.", err);
        }, { timeout: 10000 });
    }

}); // End DOMContentLoaded
