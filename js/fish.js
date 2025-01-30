import { RARITY_LEVELS } from './config.js';
import { updateAllProgress } from './progressBars.js';
import { saveFishState } from './state.js';

// Function to create toggle circles with optimized event handling
export function createToggleCircles(activeStates = []) {
    const container = document.createElement('div');
    container.className = 'circle-container';
    
    RARITY_LEVELS.forEach((rarity, i) => {
        const circle = document.createElement('div');
        circle.className = 'toggle-circle';
        if (activeStates[i]) {
            circle.classList.add('active');
        }
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
                updateRemainingFish();
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
export function createFishTable(fishes, habitat, skipEmptyCells = false) {
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
    if (!skipEmptyCells) {
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
    }

    return table;
}

// Function to create filtered fish table
export function createFilteredFishTable(fishes, habitat, skipEmptyCells = false) {
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
        cell.dataset.fish = fish.name;

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

        // Get existing circle states if they exist
        const existingCell = document.querySelector(`.fish-cell[data-fish="${fish.name}"]`);
        const activeStates = [];
        if (existingCell) {
            existingCell.querySelectorAll('.toggle-circle').forEach(circle => {
                activeStates.push(circle.classList.contains('active'));
            });
        }

        // Add toggle circles with preserved states
        const circles = createToggleCircles(activeStates);
        cell.appendChild(circles);

        currentRow.appendChild(cell);
    });

    // Only add empty cells if not skipping them
    if (!skipEmptyCells) {
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
    }
    
    return table;
}

// Function to show fish details
export function showFishDetails(fish) {
    const popup = document.getElementById('fishDetailsPopup');
    const title = popup.querySelector('.fish-details-title');
    const content = popup.querySelector('.fish-details-content');
    
    title.innerHTML = `${fish.name}${fish.Info && fish.Info['Scientific Name'] ? `<div class="scientific-name"><em>${fish.Info['Scientific Name']}</em></div>` : ''}`;
    
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
        // Add flavor text if available
        if (fish.Info['Flavor Text']) {
            const flavor = document.createElement('div');
            flavor.className = 'detail-item flavor-text';
            flavor.innerHTML = `<div class="detail-value">${fish.Info['Flavor Text']}</div>`;
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
    
    // Add wiki link if available
    if (fish.page_url) {
        // Remove any existing wiki buttons first
        const existingWikiButtons = popup.querySelectorAll('.wiki-button');
        existingWikiButtons.forEach(button => button.remove());

        const wikiLink = document.createElement('a');
        wikiLink.href = fish.page_url;
        wikiLink.target = "_blank";
        wikiLink.className = 'popup-button wiki-button';
        wikiLink.textContent = "View on Wiki";
        
        // Insert before the close button
        const buttonsContainer = popup.querySelector('.popup-buttons');
        const closeButton = popup.querySelector('#fishDetailsClose');
        buttonsContainer.insertBefore(wikiLink, closeButton);
    }
    
    popup.style.display = 'flex';
}

// Function to update remaining fish
export function updateRemainingFish() {
    const remainingList = document.querySelector('.remaining-list');
    if (!remainingList) return;

    remainingList.innerHTML = ''; // Clear existing list
    
    // Get all fish cells and their status
    const fishCells = document.querySelectorAll('.fish-cell');
    const remainingFish = [];

    fishCells.forEach(cell => {
        const fishName = cell.dataset.fish;
        const habitat = cell.closest('.tab-panel').dataset.habitat;
        const activeCircles = cell.querySelectorAll('.toggle-circle.active');
        const totalCircles = cell.querySelectorAll('.toggle-circle');
        
        if (activeCircles.length < totalCircles.length) {
            const remainingQualities = [];
            cell.querySelectorAll('.toggle-circle').forEach((circle, index) => {
                if (!circle.classList.contains('active')) {
                    remainingQualities.push(RARITY_LEVELS[index]);
                }
            });
            
            remainingFish.push({
                name: fishName,
                habitat: habitat,
                qualities: remainingQualities
            });
        }
    });

    // Sort remaining fish by habitat and name
    remainingFish.sort((a, b) => {
        if (a.habitat !== b.habitat) {
            return a.habitat.localeCompare(b.habitat);
        }
        return a.name.localeCompare(b.name);
    });

    // Create list items
    remainingFish.forEach(fish => {
        const item = document.createElement('div');
        item.className = 'remaining-fish-item';
        item.innerHTML = `
            <div class="remaining-fish-name">${fish.name}</div>
            <div class="remaining-fish-habitat">${fish.habitat}</div>
            <div class="remaining-fish-details">Missing: ${fish.qualities.join(', ')}</div>
        `;
        remainingList.appendChild(item);
    });
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
        updateRemainingFish();
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
        updateRemainingFish();
    });
}
