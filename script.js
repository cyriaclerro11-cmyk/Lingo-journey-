/**
 * LANGUAGE JOURNEY - Web Application Core Engine
 */

// 1. STATE MANAGEMENT & STORAGE SYSTEM
const Storage = {
    KEY: 'language_journey_data_v1',
    
    getDefaultState() {
        return {
            currentLang: 'en',
            xp: 0,
            streak: 1,
            lastLogin: new Date().toISOString().slice(0, 10),
            levels: { en: 'A1', zh: 'HSK 1' },
            progress: { en: [], zh: [] },
            scores: [],
            vocab: [],
            mistakes: [],
            badges: ['b1'] // Badge "Première Leçon" débloqué par défaut
        };
    },

    load() {
        const data = localStorage.getItem(this.KEY);
        if (!data) return this.getDefaultState();
        try {
            return JSON.parse(data);
        } catch(e) {
            return this.getDefaultState();
        }
    },

    save(state) {
        localStorage.setItem(this.KEY, JSON.stringify(state));
    }
};

let appState = Storage.load();

// 2. PEDAGOGICAL CONTENT (ANGALAIS & MANDARIN)
const ContentData = {
    en: [
        {
            id: 'm1',
            title: 'Module 1 — Greetings & Essentials',
            description: 'Apprendre à saluer et prendre des nouvelles.',
            lessons: [
                {
                    id: 'en_m1_l1',
                    title: 'Lesson 01 — Basic Greetings',
                    steps: [
                        { type: 'vocab', word: 'Hello', translation: 'Bonjour', pronunciation: 'heh-LOH', example: 'Hello, my name is John.' },
                        { type: 'vocab', word: 'Good morning', translation: 'Bonjour (le matin)', pronunciation: 'gud MOR-ning', example: 'Good morning, how are you?' },
                        { type: 'explanation', text: 'On utilise "Good morning" généralement jusqu’à midi. L’expression "Hello" s’utilise à tout moment de la journée.' },
                        { 
                            type: 'exercise', 
                            question: 'Comment dit-on "Bonjour" le matin en anglais ?', 
                            options: ['Good evening', 'Good morning', 'Goodbye'], 
                            answer: 1, 
                            explanation: '"Good morning" est spécifique au matin.' 
                        }
                    ]
                },
                {
                    id: 'en_m1_l2',
                    title: 'Lesson 02 — Polite Expressions',
                    steps: [
                        { type: 'vocab', word: 'Thank you', translation: 'Merci', pronunciation: 'thank yoo', example: 'Thank you very much!' },
                        { type: 'vocab', word: 'Nice to meet you', translation: 'Ravi de vous rencontrer', pronunciation: 'nyse to meet yoo', example: 'Nice to meet you, Sarah.' },
                        { 
                            type: 'exercise', 
                            question: 'Traduisez : "Ravi de vous rencontrer"', 
                            options: ['Nice to meet you', 'How are you', 'See you later'], 
                            answer: 0, 
                            explanation: '"Nice to meet you" s’utilise lors d’une première présentation.' 
                        }
                    ]
                }
            ]
        },
        {
            id: 'm2',
            title: 'Module 2 — Introducing Yourself',
            description: 'Parler de soi, de son nom et de sa nationalité.',
            lessons: [
                {
                    id: 'en_m2_l1',
                    title: 'Lesson 01 — Names and Origins',
                    steps: [
                        { type: 'vocab', word: 'My name is...', translation: 'Je m’appelle...', pronunciation: 'my naym iz', example: 'My name is Alex.' },
                        { type: 'vocab', word: 'I come from...', translation: 'Je viens de...', pronunciation: 'eyekom from', example: 'I come from France.' },
                        { 
                            type: 'exercise', 
                            question: 'Complétez : "____ name is Paul."', 
                            options: ['I', 'My', 'Me'], 
                            answer: 1, 
                            explanation: '"My" est le déterminant possessif pour indiquer son nom.' 
                        }
                    ]
                }
            ]
        }
    ],
    zh: [
        {
            id: 'm1_zh',
            title: 'Module 1 — 问候 Greetings',
            description: 'Bases des salutations en pinyin et caractères.',
            lessons: [
                {
                    id: 'zh_m1_l1',
                    title: 'Lesson 01 — Les Salutations de base',
                    steps: [
                        { type: 'vocab', word: '你好', translation: 'Bonjour', pronunciation: 'Nǐ hǎo', example: '你好！ (Nǐ hǎo!)' },
                        { type: 'vocab', word: '谢谢', translation: 'Merci', pronunciation: 'Xièxie', example: '谢谢你！ (Xièxie nǐ!)' },
                        { type: 'vocab', word: '再见', translation: 'Au revoir', pronunciation: 'Zàijiàn', example: '再见，明天见！' },
                        { 
                            type: 'exercise', 
                            question: 'Quelle est la signification de "你好 (Nǐ hǎo)" ?', 
                            options: ['Au revoir', 'Merci', 'Bonjour'], 
                            answer: 2, 
                            explanation: '"你" (tu) + "好" (bien) forme la salutation "Bonjour".' 
                        }
                    ]
                }
            ]
        }
    ]
};

