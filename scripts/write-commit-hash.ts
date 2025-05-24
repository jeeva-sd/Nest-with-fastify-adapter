import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const hash = execSync('git rev-parse --short HEAD').toString().trim();
writeFileSync('src/constants/commit-hash.ts', `export const COMMIT_HASH = '${hash}';\n`);
