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
