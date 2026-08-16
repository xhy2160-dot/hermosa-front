/**
 * Generates a consistent, professional pastel gradient and solid border color based on a string.
 * @param {string} seedString - Unique string (e.g. treatment name or appointment ID)
 * @returns {Object} { background, borderLeftColor, textColor }
 */
export function getEventColors(seedString) {
    if (!seedString) {
        return {
            background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
            borderLeftColor: '#2563eb',
            textColor: '#1e3a8a'
        };
    }

    // A list of highly readable, professional, curated pastel palettes
    const palettes = [
        { // Blue
            bgStart: '#dbeafe', bgEnd: '#eff6ff', border: '#2563eb', text: '#1e3a8a'
        },
        { // Emerald / Green
            bgStart: '#d1fae5', bgEnd: '#f0fdf4', border: '#10b981', text: '#065f46'
        },
        { // Violet / Purple
            bgStart: '#ede9fe', bgEnd: '#f5f3ff', border: '#8b5cf6', text: '#5b21b6'
        },
        { // Amber / Orange
            bgStart: '#fef3c7', bgEnd: '#fffbeb', border: '#f59e0b', text: '#92400e'
        },
        { // Rose / Pink
            bgStart: '#ffe4e6', bgEnd: '#fff1f2', border: '#f43f5e', text: '#9f1239'
        },
        { // Teal
            bgStart: '#ccfbf1', bgEnd: '#f0fdfa', border: '#14b8a6', text: '#115e59'
        },
        { // Indigo
            bgStart: '#e0e7ff', bgEnd: '#eef2ff', border: '#4f46e5', text: '#3730a3'
        }
    ];

    // Simple string hashing (DJB2) to pick a stable index
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % palettes.length;
    return palettes[index];
}