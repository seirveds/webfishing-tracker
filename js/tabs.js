import { updateAllProgress } from './progressBars.js';
import { createFishTable } from './fish.js';

// Tab management functionality
export function switchMainTab(tabId) {
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    const mainTabPanels = document.querySelectorAll('.main-tab-panel');

    mainTabButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.tab === tabId);
    });

    mainTabPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabId}-tab`);
    });

    // Only update progress bars when switching to completion tab
    if (tabId === 'completion') {
        requestAnimationFrame(updateAllProgress);
    }
}

export function createTabs(data) {
    const tabButtons = document.querySelector('.tab-buttons');
    const tabContent = document.querySelector('.tab-content');
    if (!tabButtons || !tabContent) return;

    const habitats = Object.values(data.habitats);
    
    // Create tab buttons
    habitats.forEach((habitat, index) => {
        const button = document.createElement('button');
        button.className = `tab-button ${index === 0 ? 'active' : ''}`;
        button.textContent = habitat.name;
        button.addEventListener('click', () => switchTab(habitat.name));
        tabButtons.appendChild(button);

        // Create tab panels with tables
        const panel = document.createElement('div');
        panel.className = `tab-panel ${index === 0 ? 'active' : ''}`;
        panel.id = `tab-${habitat.name.toLowerCase()}`;
        panel.setAttribute('data-habitat', habitat.name);
        
        const table = createFishTable(habitat.fish, habitat.name);
        panel.appendChild(table);
        
        tabContent.appendChild(panel);
    });
}

function switchTab(habitat) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.toggle('active', button.textContent === habitat);
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === `tab-${habitat.toLowerCase()}`);
    });
}
