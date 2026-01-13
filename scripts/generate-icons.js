/**
 * PWA Icon Generator Script
 * 
 * This script generates PNG icons from the SVG source.
 * Run: node scripts/generate-icons.js
 * 
 * Requirements: sharp (npm install sharp --save-dev)
 * 
 * If sharp is not available, you can use online tools like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const svgPath = path.join(iconsDir, 'icon.svg');

async function generateIcons() {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');
    
    console.log('Generating PWA icons using sharp...');
    
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${size}x${size} icon`);
    }
    
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Sharp not installed. Creating placeholder icons...');
      console.log('For production, install sharp: npm install sharp --save-dev');
      console.log('Then run: node scripts/generate-icons.js\n');
      
      // Create simple placeholder message
      console.log('Alternative: Use online tools to convert the SVG:');
      console.log('1. Open public/icons/icon.svg in browser');
      console.log('2. Use https://www.pwabuilder.com/imageGenerator');
      console.log('3. Upload the SVG and download all sizes');
    } else {
      console.error('Error generating icons:', error);
    }
  }
}

generateIcons();
