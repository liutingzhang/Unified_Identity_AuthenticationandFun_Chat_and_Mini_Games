const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../angry_birds.html');
const content = fs.readFileSync(filePath, 'utf8');

const requiredIds = [
    'gameCanvas', 'score', 'startBtn', 'restartBtn', 'pauseBtn', 
    'settingsBtn', 'statsBtn', 'skillsBtn', 'levelSelection', 
    'dailyChallengeBtn', 'windPreview', 'routePreview', 'materialLegend',
    'overlay', 'overlayContent', 'nextLevelBtn', 'restartLevelBtn', 
    'backToSelectBtn', 'watchReplayBtn', 'settingsPanel', 'statsPanel', 'skillsPanel'
];

// Simple regex check for IDs
let missing = [];
requiredIds.forEach(id => {
    if (!content.includes(`id="${id}"`)) {
        // overlayContent is class in CSS but maybe ID in JS? 
        // Let's check if it was ID or class.
        // In original code: <div class="overlay-content">
        if (id === 'overlayContent') {
             if (!content.includes('class="overlay-content"')) missing.push(id);
        } else {
             missing.push(id);
        }
    }
});

if (missing.length > 0) {
    console.error('Missing IDs/Classes:', missing);
    process.exit(1);
} else {
    console.log('All required UI elements present.');
}

// Check for CSS variables
if (!content.includes('--glass-bg') || !content.includes('backdrop-filter')) {
    console.error('New CSS styles missing.');
    process.exit(1);
}

console.log('Verification successful.');
