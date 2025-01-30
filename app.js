// Import modules
import { RARITY_LEVELS } from './js/config.js';
import { createProgressBars, updateProgressBars, updateAllProgress } from './js/progressBars.js';
import { createHabitatProgress, updateHabitatProgress } from './js/habitatProgress.js';
import { switchMainTab, createTabs } from './js/tabs.js';
import { saveFishState, loadFishState, loadCollapsibleStates, getCookie } from './js/state.js';
import { createFishTable, showFishDetails, getColumnsForScreenWidth } from './js/fish.js';

let fishData = null;

// Initialize everything when the page loads
function initializeApp() {
    // Load fish data
    fetch('fish.json')
        .then(response => response.json())
        .then(data => {
            // Store fish data globally
            fishData = data;
            
            // Create tabs with fish data
            createTabs(data);
            
            // Create progress bars
            createProgressBars();
            createHabitatProgress();
            
            // Add event listeners for tab switching
            document.querySelectorAll('.main-tab-button').forEach(button => {
                button.addEventListener('click', () => {
                    switchMainTab(button.dataset.tab);
                });
            });
            
            // Load saved states after DOM is ready
            setTimeout(() => {
                loadFishState();
                loadCollapsibleStates();
                
                // Initial progress update
                updateAllProgress();
            }, 0);
        })
        .catch(error => console.error('Error loading fish data:', error));
}

// Start the application
window.addEventListener('load', initializeApp);

// Help modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.getElementById('helpButton');
    const helpModal = document.getElementById('helpModal');
    const closeButton = document.querySelector('.close-button');

    if (helpButton && helpModal && closeButton) {
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });

        closeButton.addEventListener('click', () => {
            helpModal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
    }
});

// Quick options functionality
document.addEventListener('DOMContentLoaded', () => {
    const quickOptionsToggle = document.querySelector('.quick-options-toggle');
    const quickOptionsPanel = document.querySelector('.quick-options-panel');
    const filtersToggle = document.querySelector('.filters-toggle');
    const filtersPanel = document.querySelector('.filters-panel');
    const filterButton = document.querySelector('.filter-button');

    if (quickOptionsToggle && quickOptionsPanel) {
        quickOptionsToggle.addEventListener('click', () => {
            quickOptionsPanel.classList.toggle('show');
            quickOptionsToggle.textContent = quickOptionsPanel.classList.contains('show') 
                ? 'Quick Options ▲' 
                : 'Quick Options ▼';
        });
    }

    if (filtersToggle && filtersPanel) {
        filtersToggle.addEventListener('click', () => {
            filtersPanel.classList.toggle('show');
            filtersToggle.textContent = filtersPanel.classList.contains('show') 
                ? 'Filters ▲' 
                : 'Filters ▼';
        });
    }

    if (filterButton) {
        filterButton.addEventListener('click', () => {
            filterButton.classList.toggle('active');
            applyFilter();
        });
    }
});

// Function to apply fish filter
function applyFilter() {
    if (!fishData) return;
    
    const filterButton = document.querySelector('.filter-button[data-filter="all-qualities"]');
    const isActive = filterButton.classList.contains('active');
    const savedStates = JSON.parse(getCookie('fishRarityStates') || '{}');
    
    document.querySelectorAll('.tab-panel').forEach(panel => {
        const habitat = panel.getAttribute('data-habitat');
        const habitatData = Object.values(fishData.habitats).find(h => h.name === habitat);
        
        if (!habitatData) return;

        if (isActive) {
            // Filter out fully caught fish
            const visibleFish = habitatData.fish.filter(fish => {
                if (!savedStates[fish.name]) return true;
                return !savedStates[fish.name].every(state => state === true);
            });

            // Recreate table with filtered fish
            panel.innerHTML = '';
            if (visibleFish.length > 0) {
                const table = createFishTable(visibleFish, habitat, true);
                panel.appendChild(table);
            } else {
                const message = document.createElement('div');
                message.className = 'empty-filter-message';
                message.textContent = 'All fish caught!';
                message.style.textAlign = 'center';
                message.style.padding = '20px';
                message.style.fontFamily = "'Press Start 2P', cursive";
                panel.appendChild(message);
            }
        } else {
            // Show all fish
            panel.innerHTML = '';
            const table = createFishTable(habitatData.fish, habitat, false);
            panel.appendChild(table);
        }
    });

    // Restore fish states
    loadFishState();
}

