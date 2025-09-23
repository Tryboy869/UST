const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const vm = require('vm');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '1mb' }));

// =============================================================================
// MODULE 1: INTERFACE MODULE (Frontend HTML intégré)
// =============================================================================
const frontendHTML = `<!DOCTYPE html>
<html lang="fr" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Universal Script Tester</title>
    
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Monaco Editor Loader -->
    <script src="https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js"></script>
    
    <style>
        @import url('https://rsms.me/inter/inter.css');
        html { font-family: 'Inter', sans-serif; }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #1f2937; }
        ::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 10px; border: 2px solid #1f2937; }
        ::-webkit-scrollbar-thumb:hover { background-color: #6b7280; }

        /* Prevent text selection during resize */
        .no-select { user-select: none; }

        /* Console styling */
        .console-output { white-space: pre-wrap; word-wrap: break-word; font-family: 'Fira Code', 'Menlo', 'Courier New', monospace; font-size: 0.875rem; }
        .console-output .log { color: #d1d5db; }
        .console-output .error { color: #f87171; }
        .console-output .info { color: #60a5fa; }
        .console-output .log-prefix { opacity: 0.5; margin-right: 0.5rem; }

        /* Active tab style */
        .tab-active { background-color: #111827; color: #a7f3d0; border-bottom: 2px solid #34d399; }
        
        /* Run button pulse animation on load */
        @keyframes pulse-emerald {
            0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
        }
        .pulse-on-load { animation: pulse-emerald 1.5s 1; }

        /* Simple spinner animation */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
    </style>
</head>
<body class="bg-slate-900 text-slate-300 h-full flex flex-col overflow-hidden antialiased">

    <!-- Header / Toolbar -->
    <header class="bg-slate-800/70 backdrop-blur-sm border-b border-slate-700 p-2 flex items-center justify-between flex-wrap gap-y-2 gap-x-4 shadow-lg z-20 flex-shrink-0">
        <!-- Logo -->
        <div class="flex items-center gap-3">
            <svg class="h-7 w-7 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 9-2-2-2 2M12 17V7"/><path d="M4 15h16"/><path d="M18 12h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M6 12H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2"/></svg>
            <h1 class="text-lg font-bold text-white">Script Tester</h1>
        </div>
        
        <!-- Language Selector -->
        <div class="flex-grow flex justify-center min-w-max sm:flex-grow-0">
            <div class="flex items-center bg-slate-700 rounded-lg p-1 text-sm">
                <button data-lang="javascript" class="lang-btn px-4 py-1 rounded-md transition-colors duration-200">JavaScript</button>
                <button data-lang="python" class="lang-btn px-4 py-1 rounded-md transition-colors duration-200">Python</button>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
             <button id="import-button" title="Importer un fichier" class="p-2 rounded-md hover:bg-slate-700 transition-colors duration-200">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </button>
            <input type="file" id="file-input" class="hidden" accept=".js,.py,.txt" />
            <button id="export-button" title="Exporter le code" class="p-2 rounded-md hover:bg-slate-700 transition-colors duration-200">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button id="run-button" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg transition-all duration-200 flex items-center gap-2 pulse-on-load">
                <svg id="run-icon" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <svg id="spinner-icon" class="h-5 w-5 spinner hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m16.5-6.5l-2.12 2.12M6.62 17.38l-2.12 2.12m12.72 0l-2.12-2.12M6.62 6.62l-2.12-2.12" /></svg>
                <span id="run-text">Exécuter</span>
            </button>
        </div>
    </header>

    <!-- Main Content Area -->
    <main id="main-container" class="flex-grow flex flex-col overflow-hidden">
        <!-- Code Editor -->
        <div id="editor-container" class="flex-grow w-full h-full min-h-[100px]"></div>

        <!-- Resize Handle -->
        <div id="resize-handle" class="w-full h-2 bg-slate-700/50 hover:bg-emerald-500/50 cursor-row-resize transition-colors duration-200 flex-shrink-0"></div>

        <!-- Output Panel -->
        <div id="output-panel" class="w-full h-[250px] bg-slate-800 flex flex-col flex-shrink-0 overflow-hidden">
            <!-- Panel Toolbar -->
            <div class="flex justify-between items-center border-b border-slate-700 flex-shrink-0">
                <div class="flex items-center text-sm">
                    <button data-tab="console" class="tab-btn px-4 py-2 transition-colors duration-200">Console</button>
                    <button data-tab="history" class="tab-btn px-4 py-2 transition-colors duration-200">Historique</button>
                </div>
                <div class="flex items-center mr-2">
                    <button id="copy-console-button" title="Copier les logs" class="p-2 rounded-md hover:bg-slate-700 transition-colors duration-200">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                    <button id="clear-console-button" title="Vider la console" class="p-2 rounded-md hover:bg-slate-700 transition-colors duration-200">
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
            
            <!-- Tab Contents -->
            <div class="flex-grow overflow-y-auto p-3">
                <div id="console-content" class="tab-content">
                    <div class="console-output">
                        <div><span class="log-prefix">&gt;</span><span class="info">Bienvenue ! Votre code s'exécutera ici.</span></div>
                    </div>
                </div>
                <div id="history-content" class="tab-content hidden">
                    <p class="text-slate-500 text-sm text-center mt-4">L'historique des exécutions apparaîtra ici.</p>
                </div>
            </div>
        </div>
    </main>

    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // DOM Elements
        const runButton = document.getElementById('run-button');
        const runText = document.getElementById('run-text');
        const runIcon = document.getElementById('run-icon');
        const spinnerIcon = document.getElementById('spinner-icon');
        const editorContainer = document.getElementById('editor-container');
        const outputPanel = document.getElementById('output-panel');
        const resizeHandle = document.getElementById('resize-handle');
        const mainContainer = document.getElementById('main-container');
        const consoleContent = document.getElementById('console-content');
        const historyContent = document.getElementById('history-content');
        const clearConsoleButton = document.getElementById('clear-console-button');
        const copyConsoleButton = document.getElementById('copy-console-button');
        const importButton = document.getElementById('import-button');
        const exportButton = document.getElementById('export-button');
        const fileInput = document.getElementById('file-input');

        // App State
        let state = {
            language: 'javascript',
            isExecuting: false,
            history: [],
            activeTab: 'console',
            sessionId: 'session-' + Date.now()
        };
        let editor;

        // Default Code Snippets
        const defaultCode = {
            javascript: \`// Bienvenue sur l'Universal Script Tester !
console.log("Démarrage du script JavaScript...");

function factorielle(n) {
    if (n < 0) return "Nombre négatif non supporté";
    if (n === 0) return 1;
    return n * factorielle(n - 1);
}

const num = 5;
console.log(\\\`La factorielle de \\\${num} est \\\${factorielle(num)}\\\`);

// Test d'une boucle
for (let i = 1; i <= 3; i++) {
    console.log(\\\`Itération \\\${i}\\\`);
}\`,
            python: \`# Bienvenue sur l'Universal Script Tester !
print("Démarrage du script Python...")

def factorielle(n):
    if n < 0:
        return "Nombre négatif non supporté"
    elif n == 0:
        return 1
    else:
        return n * factorielle(n - 1)

num = 5
print(f"La factorielle de {num} est {factorielle(num)}")

# Test d'une boucle
for i in range(1, 4):
    print(f"Itération {i}")\`
        };

        // Initialization
        function init() {
            initMonacoEditor();
            setupEventListeners();
            updateLanguageUI();
            updateTabUI();
        }

        function initMonacoEditor() {
            require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
            require(['vs/editor/editor.main'], () => {
                editor = monaco.editor.create(editorContainer, {
                    value: defaultCode.javascript,
                    language: 'javascript',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    fontSize: 14,
                    minimap: { enabled: true, scale: 0.8 },
                    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                    padding: { top: 16 },
                    wordWrap: 'on'
                });
            });
        }
        
        // Event Listeners Setup
        function setupEventListeners() {
            runButton.addEventListener('click', handleRunClick);
            clearConsoleButton.addEventListener('click', clearConsole);
            copyConsoleButton.addEventListener('click', handleCopyConsole);
            resizeHandle.addEventListener('mousedown', initResize);
            
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleLanguageChange(e.currentTarget.dataset.lang));
            });

            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => handleTabChange(e.currentTarget.dataset.tab));
            });

            importButton.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', handleFileImport);
            exportButton.addEventListener('click', handleFileExport);
        }

        // Event Handlers
        async function handleRunClick() {
            if (state.isExecuting || !editor) return;
            const code = editor.getValue();
            await executeCode(state.language, code);
        }
        
        function handleLanguageChange(newLang) {
            if (!editor) return;
            state.language = newLang;
            monaco.editor.setModelLanguage(editor.getModel(), newLang);
            editor.setValue(defaultCode[newLang]);
            updateLanguageUI();
            clearConsole();
        }
        
        function handleTabChange(newTab) {
            state.activeTab = newTab;
            updateTabUI();
        }

        function handleFileImport(event) {
            const file = event.target.files[0];
            if (!file || !editor) return;
            const reader = new FileReader();
            reader.onload = (e) => editor.setValue(e.target.result);
            reader.readAsText(file);
            event.target.value = ''; 
        }

        function handleFileExport() {
            if (!editor) return;
            const code = editor.getValue();
            const ext = state.language === 'javascript' ? 'js' : 'py';
            const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = \`script-\${Date.now()}.\${ext}\`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function handleCopyConsole() {
            const consoleText = consoleContent.querySelector('.console-output').innerText;
            navigator.clipboard.writeText(consoleText).then(() => {
                const originalIcon = copyConsoleButton.innerHTML;
                const checkIcon = \`<svg class="h-5 w-5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>\`;
                copyConsoleButton.innerHTML = checkIcon;
                copyConsoleButton.disabled = true;
                setTimeout(() => {
                    copyConsoleButton.innerHTML = originalIcon;
                    copyConsoleButton.disabled = false;
                }, 2000);
            }).catch(err => {
                console.error('Erreur de copie: ', err);
                addToConsole('Erreur: Impossible de copier dans le presse-papiers.', 'error');
            });
        }

        // Core Logic - Communication avec backend
        async function executeCode(language, code) {
            setExecutionState(true);
            addToConsole(\`Exécution du script \${language}...\`, 'info');
            handleTabChange('console');
            
            try {
                const response = await fetch('/api/execute', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        language: language,
                        code: code,
                        sessionId: state.sessionId
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    // Afficher les outputs
                    if (result.output && result.output.length > 0) {
                        result.output.forEach(output => {
                            addToConsole(output.content, output.type);
                        });
                    }
                    addToConsole(\`✓ Exécution terminée (\${result.executionTime}ms)\`, 'info');
                } else {
                    addToConsole(result.error || 'Erreur inconnue', 'error');
                }
                
                // Ajouter à l'historique local
                addToHistory({ 
                    language, 
                    code, 
                    output: result.error || 'Exécution réussie',
                    success: result.success
                });

            } catch (error) {
                addToConsole(\`Erreur de connexion: \${error.message}\`, 'error');
            }
            
            setExecutionState(false);
        }

        // UI Update Functions
        function setExecutionState(isExecuting) {
            state.isExecuting = isExecuting;
            runButton.disabled = isExecuting;
            runButton.classList.toggle('opacity-50', isExecuting);
            runButton.classList.toggle('cursor-not-allowed', isExecuting);
            runText.textContent = isExecuting ? 'Exécution...' : 'Exécuter';
            runIcon.classList.toggle('hidden', isExecuting);
            spinnerIcon.classList.toggle('hidden', !isExecuting);
        }

        function updateLanguageUI() {
            document.querySelectorAll('.lang-btn').forEach(btn => {
                const isSelected = btn.dataset.lang === state.language;
                btn.classList.toggle('bg-emerald-500', isSelected);
                btn.classList.toggle('text-white', isSelected);
            });
        }
        
        function updateTabUI() {
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('tab-active', btn.dataset.tab === state.activeTab);
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('hidden', content.id !== \`\${state.activeTab}-content\`);
            });
            if(state.activeTab === 'history') renderHistory();
        }

        function addToConsole(message, type = 'log') {
            const container = consoleContent.querySelector('.console-output');
            const line = document.createElement('div');
            line.innerHTML = \`<span class="log-prefix">&gt;</span><span class="\${type}">\${message}</span>\`;
            container.appendChild(line);
            container.parentElement.scrollTop = container.parentElement.scrollHeight;
        }

        function clearConsole() {
            const container = consoleContent.querySelector('.console-output');
            container.innerHTML = '<div><span class="log-prefix">&gt;</span><span class="info">Console vidée.</span></div>';
        }

        function addToHistory(execution) {
            state.history.unshift({ ...execution, timestamp: new Date() });
            if (state.history.length > 20) state.history.pop();
            if (state.activeTab === 'history') renderHistory();
        }

        function renderHistory() {
            if (state.history.length === 0) {
                historyContent.innerHTML = \`<p class="text-slate-500 text-sm text-center mt-4">L'historique est vide.</p>\`;
                return;
            }
            historyContent.innerHTML = state.history.map((item, index) => \`
                <div class="p-3 rounded-lg mb-2 cursor-pointer transition-colors duration-200 \${!item.success ? 'bg-red-900/20 hover:bg-red-900/40' : 'bg-slate-700/50 hover:bg-slate-700'}">
                    <div class="flex justify-between items-center text-xs text-slate-400 mb-2">
                        <span>\${item.language === 'javascript' ? 'JS' : 'PY'} - \${item.timestamp.toLocaleTimeString()}</span>
                        <button data-history-index="\${index}" class="restore-btn text-emerald-400 hover:text-emerald-300">Restaurer</button>
                    </div>
                    <pre class="text-sm text-slate-300 whitespace-pre-wrap font-mono bg-slate-900/50 p-2 rounded-md truncate">\${item.code}</pre>
                </div>
            \`).join('');

            document.querySelectorAll('.restore-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(e.currentTarget.dataset.historyIndex, 10);
                    const historyItem = state.history[index];
                    handleLanguageChange(historyItem.language);
                    editor.setValue(historyItem.code);
                    handleTabChange('console');
                    addToConsole('Code restauré depuis l\\'historique.', 'info');
                });
            });
        }
        
        // Panel Resizing Logic
        function initResize(e) {
            e.preventDefault();
            window.addEventListener('mousemove', startResizing);
            window.addEventListener('mouseup', stopResizing);
            document.body.classList.add('no-select');
        }

        function startResizing(e) {
            const newHeight = window.innerHeight - e.clientY;
            if (newHeight > 50 && newHeight < (mainContainer.clientHeight - 100)) {
                outputPanel.style.height = \`\${newHeight}px\`;
            }
        }

        function stopResizing() {
            window.removeEventListener('mousemove', startResizing);
            window.removeEventListener('mouseup', stopResizing);
            document.body.classList.remove('no-select');
        }

        init();
    });
    </script>
</body>
</html>`;

