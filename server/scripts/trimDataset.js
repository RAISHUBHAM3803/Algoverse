/**
 * AlgoVerse - Dataset Trimmer
 *
 * Trims raw-dataset.json to exactly 1500 problems while maintaining
 * a proportional difficulty distribution (Easy / Medium / Hard).
 *
 * Distribution from source (3958 total):
 *   Easy   ~24% → 360
 *   Medium ~52% → 780
 *   Hard   ~24% → 360
 *
 * Usage:
 *   node scripts/trimDataset.js
 */

const fs   = require('fs');
const path = require('path');

const RAW_PATH    = path.join(__dirname, 'raw-dataset.json');
const OUTPUT_PATH = path.join(__dirname, 'raw-dataset.json'); // overwrite in place
const BACKUP_PATH = path.join(__dirname, 'raw-dataset-full.json'); // keep original backup

const TARGET_TOTAL  = 1500;
const TARGET_EASY   = 360;
const TARGET_MEDIUM = 780;
const TARGET_HARD   = 360;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function trimDataset() {
  console.log('📂 Reading raw dataset...');

  if (!fs.existsSync(RAW_PATH)) {
    console.error(`❌ File not found: ${RAW_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(RAW_PATH, 'utf8');
  const problems = JSON.parse(rawData);

  console.log(`Found ${problems.length} problems in raw dataset.`);

  // Separate by difficulty (case-insensitive)
  const easy   = problems.filter(p => (p.difficulty || '').toLowerCase() === 'easy');
  const medium = problems.filter(p => (p.difficulty || '').toLowerCase() === 'medium');
  const hard   = problems.filter(p => (p.difficulty || '').toLowerCase() === 'hard');
  const other  = problems.filter(p => !['easy', 'medium', 'hard'].includes((p.difficulty || '').toLowerCase()));

  console.log(`  Easy:   ${easy.length}`);
  console.log(`  Medium: ${medium.length}`);
  console.log(`  Hard:   ${hard.length}`);
  console.log(`  Other:  ${other.length}`);

  // Shuffle each group and pick the target count
  const selectedEasy   = shuffle([...easy]).slice(0, Math.min(TARGET_EASY,   easy.length));
  const selectedMedium = shuffle([...medium]).slice(0, Math.min(TARGET_MEDIUM, medium.length));
  const selectedHard   = shuffle([...hard]).slice(0, Math.min(TARGET_HARD,   hard.length));

  const combined = shuffle([...selectedEasy, ...selectedMedium, ...selectedHard]);

  console.log(`\n✅ Selected ${combined.length} problems:`);
  console.log(`  Easy:   ${selectedEasy.length}`);
  console.log(`  Medium: ${selectedMedium.length}`);
  console.log(`  Hard:   ${selectedHard.length}`);

  // Backup the full original
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.writeFileSync(BACKUP_PATH, rawData, 'utf8');
    console.log(`\n💾 Full backup saved to: raw-dataset-full.json`);
  } else {
    console.log(`\nℹ️  Backup already exists at raw-dataset-full.json (not overwritten).`);
  }

  // Write trimmed dataset back
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(combined, null, 2), 'utf8');
  console.log(`\n✅ Trimmed dataset (${combined.length} problems) written to: raw-dataset.json`);
  console.log('\nNext step: run  node scripts/formatDataset.js  to regenerate dataset.json');
}

trimDataset().catch(err => {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
});
