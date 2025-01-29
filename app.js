// Import modules
import { RARITY_LEVELS } from './js/config.js';
import { createProgressBars, updateProgressBars, updateAllProgress } from './js/progressBars.js';
import { createHabitatProgress, updateHabitatProgress } from './js/habitatProgress.js';
import { switchMainTab, createTabs } from './js/tabs.js';
import { loadFishData } from './js/fishData.js';
import { 
    saveFishState, 
    loadFishState, 
    getCookie, 
    setCookie,
    saveCollapsibleStates,
    loadCollapsibleStates,
    updateToggleText,
    updateFiltersToggleText
} from './js/state.js';
import { 
    createToggleCircles, 
    createFishTable,
    createFilteredFishTable,
    showFishDetails, 
    deselectAllFish, 
    selectQualityLevel 
} from './js/fish.js';

// Help modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.getElementById('helpButton');
    const helpPopup = document.getElementById('helpPopup');
    const helpClose = document.getElementById('helpClose');

    helpButton.addEventListener('click', () => {
        helpPopup.style.display = 'flex';
    });

    helpClose.addEventListener('click', () => {
        helpPopup.style.display = 'none';
    });

    helpPopup.addEventListener('click', (e) => {
        if (e.target === helpPopup) {
            helpPopup.style.display = 'none';
        }
    });
});

