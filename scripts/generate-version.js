#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 生成版本信息脚本
 * 获取当前 Git commit hash 并写入 dist/version.txt
 */

function getGitCommitHash() {
  try {
    // 获取当前 commit 的完整 hash
    const fullHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    console.log(`✓ 获取 Git commit hash: ${fullHash}`);
    return fullHash;
  } catch (error) {
    console.warn('⚠️  无法获取 Git commit hash，可能不在 Git 仓库中');
    return 'unknown';
  }
}

function getGitBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    return branch;
  } catch (error) {
    return 'unknown';
  }
}

function getGitTag() {
  try {
    const tag = execSync('git describe --tags --exact-match HEAD', { encoding: 'utf8' }).trim();
    return tag;
  } catch (error) {
    // 如果没有 tag，返回 null
    return null;
  }
}

function getBuildTime() {
  return new Date().toISOString();
}

function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    return 'unknown';
  }
}

function generateVersionInfo() {
  const commitHash = getGitCommitHash();
  const branch = getGitBranch();
  const tag = getGitTag();
  const buildTime = getBuildTime();
  const packageVersion = getPackageVersion();

  // 确保 dist 目录存在
  const distDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('✓ 创建 dist 目录');
  }

  // 写入 version.txt (仅包含 commit hash)
  const versionFile = path.join(distDir, 'version.txt');
  fs.writeFileSync(versionFile, commitHash);
  console.log(`✓ 生成 version.txt: ${commitHash}`);

  // 生成详细的版本信息 JSON
  const versionInfo = {
    version: packageVersion,
    commitHash: commitHash,
    shortHash: commitHash.substring(0, 7),
    branch: branch,
    tag: tag,
    buildTime: buildTime,
    buildTimestamp: Date.now()
  };

  const versionJsonFile = path.join(distDir, 'version.json');
  fs.writeFileSync(versionJsonFile, JSON.stringify(versionInfo, null, 2));
  console.log(`✓ 生成 version.json`);

  console.log('\n📦 版本信息:');
  console.log(`   Package Version: ${packageVersion}`);
  console.log(`   Commit Hash: ${commitHash}`);
  console.log(`   Short Hash: ${commitHash.substring(0, 7)}`);
  console.log(`   Branch: ${branch}`);
  console.log(`   Tag: ${tag || 'none'}`);
  console.log(`   Build Time: ${buildTime}`);

  return versionInfo;
}

// 执行生成版本信息
if (require.main === module) {
  generateVersionInfo();
}

module.exports = { generateVersionInfo };