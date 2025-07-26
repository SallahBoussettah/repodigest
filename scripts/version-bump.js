#!/usr/bin/env node

/**
 * Simple version bump script for RepoDigest
 * Usage: node scripts/version-bump.js [patch|minor|major]
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const versionType = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  // Read current package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const currentVersion = packageJson.version;
  
  // Parse current version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // Calculate new version
  let newVersion;
  switch (versionType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  // Update package.json
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  
  // Get current date
  const currentDate = new Date().toISOString().split('T')[0];
  
  console.log(`🚀 Version bumped from ${currentVersion} to ${newVersion}`);
  console.log(`📝 Don't forget to update CHANGELOG.md with the new version [${newVersion}] - ${currentDate}`);
  console.log(`💡 Suggested changelog entry:`);
  console.log(`\n## [${newVersion}] - ${currentDate}\n`);
  console.log(`### Added`);
  console.log(`- New feature description`);
  console.log(`\n### Changed`);
  console.log(`- Updated feature description`);
  console.log(`\n### Fixed`);
  console.log(`- Bug fix description\n`);
  
} catch (error) {
  console.error('❌ Error updating version:', error.message);
  process.exit(1);
}