// Main application logic
document.addEventListener('DOMContentLoaded', async () => {
    // Cache DOM elements
    const mainTabButtons = document.querySelectorAll('.main-tab-button');
    const mainTabPanels = document.querySelectorAll('.main-tab-panel');
    const tabButtons = document.querySelector('.tab-buttons');
    const tabContent = document.querySelector('.tab-content');
    let progressBars = null;
    let progressValues = null;
    let totalFishCount = 0;
    let fishCells = null;

    // Optimized progress bar updates
    function updateProgressBars() {
        if (!progressBars) {
            progressBars = document.querySelectorAll('.progress-bar');
            progressValues = document.querySelectorAll('.progress-value');
        }

        // Count active circles for each rarity using a single DOM traversal
        const activeCounts = new Array(RARITY_LEVELS.length).fill(0);
        fishCells.forEach(cell => {
            const circles = cell.querySelectorAll('.toggle-circle');
            circles.forEach((circle, index) => {
                if (circle.classList.contains('active')) {
                    activeCounts[index]++;
                }
            });
        });

        // Update all progress bars at once
        activeCounts.forEach((count, index) => {
            const percentage = (count / totalFishCount * 100).toFixed(1);
            progressBars[index].style.width = `${percentage}%`;
            progressValues[index].textContent = `${percentage}%`;
        });
    }

    function createProgressBars() {
        const progressContainer = document.querySelector('.progress-bars');
        progressContainer.innerHTML = ''; // Clear existing bars

        RARITY_LEVELS.forEach((level, index) => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';

            const label = document.createElement('div');
            label.className = 'progress-label';
            label.textContent = level.name;

            const barContainer = document.createElement('div');
            barContainer.className = 'progress-bar-container';

            const bar = document.createElement('div');
            bar.className = 'progress-bar';
            bar.style.backgroundColor = level.color;

            const value = document.createElement('span');
            value.className = 'progress-value';
            value.textContent = '0%';

            barContainer.appendChild(bar);
            barContainer.appendChild(value);
            progressItem.appendChild(label);
            progressItem.appendChild(barContainer);
            progressContainer.appendChild(progressItem);
        });
    }

    function createHabitatProgress() {
        const habitatContainer = document.querySelector('.habitat-progress');
        habitatContainer.innerHTML = ''; // Clear existing items

        // Get all unique habitats from the tab buttons
        const habitats = Array.from(document.querySelectorAll('.tab-button'))
            .map(button => button.textContent.trim());

        habitats.forEach(habitat => {
            const habitatItem = document.createElement('div');
            habitatItem.className = 'habitat-item';

            const name = document.createElement('div');
            name.className = 'habitat-name';
            name.textContent = habitat;

            const barContainer = document.createElement('div');
            barContainer.className = 'habitat-bar-container';

            const bar = document.createElement('div');
            bar.className = 'habitat-bar';

            const percentage = document.createElement('div');
            percentage.className = 'habitat-percentage';
            percentage.textContent = '0%';

            barContainer.appendChild(bar);
            barContainer.appendChild(percentage);
            habitatItem.appendChild(name);
            habitatItem.appendChild(barContainer);
            habitatContainer.appendChild(habitatItem);
        });
    }

    function updateHabitatProgress() {
        const habitatItems = document.querySelectorAll('.habitat-item');
        
        habitatItems.forEach(item => {
            const habitatName = item.querySelector('.habitat-name').textContent;
            const habitatPanel = document.querySelector(`.tab-panel[data-habitat="${habitatName}"]`);
            
            if (habitatPanel) {
                const circles = habitatPanel.querySelectorAll('.toggle-circle');
                let activeCount = 0;
                const totalPossible = circles.length; // Total number of possible qualities (fish count * 6)

                // Count all active circles
                circles.forEach(circle => {
                    if (circle.classList.contains('active')) {
                        activeCount++;
                    }
                });

                const percentage = totalPossible > 0 ? (activeCount / totalPossible * 100).toFixed(1) : '0.0';
                const bar = item.querySelector('.habitat-bar');
                const percentageText = item.querySelector('.habitat-percentage');
                
                bar.style.width = `${percentage}%`;
                percentageText.textContent = `${percentage}%`;
            }
        });
    }

    // Update both progress types when needed
    function updateAllProgress() {
        updateProgressBars();
        updateHabitatProgress();
    }

    // Optimized tab switching
    function switchMainTab(tabId) {
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

    mainTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchMainTab(button.dataset.tab);
        });
    });

    // Function to create toggle circles with optimized event handling
    function createToggleCircles() {
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

    // Function to create fish table
    function createFishTable(fishes, habitat) {
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

    // Create a modified version of createFishTable that optionally skips empty cells
    function createFilteredFishTable(fishes, habitat, skipEmptyCells = false) {
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

        // Only add empty cells if not skipping them
        if (!skipEmptyCells) {
            const remainingCells = cellsPerRow - (fishes.length % cellsPerRow);
            if (remainingCells !== cellsPerRow) {
                for (let i = 0; i <remainingCells; i++) {
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

    // Function to get number of columns based on screen width
    function getColumnsForScreenWidth() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        if (width <= 1024) return 3;
        return 4;
    }

    // Function to show fish details
    function showFishDetails(fish) {
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
        
        // Add best lure if catch chances are available
        if (fish['Catch Chances']) {
            // Find the lure with highest percentage
            let bestLure = Object.entries(fish['Catch Chances']).reduce((best, current) => {
                const currentPercentage = parseFloat(current[1].replace('%', ''));
                const bestPercentage = parseFloat(best[1].replace('%', ''));
                return currentPercentage > bestPercentage ? current : best;
            });

            const chances = document.createElement('div');
            chances.className = 'detail-item';
            chances.innerHTML = `
                <div class="detail-label">Best Lure:</div>
                <div class="detail-value">${bestLure[0]} (${bestLure[1]})</div>
            `;
            info.appendChild(chances);
        }
        
        // Add wiki link if page_url is available
        if (fish.page_url) {
            const wikiLink = document.createElement('div');
            wikiLink.className = 'wiki-link';
            wikiLink.innerHTML = `<a href="${fish.page_url}" target="_blank">View on Wiki</a>`;
            info.appendChild(wikiLink);
        }
        
        container.appendChild(info);
        content.appendChild(container);
        popup.style.display = 'flex';
    }

    // Add event listener for the close button
    document.getElementById('fishDetailsClose').addEventListener('click', () => {
        document.getElementById('fishDetailsPopup').style.display = 'none';
    });

    // Close modal when clicking outside
    document.getElementById('fishDetailsPopup').addEventListener('click', (e) => {
        if (e.target.id === 'fishDetailsPopup') {
            e.target.style.display = 'none';
        }
    });

    try {
        const fishData = await loadFishData();
        // Cache fish cells after creating the table
        fishCells = document.querySelectorAll('.fish-table td');
        totalFishCount = document.querySelectorAll('.fish-table td span').length;
        
        // Load saved states after all elements are created
        loadFishState();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('app').innerHTML = '<p>Error loading data. Please make sure fish.json is in the same directory.</p>';
    }

    // Add window resize handler to update tables when screen size changes
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce the resize event
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Get the current active tab
            const activeTab = document.querySelector('.tab-content .tab-panel.active');
            if (activeTab) {
                const habitat = activeTab.getAttribute('data-habitat');
                const fishes = activeTab.getAttribute('data-fishes');
                if (habitat && fishes) {
                    // Recreate the table with new column count
                    const fishData = JSON.parse(fishes);
                    activeTab.innerHTML = '';
                    activeTab.appendChild(createFishTable(fishData, habitat));
                }
            }
        }, 250); // Wait 250ms after last resize event
    });
});

