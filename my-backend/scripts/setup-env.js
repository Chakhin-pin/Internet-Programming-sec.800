const crypto = require('crypto');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const existingContents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const existing = dotenv.parse(existingContents);
(async () => {
  const additions = [];
  if (!existing.JWT_SECRET) {
    additions.push(`JWT_SECRET=${crypto.randomBytes(48).toString('base64url')}`);
  }

  if (additions.length === 0) {
    console.log('.env already contains JWT_SECRET.');
    return;
  }

  const separator = existingContents && !existingContents.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(envPath, `${existingContents}${separator}${additions.join('\n')}\n`, 'utf8');
  console.log(`Added ${additions.length} authentication variable(s) to ${envPath}.`);
})();