// 3. AUDIO SYSTEM (WEB SPEECH API)
const AudioEngine = {
    speak(text, lang) {
        if (!('speechSynthesis' in window)) {
            alert("La synthèse vocale n'est pas supportée sur ce navigateur.");
            return;
        }
        window.speechSynthesis.cancel(); // Stop prior audio
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
        utterance.rate = 0.9; // Slightly slower for language learners
        window.speechSynthesis.speak(utterance);
    }
};

// 4. NAVIGATION & VIEW CONTROLLER
function navigateTo(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetView = document.getElementById(viewId);
    if (targetView) targetView.classList.add('active');

    const navBtn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (navBtn) navBtn.classList.add('active');

    window.scrollTo(0, 0);
}

// 5. RENDER UI FUNCTIONS
function updateHeaderStats() {
    document.getElementById('header-streak').textContent = appState.streak;
    document.getElementById('header-xp').textContent = appState.xp;
    
    // Quick continue bar
    const totalLessons = appState.progress[appState.currentLang].length;
    document.getElementById('quick-lang-badge').textContent = appState.currentLang === 'en' ? '🇬🇧 Anglais A1' : '🇨🇳 Mandarin HSK 1';
    document.getElementById('quick-progress-text').textContent = `Leçons terminées : ${totalLessons}`;

    // Progress Bars
    const enCount = appState.progress.en ? appState.progress.en.length : 0;
    const zhCount = appState.progress.zh ? appState.progress.zh.length : 0;

    document.getElementById('en-progress-bar').style.width = Math.min((enCount / 5) * 100, 100) + '%';
    document.getElementById('zh-progress-bar').style.width = Math.min((zhCount / 5) * 100, 100) + '%';
}

function renderModulesView() {
    const lang = appState.currentLang;
    const container = document.getElementById('modules-list');
    const title = document.getElementById('courses-title');

    title.textContent = lang === 'en' ? '🇬🇧 Modules d\'Anglais (A1)' : '🇨🇳 Modules de Mandarin (HSK 1)';
    container.innerHTML = '';

    const modules = ContentData[lang] || [];
    modules.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'card module-card';
        
        let lessonsHTML = '';
        mod.lessons.forEach(les => {
            const isCompleted = appState.progress[lang].includes(les.id);
            lessonsHTML += `
                <div class="lesson-item ${isCompleted ? 'completed' : ''}" onclick="startLesson('${les.id}')">
                    <span>${isCompleted ? '✅' : '📖'} ${les.title}</span>
                    <button class="btn btn-secondary">${isCompleted ? 'Revoir' : 'Lancer'}</button>
                </div>
            `;
        });

        modCard.innerHTML = `
            <h3>${mod.title}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${mod.description}</p>
            <div class="module-lessons-list">${lessonsHTML}</div>
        `;
        container.appendChild(modCard);
    });
}

// 6. LESSON INTERACTIVE ENGINE
let currentLessonState = {
    lessonObj: null,
    stepIndex: 0
};

function startLesson(lessonId) {
    const lang = appState.currentLang;
    let found = null;

    ContentData[lang].forEach(m => {
        m.lessons.forEach(l => {
            if (l.id === lessonId) found = l;
        });
    });

    if (!found) return;

    currentLessonState.lessonObj = found;
    currentLessonState.stepIndex = 0;

    navigateTo('view-lesson');
    renderLessonStep();
}

