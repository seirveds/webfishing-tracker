// Cookie and state management functions
export function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

export function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

export function saveFishState() {
    const state = {};
    document.querySelectorAll('.fish-cell').forEach(cell => {
        const fishName = cell.querySelector('.fish-name').textContent;
        const activeCircles = Array.from(cell.querySelectorAll('.toggle-circle.active'))
            .map(circle => parseInt(circle.dataset.rarity));
        if (activeCircles.length > 0) {
            state[fishName] = activeCircles;
        }
    });
    setCookie('fishState', JSON.stringify(state));
}

export function loadFishState() {
    const state = getCookie('fishState');
    if (state) {
        const fishState = JSON.parse(state);
        document.querySelectorAll('.fish-cell').forEach(cell => {
            const fishName = cell.querySelector('.fish-name').textContent;
            const savedState = fishState[fishName];
            if (savedState) {
                cell.querySelectorAll('.toggle-circle').forEach(circle => {
                    const rarity = parseInt(circle.dataset.rarity);
                    if (savedState.includes(rarity)) {
                        circle.classList.add('active');
                    }
                });
            }
        });
    }
}
