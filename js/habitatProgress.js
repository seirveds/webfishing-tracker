import { RARITY_LEVELS } from './config.js';

// Habitat progress related functionality
export function createHabitatProgress() {
    const container = document.querySelector('.habitat-progress');
    if (!container) return;

    const habitats = document.querySelectorAll('.tab-panel');
    habitats.forEach(habitat => {
        const habitatName = habitat.dataset.habitat;
        if (!habitatName) return;

        const progressItem = document.createElement('div');
        progressItem.className = 'habitat-item';
        progressItem.dataset.habitat = habitatName;
        progressItem.innerHTML = `
            <div class="habitat-label">${habitatName}</div>
            <div class="habitat-bar-container">
                <div class="habitat-bar" style="width: 0%"></div>
                <div class="habitat-value">0.0%</div>
            </div>
        `;
        container.appendChild(progressItem);
    });
}

export function updateHabitatProgress() {
    const habitatItems = document.querySelectorAll('.habitat-item');
    if (!habitatItems.length) return;

    habitatItems.forEach(item => {
        const habitatName = item.dataset.habitat;
        if (!habitatName) return;

        const habitat = document.querySelector(`.tab-panel[data-habitat="${habitatName}"]`);
        if (!habitat) return;

        const fishCells = habitat.querySelectorAll('.fish-cell');
        let totalPossible = fishCells.length * RARITY_LEVELS.length;
        let activeCount = 0;

        fishCells.forEach(cell => {
            const activeCircles = cell.querySelectorAll('.toggle-circle.active');
            activeCount += activeCircles.length;
        });

        const percentage = totalPossible > 0 ? (activeCount / totalPossible * 100).toFixed(1) : '0.0';
        const bar = item.querySelector('.habitat-bar');
        const percentageText = item.querySelector('.habitat-value');
        
        if (bar && percentageText) {
            bar.style.width = `${percentage}%`;
            percentageText.textContent = `${percentage}%`;
        }
    });
}