function renderLessonStep() {
    const { lessonObj, stepIndex } = currentLessonState;
    const step = lessonObj.steps[stepIndex];
    const container = document.getElementById('lesson-content-area');
    
    document.getElementById('lesson-step-indicator').textContent = `Étape ${stepIndex + 1} / ${lessonObj.steps.length}`;
    document.getElementById('btn-prev-step').style.display = stepIndex > 0 ? 'inline-block' : 'none';

    container.innerHTML = '';

    if (step.type === 'vocab') {
        container.innerHTML = `
            <div style="text-align: center;">
                <span class="badge">Nouveau Vocabulaire</span>
                <h1 style="font-size: 2.5rem; margin: 15px 0; color: var(--primary);">${step.word}</h1>
                <p style="font-size: 1.2rem; font-weight: 600;">Traduction : ${step.translation}</p>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Prononciation : <em>[${step.pronunciation}]</em></p>
                
                <button class="btn btn-secondary" onclick="AudioEngine.speak('${step.word}', '${appState.currentLang}')">
                    🔊 Écouter
                </button>

                <div class="card-inner" style="margin-top: 20px;">
                    <strong>Exemple :</strong>
                    <p style="margin-top: 5px;">"${step.example}"</p>
                </div>
            </div>
        `;
        // Save to Vocab bank
        saveVocabWord(step.word, step.translation, step.pronunciation);
    } else if (step.type === 'explanation') {
        container.innerHTML = `
            <div>
                <span class="badge">Explication Règle</span>
                <h3 style="margin: 15px 0;">💡 Point de Grammaire / Usage</h3>
                <p style="font-size: 1.05rem; line-height: 1.6;">${step.text}</p>
            </div>
        `;
    } else if (step.type === 'exercise') {
        let optionsHTML = '';
        step.options.forEach((opt, idx) => {
            optionsHTML += `<button class="option-btn" onclick="checkLessonAnswer(${idx}, ${step.answer}, '${step.explanation.replace(/'/g, "\\'")}')">${opt}</button>`;
        });

        container.innerHTML = `
            <div>
                <span class="badge">Exercice Interactif</span>
                <h3 style="margin: 15px 0;">${step.question}</h3>
                <div id="options-box">${optionsHTML}</div>
                <div id="exercise-feedback" class="quiz-feedback hidden"></div>
            </div>
        `;
    }
}

function checkLessonAnswer(selectedIdx, correctIdx, explanationText) {
    const feedbackBox = document.getElementById('exercise-feedback');
    feedbackBox.classList.remove('hidden', 'correct', 'incorrect');

    if (selectedIdx === correctIdx) {
        feedbackBox.classList.add('correct');
        feedbackBox.innerHTML = `✅ Excellent ! <br><small>${explanationText}</small>`;
        addXP(10);
    } else {
        feedbackBox.classList.add('incorrect');
        feedbackBox.innerHTML = `❌ Mauvaise réponse. <br><small>💡 ${explanationText}</small>`;
        // Enregistrer l'erreur
        saveMistake(currentLessonState.lessonObj.title, "Erreur sur exercice d'application.");
    }
}

// Next / Prev Step Handlers
document.getElementById('btn-next-step').addEventListener('click', () => {
    const { lessonObj, stepIndex } = currentLessonState;
    if (stepIndex < lessonObj.steps.length - 1) {
        currentLessonState.stepIndex++;
        renderLessonStep();
    } else {
        // Complete Lesson
        if (!appState.progress[appState.currentLang].includes(lessonObj.id)) {
            appState.progress[appState.currentLang].push(lessonObj.id);
            addXP(20);
        }
        Storage.save(appState);
        updateHeaderStats();
        alert('🎉 Leçon terminée ! Bravo ! (+20 XP)');
        navigateTo('view-courses');
        renderModulesView();
    }
});

document.getElementById('btn-prev-step').addEventListener('click', () => {
    if (currentLessonState.stepIndex > 0) {
        currentLessonState.stepIndex--;
        renderLessonStep();
    }
});

// 7. VOCABULARY & MISTAKES MANAGEMENT
function saveVocabWord(word, translation, pronunciation) {
    if (!appState.vocab.some(v => v.word === word)) {
        appState.vocab.push({
            word,
            translation,
            pronunciation,
            lang: appState.currentLang,
            date: new Date().toLocaleDateString()
        });
        Storage.save(appState);
    }
}

function saveMistake(topic, detail) {
    appState.mistakes.push({ topic, detail, date: new Date().toLocaleDateString() });
    Storage.save(appState);
}

