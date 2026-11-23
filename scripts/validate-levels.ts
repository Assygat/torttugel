// Сөздік қорын тексеру: `npm run validate`
// (Node 22.6+ TypeScript файлдарын тікелей іске қоса алады.)
import { levels } from '../src/data/levels.ts';
import { validateLevels } from '../src/data/validate.ts';

const errors = validateLevels(levels);
const wordCount = levels.reduce(
  (sum, l) => sum + l.categories.reduce((s, c) => s + c.words.length, 0),
  0,
);

if (errors.length) {
  console.error(`✗ Сөздік қорында ${errors.length} қате табылды:\n`);
  for (const e of errors) console.error('  • ' + e);
  process.exit(1);
}
console.log(`✓ Сөздік қоры дұрыс: ${levels.length} деңгей, ${wordCount} сөз.`);