// Store fish data for filtering
let fishData = null;

// Get DOM elements
const quickOptionsToggle = document.querySelector('.quick-options-toggle');
const quickOptionsPanel = document.querySelector('.quick-options-panel');
const quickActions = document.querySelectorAll('.quick-action');
const filtersToggle = document.querySelector('.filters-toggle');
const filtersPanel = document.querySelector('.filters-panel');
const filterButton = document.querySelector('.filter-button');

// Function to apply fish filter
function applyFilter() {
    if (!fishData) return;
    
    const hideAllQualities = filterButton.classList.contains('active');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Get saved states from cookie
    const savedStates = JSON.parse(getCookie('fishRarityStates') || '{}');

    tabPanels.forEach(panel => {
        const habitat = panel.getAttribute('data-habitat');
        const habitatData = Object.values(fishData.habitats).find(h => h.name === habitat);
        
        if (!habitatData) return;

        if (hideAllQualities) {
            const fishCells = panel.querySelectorAll('.fish-cell');
            // Get all fish that are not fully caught
            const visibleFish = Array.from(fishCells).filter(cell => {
                const fishName = cell.querySelector('.fish-name')?.textContent;
                if (!fishName || !savedStates[fishName]) return true;
                return !savedStates[fishName].every(state => state === true);
            }).map(cell => {
                return {
                    name: cell.querySelector('.fish-name').textContent,
                    icon: cell.querySelector('.fish-image').src
                };
            });

            // Clear and recreate the table with filtered fish
            panel.innerHTML = '';
            const table = createFilteredFishTable(visibleFish, habitat, true); // Skip empty cells for filtered view
            panel.appendChild(table);
        } else {
            // Show all fish when filter is off
            panel.innerHTML = '';
            const table = createFilteredFishTable(habitatData.fish, habitat, false); // Keep empty cells for full view
            panel.appendChild(table);
        }
    });

    // Restore fish states from cookie after recreating tables
    document.querySelectorAll('.fish-cell').forEach(cell => {
        const fishName = cell.querySelector('.fish-name')?.textContent;
        if (fishName && savedStates[fishName]) {
            const circles = cell.querySelectorAll('.toggle-circle');
            savedStates[fishName].forEach((isActive, index) => {
                if (isActive) circles[index].classList.add('active');
            });
        }
    });
}

// Initialize everything when the page loads
async function initializeApp() {
    // Load fish data
    fishData = await loadFishData();
    if (!fishData) return;

    // Create habitat tabs
    createTabs(fishData);

    // Create progress bars
    createProgressBars();
    createHabitatProgress();

    // Add event listeners for quick options
    quickOptionsToggle.addEventListener('click', () => {
        quickOptionsPanel.classList.toggle('show');
        updateToggleText();
        saveCollapsibleStates();
    });

    // Add event listeners for filters
    filtersToggle.addEventListener('click', () => {
        filtersPanel.classList.toggle('show');
        updateFiltersToggleText();
        saveCollapsibleStates();
    });

    // Add event listener for filter button
    filterButton.addEventListener('click', () => {
        filterButton.classList.toggle('active');
        applyFilter();
    });

    // Add event listeners for quick actions
    quickActions.forEach(action => {
        action.addEventListener('click', () => {
            const quality = parseInt(action.dataset.quality);
            selectQualityLevel(quality);
            saveFishState();
            updateAllProgress();
        });
    });

    // Load saved states
    loadFishState();
    loadCollapsibleStates();
}

// Start the application
window.addEventListener('load', initializeApp);
