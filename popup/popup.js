document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Settings elements
    const apiProvider = document.getElementById('apiProvider');
    const apiEndpoint = document.getElementById('apiEndpoint');
    const apiKey = document.getElementById('apiKey');
    const apiModel = document.getElementById('apiModel');
    const togglePassword = document.getElementById('togglePassword');
    const apiKeyError = document.getElementById('apiKeyError');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const apiStatusDot = document.getElementById('apiStatusDot');
    const apiStatusText = document.getElementById('apiStatusText');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const focusPinned = document.getElementById('focusPinned');
    const focusPinnedGoal = document.getElementById('focusPinnedGoal');
    const popupFocusGoal = document.getElementById('popupFocusGoal');
    const focusActionBtn = document.getElementById('focusActionBtn');

    // Highlights elements
    const highlightSearch = document.getElementById('highlightSearch');
    const highlightsList = document.getElementById('highlightsList');
    const clearAllBtn = document.getElementById('clearAllBtn');

    let allHighlights = [];

    // Configuration templates
    const providerConfig = {
        pollinations: { endpoint: 'https://text.pollinations.ai/openai', model: 'openai' },
        openai: { endpoint: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
        groq: { endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'qwen/qwen3.8-27b' },
        openrouter: { endpoint: 'https://openrouter.ai/api/v1/chat/completions', model: 'meta-llama/llama-3.3-70b-instruct' },
        custom: { endpoint: '', model: '' }
    };

    // Initialize
    loadSettings();
    loadHighlights();
    loadFocusMode();

    function loadFocusMode() {
        chrome.storage.local.get(['aetherFocusMode'], result => renderFocusMode(result.aetherFocusMode || null));
    }

    function renderFocusMode(focus) {
        const active = !!focus?.active;
        focusPinned.classList.toggle('active', active);
        focusPinnedGoal.textContent = active ? focus.goal : '';
        if (active) {
            popupFocusGoal.value = focus.goal || '';
            document.querySelector(`input[name="popupFocusMode"][value="${focus.mode}"]`).checked = true;
            focusActionBtn.textContent = 'Stop Focus';
            focusActionBtn.classList.add('focus-stop');
        } else {
            focusActionBtn.textContent = 'Start Focus';
            focusActionBtn.classList.remove('focus-stop');
        }
    }

    focusActionBtn.addEventListener('click', () => {
        chrome.storage.local.get(['aetherFocusMode'], result => {
            if (result.aetherFocusMode?.active) {
                chrome.runtime.sendMessage({ type: 'setFocusMode', active: false }, response => {
                    if (response?.success) { renderFocusMode(null); showToast('Focus mode stopped'); }
                });
                return;
            }
            const goal = popupFocusGoal.value.trim();
            if (!goal) { popupFocusGoal.focus(); return; }
            const mode = document.querySelector('input[name="popupFocusMode"]:checked').value;
            chrome.runtime.sendMessage({ type: 'setFocusMode', active: true, mode, goal }, response => {
                if (response?.success) { renderFocusMode(response.focus); showToast('Focus mode started'); }
            });
        });
    });

    // Tab Switching Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Settings Logic
    apiProvider.addEventListener('change', () => {
        const config = providerConfig[apiProvider.value];
        if (config) {
            apiEndpoint.value = config.endpoint;
            apiModel.value = config.model;
        }
    });

    togglePassword.addEventListener('click', () => {
        const isPassword = apiKey.type === 'password';
        apiKey.type = isPassword ? 'text' : 'password';
        
        // Toggle icon
        if (isPassword) {
            togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
            togglePassword.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
    });

    saveSettingsBtn.addEventListener('click', () => {
        const key = apiKey.value.trim();
        const provider = apiProvider.value;
        
        if (!key && provider !== 'pollinations') {
            apiKeyError.style.display = 'block';
            apiKey.style.borderColor = 'var(--error-color)';
            return;
        }
        
        apiKeyError.style.display = 'none';
        apiKey.style.borderColor = 'var(--border-light)';

        const settings = {
            apiProvider: apiProvider.value,
            apiEndpoint: apiEndpoint.value.trim(),
            apiKey: key,
            apiModel: apiModel.value.trim()
        };

        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set(settings, () => {
                showToast('Settings saved successfully!');
                checkApiStatus();
            });
        } else {
            // Fallback for development/testing outside extension environment
            localStorage.setItem('aether_settings', JSON.stringify(settings));
            showToast('Settings saved locally!');
            checkApiStatus();
        }
    });

    function loadSettings() {
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['apiProvider', 'apiEndpoint', 'apiKey', 'apiModel'], (result) => {
                applySettings(result);
            });
        } else {
            // Fallback for testing
            const localSettings = JSON.parse(localStorage.getItem('aether_settings') || '{}');
            applySettings(localSettings);
        }
    }

    function applySettings(result) {
        if (result.apiProvider) {
            apiProvider.value = result.apiProvider;
        } else {
            apiProvider.value = 'groq';
        }
        
        if (result.apiEndpoint) {
            apiEndpoint.value = result.apiEndpoint;
        } else if (result.apiProvider && providerConfig[result.apiProvider]) {
            apiEndpoint.value = providerConfig[result.apiProvider].endpoint;
        } else {
            apiEndpoint.value = providerConfig.groq.endpoint;
        }
        
        if (result.apiKey) apiKey.value = result.apiKey;
        
        if (result.apiModel) {
            apiModel.value = result.apiModel;
        } else if (result.apiProvider && providerConfig[result.apiProvider]) {
            apiModel.value = providerConfig[result.apiProvider].model;
        } else {
            apiModel.value = providerConfig.groq.model;
        }
        
        checkApiStatus();
    }

    function checkApiStatus() {
        const key = apiKey.value.trim();
        const provider = apiProvider.value;
        if (key || provider === 'pollinations') {
            apiStatusDot.className = 'status-dot configured';
            apiStatusText.textContent = provider === 'pollinations' ? 'Free API ready' : 'API configured';
        } else {
            apiStatusDot.className = 'status-dot missing';
            apiStatusText.textContent = 'API key required';
        }
    }

    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Highlights Logic
    highlightSearch.addEventListener('input', (e) => {
        filterHighlights(e.target.value);
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all highlights?')) {
            clearAllHighlights();
        }
    });

    function loadHighlights() {
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['highlights'], (result) => {
                allHighlights = result.highlights || [];
                renderHighlights(allHighlights);
            });
        } else {
            // Mock data for testing if not in extension environment
            const mock = localStorage.getItem('aether_highlights');
            allHighlights = mock ? JSON.parse(mock) : [];
            renderHighlights(allHighlights);
        }
    }

    function filterHighlights(query) {
        query = query.toLowerCase();
        const filtered = allHighlights.filter(h => 
            (h.text && h.text.toLowerCase().includes(query)) || 
            (h.tag && h.tag.toLowerCase().includes(query)) ||
            (h.tldr && h.tldr.toLowerCase().includes(query))
        );
        renderHighlights(filtered);
    }

    function renderHighlights(highlightsToRender) {
        highlightsList.innerHTML = '';
        
        if (!highlightsToRender || highlightsToRender.length === 0) {
            clearAllBtn.style.display = 'none';
            if (allHighlights.length === 0) {
                highlightsList.innerHTML = `
                    <div class="empty-state">
                        No highlights yet. Select text on any webpage and use the Summarize tool.
                    </div>
                `;
            } else {
                highlightsList.innerHTML = `
                    <div class="empty-state">
                        No matches found for your filter.
                    </div>
                `;
            }
            return;
        }

        clearAllBtn.style.display = 'block';

        highlightsToRender.forEach((highlight, index) => {
            const card = document.createElement('div');
            card.className = 'highlight-card';
            
            const tagClass = highlight.tag ? `tag-${highlight.tag.toLowerCase()}` : 'tag-general';
            const tagText = highlight.tag || 'General';
            
            let truncatedText = highlight.text || '';
            if (truncatedText.length > 100) {
                truncatedText = truncatedText.substring(0, 100) + '...';
            }
            
            // Find actual index in original array for deletion
            const originalIndex = allHighlights.findIndex(h => h.id === highlight.id || (h.timestamp === highlight.timestamp && h.text === highlight.text));
            const delIndex = originalIndex >= 0 ? originalIndex : index;

            card.innerHTML = `
                <div class="card-header">
                    <span class="tag-pill ${tagClass}">${tagText}</span>
                    <span class="timestamp">${formatDate(highlight.timestamp)}</span>
                </div>
                <div class="highlight-text">"${truncatedText}"</div>
                ${highlight.tldr ? `<div class="highlight-tldr">✨ ${highlight.tldr}</div>` : ''}
                <a href="${highlight.url || '#'}" class="source-link" target="_blank" title="${highlight.title || highlight.url || 'Source'}">
                    🔗 ${highlight.title || highlight.url || 'Source Link'}
                </a>
                <button class="delete-btn" data-index="${delIndex}" title="Delete highlight">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;
            
            highlightsList.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                deleteHighlight(idx);
            });
        });
    }

    function deleteHighlight(index) {
        if (index >= 0 && index < allHighlights.length) {
            allHighlights.splice(index, 1);
            saveHighlightsToStorage();
            filterHighlights(highlightSearch.value);
        }
    }

    function clearAllHighlights() {
        allHighlights = [];
        saveHighlightsToStorage();
        highlightSearch.value = '';
        renderHighlights(allHighlights);
    }

    function saveHighlightsToStorage() {
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ highlights: allHighlights });
        } else {
            localStorage.setItem('aether_highlights', JSON.stringify(allHighlights));
        }
    }

    function formatDate(timestamp) {
        if (!timestamp) return 'Unknown Date';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        
        const options = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    }
});
