// Fish data management
export async function loadFishData() {
    try {
        const response = await fetch('fish.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading fish data:', error);
        return null;
    }
}
