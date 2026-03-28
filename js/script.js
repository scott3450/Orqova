// Elements
const themeBtn = document.getElementById('theme-toggle');
const langBtn = document.getElementById('lang-toggle');
const htmlElement = document.documentElement; // <html> tag
const translatableElements = document.querySelectorAll('[data-tr]');

// ===============================
// THEME LOGIC
// ===============================
const currentTheme = localStorage.getItem('theme') || 'theme-light';
htmlElement.className = currentTheme; // Ensure only one theme class exists at a time

themeBtn.addEventListener('click', () => {
    if (htmlElement.classList.contains('theme-light')) {
        htmlElement.className = 'theme-dark';
        localStorage.setItem('theme', 'theme-dark');
    } else {
        htmlElement.className = 'theme-light';
        localStorage.setItem('theme', 'theme-light');
    }

    themeBtn.style.transform = 'scale(0.8) rotate(10deg)';
    setTimeout(() => {
        themeBtn.style.transform = 'scale(1) rotate(0deg)';
    }, 150);
});

// ===============================
// LANGUAGE LOGIC
// ===============================
let currentLang = localStorage.getItem('lang') || 'en';

function applyLanguage(lang) {
    if (langBtn) {
        langBtn.textContent = lang === 'en' ? 'TR' : 'EN';
    }

    translatableElements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            // Check if we need to replace innerHTML (for elements with <br> tags)
            if (text.includes('<br>')) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
        }
    });
}

// Apply on load
applyLanguage(currentLang);

if (langBtn) {
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'tr' : 'en';
        localStorage.setItem('lang', currentLang);
        applyLanguage(currentLang);

        langBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            langBtn.style.transform = 'scale(1)';
        }, 150);
    });
}

// ===============================
// HEADER SCROLL
// ===============================
const header = document.querySelector('.header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '16px 0';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        } else {
            header.style.padding = '24px 0';
            header.style.boxShadow = 'none';
        }
    });
}
