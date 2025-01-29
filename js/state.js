import { updateAllProgress } from './progressBars.js';

// Cookie and state management functions
export function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function saveFishState() {
    const fishStates = {};
    document.querySelectorAll('.fish-cell').forEach(cell => {
        const fishName = cell.querySelector('.fish-name')?.textContent;
        if (fishName) {
            const circles = Array.from(cell.querySelectorAll('.toggle-circle'));
            fishStates[fishName] = circles.map(circle => circle.classList.contains('active'));
        }
    });
    setCookie('fishRarityStates', JSON.stringify(fishStates));
}

export function loadFishState() {
    const savedStates = getCookie('fishRarityStates');
    if (savedStates) {
        const fishStates = JSON.parse(savedStates);
        document.querySelectorAll('.fish-cell').forEach(cell => {
            const fishName = cell.querySelector('.fish-name')?.textContent;
            if (fishName && fishStates[fishName]) {
                const circles = cell.querySelectorAll('.toggle-circle');
                fishStates[fishName].forEach((isActive, index) => {
                    if (isActive) circles[index].classList.add('active');
                });
            }
        });
        if (document.querySelector('#completion-tab').classList.contains('active')) {
            updateAllProgress();
        }
    }
}

// Collapsible state management
export function saveCollapsibleStates() {
    const quickOptionsPanel = document.querySelector('.quick-options-panel');
    const filtersPanel = document.querySelector('.filters-panel');
    
    const states = {
        quickOptions: quickOptionsPanel?.classList.contains('show') || false,
        filters: filtersPanel?.classList.contains('show') || false
    };
    setCookie('collapsibleStates', JSON.stringify(states));
}

export function loadCollapsibleStates() {
    const savedStates = getCookie('collapsibleStates');
    if (savedStates) {
        const states = JSON.parse(savedStates);
        const quickOptionsPanel = document.querySelector('.quick-options-panel');
        const quickOptionsToggle = document.querySelector('.quick-options-toggle');
        const filtersPanel = document.querySelector('.filters-panel');
        const filtersToggle = document.querySelector('.filters-toggle');
        
        // Quick Options
        if (quickOptionsPanel && quickOptionsToggle) {
            quickOptionsPanel.classList.toggle('show', states.quickOptions);
            quickOptionsToggle.textContent = states.quickOptions ? 'Quick Options ▲' : 'Quick Options ▼';
        }
        
        // Filters
        if (filtersPanel && filtersToggle) {
            filtersPanel.classList.toggle('show', states.filters);
            filtersToggle.textContent = states.filters ? 'Filters ▲' : 'Filters ▼';
        }
    }
}

// Helper functions for updating toggle text
export function updateToggleText() {
    const quickOptionsPanel = document.querySelector('.quick-options-panel');
    const quickOptionsToggle = document.querySelector('.quick-options-toggle');
    if (quickOptionsPanel && quickOptionsToggle) {
        quickOptionsToggle.textContent = quickOptionsPanel.classList.contains('show') 
            ? 'Quick Options ▲' 
            : 'Quick Options ▼';
    }
}

export function updateFiltersToggleText() {
    const filtersPanel = document.querySelector('.filters-panel');
    const filtersToggle = document.querySelector('.filters-toggle');
    if (filtersPanel && filtersToggle) {
        filtersToggle.textContent = filtersPanel.classList.contains('show') 
            ? 'Filters ▲' 
            : 'Filters ▼';
    }
}