function renderVocabView() {
    const body = document.getElementById('vocab-table-body');
    const countVocab = document.getElementById('count-vocab');
    const countMistakes = document.getElementById('count-mistakes');
    const mistakesList = document.getElementById('mistakes-list-container');

    countVocab.textContent = appState.vocab.length;
    countMistakes.textContent = appState.mistakes.length;

    // Table vocab
    body.innerHTML = '';
    appState.vocab.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${v.word}</strong></td>
            <td>${v.translation}</td>
            <td><em>${v.pronunciation}</em></td>
            <td><button class="btn btn-secondary" onclick="AudioEngine.speak('${v.word}', '${v.lang}')">🔊</button></td>
        `;
        body.appendChild(tr);
    });

    // List mistakes
    mistakesList.innerHTML = '';
    if (appState.mistakes.length === 0) {
        mistakesList.innerHTML = '<li style="padding:10px;">Aucune erreur enregistrée. Excellent travail !</li>';
    } else {
        appState.mistakes.forEach(m => {
            const li = document.createElement('li');
            li.className = 'card-inner';
            li.innerHTML = `<strong>${m.topic}</strong> : ${m.detail} <span style="float:right; font-size:0.8rem; color:gray;">${m.date}</span>`;
            mistakesList.appendChild(li);
        });
    }
}

// 8. GAMIFICATION & XP SYSTEM
function addXP(amount) {
    appState.xp += amount;
    Storage.save(appState);
    updateHeaderStats();
}

// 9. PLACEMENT TEST ENGINE
const PlacementQuiz = {
    questions: [
        { q: 'Choisissez la bonne traduction : "Good evening"', opts: ['Bonjour le matin', 'Bonsoir', 'Au revoir'], ans: 1, type: 'Grammaire' },
        { q: 'Complétez : "How _____ you?"', opts: ['is', 'are', 'am'], ans: 1, type: 'Grammaire' },
        { q: 'Traduisez "Thank you"', opts: ['S’il vous plaît', 'Merci', 'De rien'], ans: 1, type: 'Vocabulaire' }
    ],
    currentIndex: 0,
    score: 0
};

function startPlacementTest() {
    PlacementQuiz.currentIndex = 0;
    PlacementQuiz.score = 0;
    navigateTo('view-quiz');
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const q = PlacementQuiz.questions[PlacementQuiz.currentIndex];
    const total = PlacementQuiz.questions.length;

    document.getElementById('quiz-title').textContent = `Test de niveau — Question ${PlacementQuiz.currentIndex + 1}/${total}`;
    document.getElementById('quiz-progress-fill').style.width = ((PlacementQuiz.currentIndex) / total * 100) + '%';

    let optionsHTML = '';
    q.opts.forEach((opt, idx) => {
        optionsHTML += `<button class="option-btn" onclick="selectQuizOption(${idx})">${opt}</button>`;
    });

    document.getElementById('quiz-body').innerHTML = `
        <h3>${q.q}</h3>
        <div style="margin-top:15px;">${optionsHTML}</div>
    `;

    document.getElementById('btn-submit-answer').classList.remove('hidden');
    document.getElementById('btn-next-question').classList.add('hidden');
    document.getElementById('quiz-feedback').classList.add('hidden');
}

let selectedQuizOptionIdx = null;
function selectQuizOption(idx) {
    selectedQuizOptionIdx = idx;
    document.querySelectorAll('#quiz-body .option-btn').forEach((btn, i) => {
        if (i === idx) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}

document.getElementById('btn-submit-answer').addEventListener('click', () => {
    if (selectedQuizOptionIdx === null) return alert('Veuillez sélectionner une réponse.');

    const q = PlacementQuiz.questions[PlacementQuiz.currentIndex];
    const isCorrect = selectedQuizOptionIdx === q.ans;

    if (isCorrect) PlacementQuiz.score++;

    const feedbackBox = document.getElementById('quiz-feedback');
    feedbackBox.classList.remove('hidden', 'correct', 'incorrect');
    feedbackBox.classList.add(isCorrect ? 'correct' : 'incorrect');
    feedbackBox.textContent = isCorrect ? '✅ Bonne réponse !' : '❌ Réponse incorrecte.';

    document.getElementById('btn-submit-answer').classList.add('hidden');
    document.getElementById('btn-next-question').classList.remove('hidden');
});

document.getElementById('btn-next-question').addEventListener('click', () => {
    selectedQuizOptionIdx = null;
    PlacementQuiz.currentIndex++;

    if (PlacementQuiz.currentIndex < PlacementQuiz.questions.length) {
        renderQuizQuestion();
    } else {
        finishPlacementQuiz();
    }
});

function finishPlacementQuiz() {
    const total = PlacementQuiz.questions.length;
    const scorePct = Math.round((PlacementQuiz.score / total) * 100);

    let assignedLevel = appState.currentLang === 'en' ? 'A1' : 'HSK 1';
    if (scorePct >= 80) assignedLevel = appState.currentLang === 'en' ? 'A2' : 'HSK 2';

    appState.levels[appState.currentLang] = assignedLevel;
    appState.scores.push({ date: new Date().toLocaleDateString(), score: scorePct });
    Storage.save(appState);

    document.getElementById('res-score-num').textContent = `${PlacementQuiz.score}/${total}`;
    document.getElementById('res-score-percent').textContent = `(${scorePct}%)`;
    document.getElementById('res-level-output').textContent = `Ton niveau estimé : ${assignedLevel}`;

    navigateTo('view-quiz-results');
}

document.getElementById('btn-finish-quiz').addEventListener('click', () => {
    navigateTo('view-home');
    updateHeaderStats();
});

// 10. CANVAS GRAPHICS ENGINE (NO EXTERNAL DEPENDENCY)
function drawCharts() {
    // Score Evolution Line Chart
    const canvasScore = document.getElementById('chart-scores');
    if (canvasScore && canvasScore.getContext) {
        const ctx = canvasScore.getContext('2d');
        ctx.clearRect(0, 0, canvasScore.width, canvasScore.height);

        const data = appState.scores.length > 0 ? appState.scores.map(s => s.score) : [40, 60, 75, 85];
        
        // Draw grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            let y = 20 + i * 40;
            ctx.beginPath();
            ctx.moveTo(30, y);
            ctx.lineTo(370, y);
            ctx.stroke();
        }

        // Draw Line
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const stepX = 340 / (data.length - 1 || 1);
        data.forEach((val, i) => {
            let x = 30 + i * stepX;
            let y = 180 - (val / 100) * 150;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }
}

// 11. INITIALIZATION & EVENT BINDING
document.addEventListener('DOMContentLoaded', () => {
    updateHeaderStats();

    // Bottom Nav & Top Logo
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.target));
    });

    document.getElementById('btn-logo').addEventListener('click', () => navigateTo('view-home'));
    document.getElementById('nav-profile-btn').addEventListener('click', () => navigateTo('view-profile'));

    // Lang buttons
    document.querySelectorAll('.lang-btn, .btn-select-lang').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const lang = e.target.dataset.lang;
            if (lang) {
                appState.currentLang = lang;
                Storage.save(appState);
                updateHeaderStats();
                navigateTo('view-courses');
                renderModulesView();
            }
        });
    });

    // Placement Test Buttons
    document.querySelectorAll('.btn-placement-test').forEach(btn => {
        btn.addEventListener('click', (e) => {
            appState.currentLang = e.target.dataset.lang;
            Storage.save(appState);
            startPlacementTest();
        });
    });

    // Continue Learning Button
    document.getElementById('btn-continue-learning').addEventListener('click', () => {
        navigateTo('view-courses');
        renderModulesView();
    });

    // Tabs for Vocab View
    document.getElementById('tab-vocab-list').addEventListener('click', () => {
        document.getElementById('tab-vocab-list').classList.add('active');
        document.getElementById('tab-mistakes').classList.remove('active');
        document.getElementById('panel-vocab-list').classList.add('active');
        document.getElementById('panel-mistakes').classList.remove('active');
    });

    document.getElementById('tab-mistakes').addEventListener('click', () => {
        document.getElementById('tab-mistakes').classList.add('active');
        document.getElementById('tab-vocab-list').classList.remove('active');
        document.getElementById('panel-mistakes').classList.add('active');
        document.getElementById('panel-vocab-list').classList.remove('active');
    });

    // Reset Data
    document.getElementById('btn-reset-data').addEventListener('click', () => {
        if (confirm("Êtes-vous sûr de vouloir réinitialiser toute votre progression ?")) {
            localStorage.removeItem(Storage.KEY);
            appState = Storage.getDefaultState();
            updateHeaderStats();
            alert("Progression réinitialisée.");
            navigateTo('view-home');
        }
    });

    // Render initial views
    renderVocabView();
    drawCharts();
});
