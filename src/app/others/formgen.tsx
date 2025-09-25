<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ervop AI Form Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-gray-50">

    <div class="max-w-4xl mx-auto p-4 sm:p-8">
        <!-- Header -->
        <div class="text-center mb-10">
            <h1 class="text-4xl font-bold text-gray-900">Form Builder</h1>
            <p class="mt-2 text-lg text-gray-600">Create the perfect intake form for your clients.</p>
        </div>

        <!-- AI Assistant Card -->
        <div class="bg-purple-50 p-6 sm:p-8 rounded-xl border-2 border-dashed border-purple-200 mb-12">
            <div class="flex items-center gap-4">
                <div class="bg-purple-100 p-3 rounded-full">
                    <!-- Sparkles Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <h2 class="text-xl font-bold text-purple-900">✨ AI Assistant</h2>
            </div>
            <p class="text-purple-700 mt-2 mb-4">Describe your form's purpose, and let AI generate expert questions for you.</p>
            
            <textarea 
                id="ai-prompt"
                placeholder="e.g., An intake form for a new wedding photography client..."
                class="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                rows="2"
            ></textarea>
            
            <button 
                id="generate-btn"
                class="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed shadow-md"
            >
                <span id="btn-text">Generate Questions</span>
                <!-- Loader Icon -->
                <svg id="loader" class="w-5 h-5 animate-spin hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </button>
            
            <!-- AI Results Section -->
            <div id="ai-error" class="text-red-600 text-sm mt-3"></div>
            <div id="ai-results" class="mt-6 pt-6 border-t border-purple-200 hidden">
                <h3 class="font-semibold text-purple-800 mb-3">Suggested Questions:</h3>
                <ul id="suggested-questions-list" class="space-y-2">
                    <!-- Generated questions will be injected here by JavaScript -->
                </ul>
            </div>
        </div>
        
        <!-- Main Form Canvas -->
        <div class="bg-white p-6 sm:p-10 rounded-xl shadow-md border border-gray-200">
             <h2 class="text-3xl font-bold text-gray-800">Your Form</h2>
             <p class="text-gray-500 mb-8 mt-1">Add questions from the suggestions above or build your form manually.</p>

             <div id="form-fields-container" class="space-y-4">
                <!-- User's form fields will be injected here -->
             </div>

             <div id="empty-state" class="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                <p class="text-gray-500">Your questions will appear here.</p>
            </div>
        </div>

    </div>

    <script>
        const generateBtn = document.getElementById('generate-btn');
        const btnText = document.getElementById('btn-text');
        const loader = document.getElementById('loader');
        const aiPromptEl = document.getElementById('ai-prompt');
        const aiResultsEl = document.getElementById('ai-results');
        const aiErrorEl = document.getElementById('ai-error');
        const suggestedListEl = document.getElementById('suggested-questions-list');
        const formFieldsContainer = document.getElementById('form-fields-container');
        const emptyState = document.getElementById('empty-state');

        let userFormFields = [];
        let suggestedQuestions = [];

        // --- MOCK API CALL ---
        const generateQuestionsFromAI = async (prompt) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (prompt.toLowerCase().includes("error")) {
                        reject(new Error("Sorry, I couldn't generate questions for that topic."));
                    } else {
                        resolve([
                            "What is the date and venue of the wedding?",
                            "What is your desired photography style (e.g., traditional, photojournalistic, artistic)?",
                            "What is the estimated budget for photography services?",
                            "How many hours of coverage will you need?",
                            "Are you interested in an engagement session or a wedding album?"
                        ]);
                    }
                }, 1500); // Simulate network delay
            });
        };

        const handleGenerateClick = async () => {
            const prompt = aiPromptEl.value;
            if (!prompt) return;

            // Update UI to show loading state
            generateBtn.disabled = true;
            loader.classList.remove('hidden');
            btnText.textContent = 'Generating...';
            aiResultsEl.classList.add('hidden');
            aiErrorEl.textContent = '';
            suggestedListEl.innerHTML = '';

            try {
                suggestedQuestions = await generateQuestionsFromAI(prompt);
                renderSuggestedQuestions();
                aiResultsEl.classList.remove('hidden');
            } catch (error) {
                aiErrorEl.textContent = error.message;
            } finally {
                // Restore button state
                generateBtn.disabled = false;
                loader.classList.add('hidden');
                btnText.textContent = 'Generate Questions';
            }
        };

        const renderSuggestedQuestions = () => {
            suggestedListEl.innerHTML = '';
            if (suggestedQuestions.length > 0) {
                aiResultsEl.classList.remove('hidden');
            } else {
                 aiResultsEl.classList.add('hidden');
            }

            suggestedQuestions.forEach((question, index) => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between bg-white p-3 rounded-lg shadow-sm animate-fade-in';
                li.innerHTML = `
                    <span class="text-sm text-gray-800">${question}</span>
                    <button data-index="${index}" class="add-btn text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-100 px-3 py-1 rounded-full">+ Add</button>
                `;
                suggestedListEl.appendChild(li);
            });
        };

        const addQuestionToForm = (index) => {
            const questionToAdd = suggestedQuestions[index];
            userFormFields.push(questionToAdd);
            
            // Remove from suggestions
            suggestedQuestions.splice(index, 1);
            
            renderSuggestedQuestions();
            renderFormFields();
        };

        const renderFormFields = () => {
            formFieldsContainer.innerHTML = '';
            if (userFormFields.length > 0) {
                emptyState.classList.add('hidden');
                formFieldsContainer.classList.remove('hidden');
            } else {
                 emptyState.classList.remove('hidden');
                formFieldsContainer.classList.add('hidden');
            }

            userFormFields.forEach((field, index) => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'p-4 border border-gray-200 rounded-lg bg-white animate-fade-in';
                fieldDiv.innerHTML = `
                    <label class="font-semibold text-gray-700">${field}</label>
                    <div class="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-md h-12"></div>
                `;
                formFieldsContainer.appendChild(fieldDiv);
            });
        };

        // --- Event Listeners ---
        generateBtn.addEventListener('click', handleGenerateClick);

        suggestedListEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                const index = parseInt(e.target.dataset.index, 10);
                addQuestionToForm(index);
            }
        });
        
        // Initial render
        renderFormFields();

    </script>
</body>
</html>