// =============================================================================
// MODULE 2: SECURITY GATEWAY MODULE (Critical)
// =============================================================================
class SecurityGateway {
    static validateCode(code, language) {
        // Validation de base
        if (!code || typeof code !== 'string') {
            throw new Error('Code invalide');
        }

        if (code.length > 10 * 1024) { // 10KB max
            throw new Error('Code trop volumineux (max 10KB)');
        }

        // Patterns dangereux par langage
        const dangerousPatterns = {
            javascript: [
                /eval\s*\(/i,
                /Function\s*\(/i,
                /import\s*\(/i,
                /require\s*\(/i,
                /process\./i,
                /fs\./i,
                /child_process/i,
                /Buffer/i,
                /__dirname/i,
                /__filename/i
            ],
            python: [
                /import\s+os/i,
                /import\s+sys/i,
                /import\s+subprocess/i,
                /exec\s*\(/i,
                /eval\s*\(/i,
                /__import__/i,
                /open\s*\(/i,
                /file\s*\(/i,
                /input\s*\(/i,
                /raw_input/i
            ]
        };

        // Vérification des patterns dangereux
        const patterns = dangerousPatterns[language] || [];
        for (const pattern of patterns) {
            if (pattern.test(code)) {
                throw new Error(`Code non autorisé: pattern dangereux détecté`);
            }
        }

        return {
            safe: true,
            sanitizedCode: code.trim()
        };
    }

    static auditLog(action, data, result) {
        const timestamp = new Date().toISOString();
        console.log(`[AUDIT ${timestamp}] ${action}:`, {
            language: data.language,
            codeLength: data.code?.length || 0,
            success: result.success,
            error: result.error || null
        });
    }
}

// =============================================================================
// MODULE 3: JAVASCRIPT RUNTIME MODULE
// =============================================================================
class JavaScriptRuntime {
    static async execute(code) {
        return new Promise((resolve) => {
            const output = [];
            const startTime = Date.now();

            try {
                // Créer un contexte sécurisé
                const sandbox = {
                    console: {
                        log: (...args) => output.push({ type: 'log', content: args.join(' ') }),
                        error: (...args) => output.push({ type: 'error', content: args.join(' ') }),
                        info: (...args) => output.push({ type: 'info', content: args.join(' ') }),
                        warn: (...args) => output.push({ type: 'warn', content: args.join(' ') })
                    },
                    setTimeout: (fn, delay) => {
                        if (delay > 1000) delay = 1000; // Max 1s
                        return setTimeout(fn, delay);
                    },
                    Math: Math,
                    JSON: JSON,
                    Array: Array,
                    Object: Object,
                    String: String,
                    Number: Number,
                    Boolean: Boolean,
                    Date: Date
                };

                const context = vm.createContext(sandbox);

                // Timeout de sécurité
                const timeout = setTimeout(() => {
                    throw new Error('Timeout: exécution trop longue (>5s)');
                }, 5000);

                vm.runInContext(code, context, {
                    timeout: 5000,
                    displayErrors: false
                });

                clearTimeout(timeout);

                const executionTime = Date.now() - startTime;
                
                resolve({
                    success: true,
                    output: output,
                    executionTime: executionTime
                });

            } catch (error) {
                const executionTime = Date.now() - startTime;
                resolve({
                    success: false,
                    error: error.message,
                    output: output,
                    executionTime: executionTime
                });
            }
        });
    }
}

// =============================================================================
// MODULE 4: PYTHON RUNTIME MODULE
// =============================================================================
class PythonRuntime {
    static async execute(code) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let output = '';
            let hasError = false;

            // Créer un processus Python isolé
            const pythonProcess = spawn('python3', ['-c', code], {
                timeout: 5000,
                env: {
                    PATH: '/usr/bin:/bin',
                    PYTHONPATH: ''
                },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Capturer la sortie standard
            pythonProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            // Capturer les erreurs
            pythonProcess.stderr.on('data', (data) => {
                output += data.toString();
                hasError = true;
            });

            // Gérer la fin du processus
            pythonProcess.on('close', (code) => {
                const executionTime = Date.now() - startTime;
                
                resolve({
                    success: !hasError && code === 0,
                    output: [{
                        type: hasError ? 'error' : 'log',
                        content: output.trim() || 'Aucune sortie'
                    }],
                    executionTime: executionTime,
                    exitCode: code
                });
            });

            // Gérer les erreurs de processus
            pythonProcess.on('error', (error) => {
                const executionTime = Date.now() - startTime;
                resolve({
                    success: false,
                    error: `Erreur d'exécution: ${error.message}`,
                    output: [],
                    executionTime: executionTime
                });
            });

            // Timeout de sécurité
            setTimeout(() => {
                if (!pythonProcess.killed) {
                    pythonProcess.kill('SIGKILL');
                    resolve({
                        success: false,
                        error: 'Timeout: exécution interrompue (>5s)',
                        output: [],
                        executionTime: 5000
                    });
                }
            }, 5000);
        });
    }
}

// =============================================================================
// MODULE 5: SESSION DATABASE MODULE (Simple)
// =============================================================================
class SessionDatabase {
    constructor() {
        this.sessions = new Map();
        this.cleanup();
    }

    createSession(sessionId) {
        this.sessions.set(sessionId, {
            id: sessionId,
            createdAt: Date.now(),
            executions: [],
            lastActivity: Date.now()
        });
    }

    addExecution(sessionId, execution) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.executions.unshift(execution);
            session.lastActivity = Date.now();
            // Garder seulement les 10 dernières exécutions
            if (session.executions.length > 10) {
                session.executions.pop();
            }
        }
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    cleanup() {
        // Nettoyage automatique toutes les 5 minutes
        setInterval(() => {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            for (const [sessionId, session] of this.sessions.entries()) {
                if (now - session.lastActivity > fiveMinutes) {
                    this.sessions.delete(sessionId);
                    console.log(`Session ${sessionId} supprimée (inactive)`);
                }
            }
        }, 60000); // Check chaque minute
    }
}

// =============================================================================
// MODULE 6: ORCHESTRATOR MODULE (Control)
// =============================================================================
class Orchestrator {
    constructor() {
        this.sessionDB = new SessionDatabase();
    }

    async executeCode(sessionId, language, code) {
        // Étape 1: Validation sécurité
        const auditData = { language, code };
        let result;

        try {
            const validation = SecurityGateway.validateCode(code, language);
            
            // Étape 2: Exécution selon le runtime approprié
            if (language === 'javascript') {
                result = await JavaScriptRuntime.execute(validation.sanitizedCode);
            } else if (language === 'python') {
                result = await PythonRuntime.execute(validation.sanitizedCode);
            } else {
                throw new Error(`Langage non supporté: ${language}`);
            }

            // Étape 3: Enregistrement en base
            this.sessionDB.addExecution(sessionId, {
                language,
                code: validation.sanitizedCode,
                result,
                timestamp: new Date().toISOString()
            });

            // Étape 4: Audit log
            SecurityGateway.auditLog('EXECUTE_CODE', auditData, result);

            return {
                success: true,
                ...result
            };

        } catch (error) {
            result = { success: false, error: error.message };
            SecurityGateway.auditLog('EXECUTE_CODE', auditData, result);
            return result;
        }
    }
}

// =============================================================================
// ROUTES ET SERVEUR
// =============================================================================
const orchestrator = new Orchestrator();

// Route principale - Servir le frontend
app.get('/', (req, res) => {
    res.send(frontendHTML);
});

// Route API - Exécution de code
app.post('/api/execute', async (req, res) => {
    try {
        const { language, code, sessionId } = req.body;
        
        // Validation des paramètres
        if (!language || !code || !sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Paramètres manquants (language, code, sessionId)'
            });
        }

        // Créer session si elle n'existe pas
        if (!orchestrator.sessionDB.getSession(sessionId)) {
            orchestrator.sessionDB.createSession(sessionId);
        }

        // Exécuter le code via l'orchestrateur
        const result = await orchestrator.executeCode(sessionId, language, code);
        
        res.json(result);

    } catch (error) {
        console.error('Erreur API:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur'
        });
    }
});

// Route API - Historique de session
app.get('/api/history/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = orchestrator.sessionDB.getSession(sessionId);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                error: 'Session non trouvée'
            });
        }

        res.json({
            success: true,
            executions: session.executions
        });

    } catch (error) {
        console.error('Erreur API historique:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur'
        });
    }
});

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Universal Script Tester running on port ${PORT}`);
    console.log(`📝 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api/execute`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});