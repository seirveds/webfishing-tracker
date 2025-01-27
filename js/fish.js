import { RARITY_LEVELS } from './config.js';
import { updateAllProgress } from './progressBars.js';
import { saveFishState } from './state.js';

// Function to create toggle circles with optimized event handling
export function createToggleCircles() {
    const container = document.createElement('div');
    container.className = 'circle-container';
    
    RARITY_LEVELS.forEach((rarity, i) => {
        const circle = document.createElement('div');
        circle.className = 'toggle-circle';
        circle.title = rarity.name;
        circle.setAttribute('data-rarity', i);
        circle.style.setProperty('--circle-color', rarity.color);
        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            circle.classList.toggle('active');
            // Delay updates to next frame for better performance
            requestAnimationFrame(() => {
                if (document.querySelector('#completion-tab').classList.contains('active')) {
                    updateAllProgress();
                }
                saveFishState();
            });
        });
        container.appendChild(circle);
    });
    
    return container;
}

// Function to get number of columns based on screen width
export function getColumnsForScreenWidth() {
    const width = window.innerWidth;
    if (width <= 480) return 1;
    if (width <= 768) return 2;
    if (width <= 1024) return 3;
    return 4;
}

// Function to create fish table
export function createFishTable(fishes, habitat) {
    const table = document.createElement('table');
    table.className = 'fish-table';
    
    // Get number of columns based on screen width
    const cellsPerRow = habitat === 'Misc' ? 2 : getColumnsForScreenWidth();
    
    let currentRow;
    fishes.forEach((fish, index) => {
        if (index % cellsPerRow === 0) {
            currentRow = document.createElement('tr');
            table.appendChild(currentRow);
        }
        
        const cell = document.createElement('td');
        cell.className = 'fish-cell';
        cell.style.width = `${100 / cellsPerRow}%`;

        // Add click handler for the cell
        cell.addEventListener('click', (e) => {
            // Only show details if not clicking on circles or checkbox
            if (!e.target.classList.contains('toggle-circle') && 
                !e.target.classList.contains('fish-checkbox')) {
                showFishDetails(fish);
            }
        });

        // Create fish info container
        const fishInfo = document.createElement('div');
        fishInfo.className = 'fish-info';

        // Add fish name first
        const nameSpan = document.createElement('span');
        nameSpan.className = 'fish-name';
        nameSpan.textContent = fish.name;
        fishInfo.appendChild(nameSpan);

        // Add fish image second
        const img = document.createElement('img');
        img.src = fish.icon || 'placeholder.png';
        img.alt = fish.name;
        img.className = 'fish-image';
        fishInfo.appendChild(img);

        cell.appendChild(fishInfo);

        // Add toggle circles last
        const circles = createToggleCircles();
        cell.appendChild(circles);

        currentRow.appendChild(cell);
    });

    // Fill remaining cells in the last row if needed
    const remainingCells = cellsPerRow - (fishes.length % cellsPerRow);
    if (remainingCells !== cellsPerRow) {
        for (let i = 0; i < remainingCells; i++) {
            const cell = document.createElement('td');
            cell.style.width = `${100 / cellsPerRow}%`;
            const fishInfo = document.createElement('div');
            fishInfo.className = 'fish-info';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'fish-name';
            fishInfo.appendChild(nameSpan);
            
            cell.appendChild(fishInfo);
            
            // Add toggle circles to empty cells too
            const circles = createToggleCircles();
            cell.appendChild(circles);
            
            currentRow.appendChild(cell);
        }
    }

    return table;
}

// Function to show fish details
export function showFishDetails(fish) {
    const popup = document.getElementById('fishDetailsPopup');
    const title = popup.querySelector('.fish-details-title');
    const content = popup.querySelector('.fish-details-content');
    
    title.textContent = fish.name;
    
    // Create content with image and details
    content.innerHTML = '';
    
    // Create main container for vertical layout
    const container = document.createElement('div');
    container.className = 'fish-details-container';
    
    // Add fish image
    if (fish.icon) {
        const img = document.createElement('img');
        img.src = fish.icon;
        img.alt = fish.name;
        img.className = 'fish-details-image';
        container.appendChild(img);
    }
    
    // Add fish info
    const info = document.createElement('div');
    info.className = 'fish-details-info';
    
    if (fish.Info) {
        // Add scientific name if available
        if (fish.Info['Scientific Name']) {
            const scientific = document.createElement('div');
            scientific.className = 'detail-item';
            scientific.innerHTML = `
                <div class="detail-label">Scientific Name:</div>
                <div class="detail-value"><em>${fish.Info['Scientific Name']}</em></div>
            `;
            info.appendChild(scientific);
        }
        
        // Add flavor text if available
        if (fish.Info['Flavor Text']) {
            const flavor = document.createElement('div');
            flavor.className = 'detail-item';
            flavor.innerHTML = `
                <div class="detail-label">Description:</div>
                <div class="detail-value">${fish.Info['Flavor Text']}</div>
            `;
            info.appendChild(flavor);
        }
        
        // Add tier if available
        if (fish.Info['Tier']) {
            const tier = document.createElement('div');
            tier.className = 'detail-item';
            tier.innerHTML = `
                <div class="detail-label">Tier:</div>
                <div class="detail-value">${fish.Info['Tier']}</div>
            `;
            info.appendChild(tier);
        }
    }

    // Add catch chances if available
    if (fish['Catch Chances']) {
        const chances = document.createElement('div');
        chances.className = 'detail-item';
        
        // Find highest catch chance
        const highestChance = Object.entries(fish['Catch Chances'])
            .reduce((highest, [location, chance]) => {
                const currentChance = parseFloat(chance);
                return currentChance > highest.chance 
                    ? { location, chance: currentChance }
                    : highest;
            }, { location: '', chance: 0 });
            
        chances.innerHTML = `
            <div class="detail-label">Best Lure:</div>
            <div class="detail-value">${highestChance.location} (${highestChance.chance.toFixed(3)}%)</div>
        `;
        info.appendChild(chances);
    }
    
    container.appendChild(info);
    content.appendChild(container);
    popup.style.display = 'flex';
}

// Quick Options functionality
export function deselectAllFish() {
    document.querySelectorAll('.toggle-circle.active').forEach(circle => {
        circle.classList.remove('active');
    });
    
    requestAnimationFrame(() => {
        if (document.querySelector('#completion-tab').classList.contains('active')) {
            updateAllProgress();
        }
        saveFishState();
    });
}

export function selectQualityLevel(qualityIndex) {
    document.querySelectorAll('.fish-cell').forEach(cell => {
        const circle = cell.querySelector(`.toggle-circle[data-rarity="${qualityIndex}"]`);
        if (circle) {
            circle.classList.add('active');
        }
    });
    
    requestAnimationFrame(() => {
        if (document.querySelector('#completion-tab').classList.contains('active')) {
            updateAllProgress();
        }
        saveFishState();
    });
}