// Function to apply quality filters
function applyQualityFilters() {
    if (!fishData) return;

    const activeFilters = Array.from(document.querySelectorAll('.quality-filter.active'))
        .map(filter => ({
            quality: parseInt(filter.dataset.quality),
            name: filter.textContent.trim()
        }));
    
    const savedStates = JSON.parse(getCookie('fishRarityStates') || '{}');
    
    document.querySelectorAll('.tab-panel').forEach(panel => {
        const habitat = panel.getAttribute('data-habitat');
        const habitatData = Object.values(fishData.habitats).find(h => h.name === habitat);
        
        if (!habitatData) return;

        if (activeFilters.length === 0) {
            // Show all fish when no filters are active
            panel.innerHTML = '';
            const table = createFishTable(habitatData.fish, habitat, false);
            panel.appendChild(table);
        } else {
            // Filter fish based on active quality filters
            // Show fish that don't have ANY of the selected qualities marked
            const visibleFish = habitatData.fish.filter(fish => {
                if (!savedStates[fish.name]) return true;
                return activeFilters.every(filter => !savedStates[fish.name][filter.quality]);
            });

            // Recreate table with filtered fish
            panel.innerHTML = '';
            if (visibleFish.length > 0) {
                const table = createFishTable(visibleFish, habitat, true);
                panel.appendChild(table);
            } else {
                const message = document.createElement('div');
                message.className = 'empty-filter-message';
                const qualityNames = activeFilters.map(f => f.name);
                const formattedQualities = qualityNames.length > 1 
                    ? qualityNames.slice(0, -1).join(', ') + ' & ' + qualityNames[qualityNames.length - 1]
                    : qualityNames[0];
                const habitatLower = habitat.toLowerCase();
                const fishWord = habitatLower === 'trash' ? '' : ' fish';
                message.textContent = `All ${habitatLower}${fishWord} caught in ${formattedQualities} quality!`;
                message.style.textAlign = 'center';
                message.style.padding = '20px';
                message.style.fontFamily = "'Press Start 2P', cursive";
                panel.appendChild(message);
            }
        }
    });

    // Restore fish states
    loadFishState();
}

// Make applyQualityFilters available globally for fish.js
window.applyQualityFilters = applyQualityFilters;

// Add event listeners for quality filters
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.quality-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            filter.classList.toggle('active');
            applyQualityFilters();
        });
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

// Add event listeners for quick actions
document.querySelectorAll('.quick-action.quality-action').forEach(action => {
    action.addEventListener('click', () => {
        const quality = parseInt(action.dataset.quality);
        const shouldActivate = action.dataset.action === 'activate';
        
        document.querySelectorAll('.fish-cell').forEach(cell => {
            const circles = cell.querySelectorAll('.toggle-circle');
            // If the circle exists and its current state is not what we want
            if (circles[quality]) {
                const isActive = circles[quality].classList.contains('active');
                // Only click if we need to change the state
                if (isActive !== shouldActivate) {
                    circles[quality].click();
                }
            }
        });
        
        updateAllProgress();
    });
});

// Add event listener for deselect-all
document.querySelector('.quick-action[data-action="deselect-all"]').addEventListener('click', () => {
    const confirmPopup = document.getElementById('confirmPopup');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');
    const confirmMessage = document.getElementById('confirmMessage');

    if (confirmPopup && confirmYes && confirmNo && confirmMessage) {
        confirmMessage.textContent = 'Are you sure you want to mark all fish as uncaught? This cannot be undone.';
        confirmPopup.style.display = 'flex';

        const handleYes = () => {
            document.querySelectorAll('.toggle-circle.active').forEach(circle => {
                circle.click();
            });
            confirmPopup.style.display = 'none';
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
        };

        const handleNo = () => {
            confirmPopup.style.display = 'none';
            confirmYes.removeEventListener('click', handleYes);
            confirmNo.removeEventListener('click', handleNo);
        };

        confirmYes.addEventListener('click', handleYes);
        confirmNo.addEventListener('click', handleNo);
    }
});
