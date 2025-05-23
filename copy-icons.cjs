const fs = require('fs');
const path = require('path');

const iconsToCopy = [
    'Arrows/arrow-down-line.svg',
    'Arrows/arrow-left-s-line.svg',
    'Arrows/arrow-right-line.svg',
    'Arrows/arrow-right-s-line.svg',
    'Business/calendar-event-fill.svg',
    'Business/global-line.svg',
    'Finance/ticket-2-line.svg',
    'Logos/facebook-circle-fill.svg',
    'Logos/linkedin-box-fill.svg',
    'Logos/xing-fill.svg',
    'Map/map-pin-2-fill.svg',
    'Media/live-fill.svg',
    'System/time-fill.svg',
];

const srcDir = path.resolve(__dirname, 'node_modules/remixicon/icons');
const destDir = path.resolve(__dirname, 'site/templates/components/icons');

function transformAndCopyFiles(src, dest, files) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    files.forEach((file) => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file.substring(file.lastIndexOf('/') + 1).replace('.svg', '.blade.php'));
        if (fs.existsSync(srcFile)) {
            let svgContent = fs.readFileSync(srcFile, 'utf8');
            // Add a class attribute to the SVG tag
            svgContent = svgContent.replace('<svg', '<svg class="{{ $class ?? \'\' }}" aria-hidden="true"');
            fs.writeFileSync(destFile, svgContent);
            console.log(`Transformed and copied ${file} to ${destFile}`);
        } else {
            console.warn(`File ${file} does not exist in the source directory.`);
        }
    });
}

transformAndCopyFiles(srcDir, destDir, iconsToCopy);
console.log('Selected SVG icons transformed and copied successfully.');
