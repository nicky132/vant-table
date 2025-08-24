import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * Vite 版本插件
 * 在构建时自动生成版本信息文件
 */
export function versionPlugin() {
  return {
    name: 'version-plugin',
    generateBundle(options, bundle) {
      try {
        // 获取 Git 信息
        const gitInfo = getGitInfo()
        const packageInfo = getPackageInfo()
        const buildInfo = getBuildInfo()

        // 生成版本信息
        const versionInfo = {
          ...packageInfo,
          ...gitInfo,
          ...buildInfo
        }

        // 生成 version.txt (仅包含 commit hash)
        this.emitFile({
          type: 'asset',
          fileName: 'version.txt',
          source: gitInfo.commitHash
        })

        // 生成详细的 version.json
        this.emitFile({
          type: 'asset',
          fileName: 'version.json',
          source: JSON.stringify(versionInfo, null, 2)
        })

        console.log('\n📦 版本信息生成完成:')
        console.log(`   Package: ${versionInfo.name}@${versionInfo.version}`)
        console.log(`   Commit: ${versionInfo.commitHash}`)
        console.log(`   Branch: ${versionInfo.branch}`)
        console.log(`   Tag: ${versionInfo.tag || 'none'}`)
        console.log(`   Build Time: ${versionInfo.buildTime}`)

      } catch (error) {
        console.warn('⚠️  生成版本信息时出错:', error.message)
      }
    }
  }
}

function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
    const shortHash = commitHash.substring(0, 7)
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
    
    let tag = null
    try {
      tag = execSync('git describe --tags --exact-match HEAD', { encoding: 'utf8' }).trim()
    } catch {
      // 没有 tag 时忽略错误
    }

    return {
      commitHash,
      shortHash,
      branch,
      tag
    }
  } catch (error) {
    console.warn('⚠️  无法获取 Git 信息，可能不在 Git 仓库中')
    return {
      commitHash: 'unknown',
      shortHash: 'unknown',
      branch: 'unknown',
      tag: null
    }
  }
}

function getPackageInfo() {
  try {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description
    }
  } catch (error) {
    return {
      name: 'unknown',
      version: 'unknown',
      description: 'unknown'
    }
  }
}

function getBuildInfo() {
  const now = new Date()
  return {
    buildTime: now.toISOString(),
    buildTimestamp: now.getTime(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  }
}