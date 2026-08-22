require('dotenv').config();
const { execSync } = require('child_process');

console.log("Redirecting seed script to clean, approved migrate-mash-data.js...");
try {
  execSync('node scripts/migrate-mash-data.js', { stdio: 'inherit' });
} catch (e) {
  console.error("Migration failed:", e.message);
  process.exit(1);
}
