import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src/assets/images');
const destDir = path.join(process.cwd(), 'public/assets/images');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    let shouldCopy = true;
    if (fs.existsSync(dest)) {
      const destStats = fs.statSync(dest);
      if (stats.size === destStats.size) {
        shouldCopy = false;
      }
    }
    if (shouldCopy) {
      fs.copyFileSync(src, dest);
    }
  }
}

try {
  console.log('Syncing assets from src/assets/images to public/assets/images...');
  copyRecursive(srcDir, destDir);
  console.log('Asset sync completed successfully!');
} catch (err) {
  console.error('Error syncing assets:', err);
}
