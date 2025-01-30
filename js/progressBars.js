import { RARITY_LEVELS } from './config.js';
import { updateHabitatProgress } from './habitatProgress.js';

// Progress bar related functionality
export function createProgressBars() {
    const container = document.querySelector('.progress-bars');
    if (!container) return;

    RARITY_LEVELS.forEach(rarity => {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-item';
        progressBar.innerHTML = `
            <div class="progress-label">${rarity.name}</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="--bar-color: ${rarity.color}; width: 0%"></div>
                <div class="progress-percentage">0.0%</div>
            </div>
        `;
        container.appendChild(progressBar);
    });
}

export function updateProgressBars() {
    const container = document.querySelector('.progress-bars');
    if (!container) return;

    // Create progress bars if they don't exist
    if (!container.querySelector('.progress-item')) {
        createProgressBars();
    }

    const progressItems = container.querySelectorAll('.progress-item');
    if (!progressItems.length) return;

    // Count active circles for each rarity using a single DOM traversal
    const fishCells = document.querySelectorAll('.fish-cell');
    const totalFish = fishCells.length;

    RARITY_LEVELS.forEach((rarity, index) => {
        const progressItem = progressItems[index];
        if (!progressItem) return;

        const caughtFish = document.querySelectorAll(`.toggle-circle[data-rarity="${index}"].active`).length;
        const percentage = totalFish > 0 ? (caughtFish / totalFish * 100).toFixed(1) : '0.0';
        
        const bar = progressItem.querySelector('.progress-bar');
        const percentageText = progressItem.querySelector('.progress-percentage');
        
        if (bar && percentageText) {
            bar.style.width = `${percentage}%`;
            bar.style.setProperty('--bar-color', rarity.color);
            percentageText.textContent = `${percentage}%`;
        }
    });
}

export function updateAllProgress() {
    updateProgressBars();
    updateHabitatProgress();
}
