/**
 * 角色资源文件重组脚本
 * @description 将分散的Q版形象资源按照新的统一结构进行重组
 * @version 1.0.0
 * @created 2024-12-14
 */

const fs = require('fs')
const path = require('path')

// 目标目录结构
const TARGET_STRUCTURE = {
  'characters/': {
    'xiaoyu/': {
      'themes/': ['pink', 'blue', 'purple'],
      'expressions/': ['happy', 'excited', 'thinking', 'cool', 'loving'],
      'animations/': ['idle', 'walk', 'jump', 'dance']
    },
    'xiaoyan/': {
      'themes/': ['blue', 'green', 'orange'],
      'expressions/': ['happy', 'excited', 'thinking', 'cool', 'brave'],
      'animations/': ['idle', 'walk', 'run', 'protect']
    }
  },
  'shared/': {
    'backgrounds/': [],
    'effects/': [],
    'ui-elements/': []
  }
}

// 资源映射配置
const RESOURCE_MAPPING = {
  // 女孩小语资源映射
  xiaoyu: {
    // 从 /Q-MM/ 映射到 /characters/xiaoyu/
    themes: {
      pink: {
        sources: ['/Q-MM/xiaoyu_fen.png', '/q-character/xiaoyu_fen.png'],
        target: 'themes/pink/xiaoyu_pink.png'
      },
      blue: {
        sources: ['/Q-MM/xiaoyu_lan.png', '/Q-MM/Q版MM-1.png'],
        target: 'themes/blue/xiaoyu_blue.png'
      },
      purple: {
        sources: ['/Q-MM/Q版MM-6.png'],
        target: 'themes/purple/xiaoyu_purple.png'
      }
    },
    expressions: {
      happy: {
        sources: ['/Q-MM/Q版MM-3.png'],
        target: 'expressions/happy/xiaoyu_happy.png'
      },
      excited: {
        sources: ['/Q-MM/Q版MM-5.png'],
        target: 'expressions/excited/xiaoyu_excited.png'
      },
      thinking: {
        sources: ['/Q-MM/Q版MM-2.png'],
        target: 'expressions/thinking/xiaoyu_thinking.png'
      },
      cool: {
        sources: ['/Q-MM/Q版MM-7.png'],
        target: 'expressions/cool/xiaoyu_cool.png'
      },
      loving: {
        sources: ['/Q-MM/Q版MM-8.png'],
        target: 'expressions/loving/xiaoyu_loving.png'
      }
    }
  },
  // 男孩小言资源映射
  xiaoyan: {
    // 从 /Q-GG/ 和 /Q-GGMM/ 映射到 /characters/xiaoyan/
    themes: {
      blue: {
        sources: ['/Q-GG/Q版GG-2.png'],
        target: 'themes/blue/xiaoyan_blue.png'
      },
      green: {
        sources: ['/Q-GG/Q版GG-3.png'],
        target: 'themes/green/xiaoyan_green.png'
      },
      orange: {
        sources: ['/Q-GGMM/Q版GGMM-1.png'],
        target: 'themes/orange/xiaoyan_orange.png'
      }
    },
    expressions: {
      happy: {
        sources: ['/Q-GG/Q版GG-4.png'],
        target: 'expressions/happy/xiaoyan_happy.png'
      },
      excited: {
        sources: ['/Q-GG/Q版GG-5.png'],
        target: 'expressions/excited/xiaoyan_excited.png'
      },
      thinking: {
        sources: ['/Q-GG/Q版GG-6.png'],
        target: 'expressions/thinking/xiaoyan_thinking.png'
      },
      cool: {
        sources: ['/Q-GG/Q版GG-7.png'],
        target: 'expressions/cool/xiaoyan_cool.png'
      },
      brave: {
        sources: ['/Q-GGMM/Q版GGMM-2.png'],
        target: 'expressions/brave/xiaoyan_brave.png'
      }
    }
  }
}

// 资源重组类
class CharacterAssetReorganizer {
  constructor(publicDir = './public') {
    this.publicDir = path.resolve(publicDir)
    this.targetDir = path.join(this.publicDir, 'characters')
    this.backupDir = path.join(this.publicDir, 'assets-backup')
  }

  // 创建目录结构
  createDirectoryStructure() {
    console.log('📁 创建目标目录结构...')

    const createDirRecursive = (basePath, structure) => {
      Object.entries(structure).forEach(([dirName, content]) => {
        const fullPath = path.join(basePath, dirName)

        if (!fs.existsSync(fullPath)) {
          fs.mkdirSync(fullPath, { recursive: true })
          console.log(`  ✓ 创建目录: ${fullPath}`)
        }

        if (Array.isArray(content)) {
          content.forEach(subDir => {
            const subDirPath = path.join(fullPath, subDir)
            if (!fs.existsSync(subDirPath)) {
              fs.mkdirSync(subDirPath, { recursive: true })
              console.log(`  ✓ 创建子目录: ${subDirPath}`)
            }
          })
        } else if (typeof content === 'object') {
          createDirRecursive(fullPath, content)
        }
      })
    }

    createDirRecursive(this.targetDir, TARGET_STRUCTURE)
  }

  // 查找源文件
  findSourceFile(sources) {
    for (const source of sources) {
      const fullPath = path.join(this.publicDir, source)
      if (fs.existsSync(fullPath)) {
        return fullPath
      }
    }
    return null
  }

  // 复制文件
  copyFile(sourcePath, targetPath) {
    const targetDir = path.dirname(targetPath)

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    fs.copyFileSync(sourcePath, targetPath)
    console.log(`  📋 复制: ${path.basename(sourcePath)} -> ${targetPath}`)
  }

  // 重组角色资源
  reorganizeCharacterAssets() {
    console.log('🎭 开始重组角色资源...')

    Object.entries(RESOURCE_MAPPING).forEach(([characterName, characterData]) => {
      console.log(`\n  处理角色: ${characterName}`)

      // 处理主题资源
      if (characterData.themes) {
        Object.entries(characterData.themes).forEach(([themeName, themeData]) => {
          const sourceFile = this.findSourceFile(themeData.sources)

          if (sourceFile) {
            const targetPath = path.join(this.targetDir, characterName, themeData.target)
            this.copyFile(sourceFile, targetPath)
          } else {
            console.log(`  ⚠️  未找到 ${themeName} 主题的源文件`)
          }
        })
      }

      // 处理表情资源
      if (characterData.expressions) {
        Object.entries(characterData.expressions).forEach(([expressionName, expressionData]) => {
          const sourceFile = this.findSourceFile(expressionData.sources)

          if (sourceFile) {
            const targetPath = path.join(this.targetDir, characterName, expressionData.target)
            this.copyFile(sourceFile, targetPath)
          } else {
            console.log(`  ⚠️  未找到 ${expressionName} 表情的源文件`)
          }
        })
      }
    })
  }

  // 创建资源清单文件
  createAssetManifest() {
    console.log('\n📄 创建资源清单文件...')

    const manifest = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      characters: {}
    }

    Object.entries(RESOURCE_MAPPING).forEach(([characterName, characterData]) => {
      manifest.characters[characterName] = {
        themes: [],
        expressions: [],
        defaultTheme: Object.keys(characterData.themes)[0],
        defaultExpression: 'happy'
      }

      if (characterData.themes) {
        Object.keys(characterData.themes).forEach(themeName => {
          manifest.characters[characterName].themes.push({
            name: themeName,
            path: `/characters/${characterName}/themes/${themeName}/${characterName}_${themeName}.png`
          })
        })
      }

      if (characterData.expressions) {
        Object.keys(characterData.expressions).forEach(expressionName => {
          manifest.characters[characterName].expressions.push({
            name: expressionName,
            path: `/characters/${characterName}/expressions/${expressionName}/${characterName}_${expressionName}.png`
          })
        })
      }
    })

    const manifestPath = path.join(this.targetDir, 'manifest.json')
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log(`  ✓ 资源清单已创建: ${manifestPath}`)
  }

  // 创建备份
  createBackup() {
    console.log('\n💾 创建源文件备份...')

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }

    const backupDirs = ['/Q-MM', '/Q-GG', '/Q-GGMM', '/q-character']

    backupDirs.forEach(dir => {
      const sourceDir = path.join(this.publicDir, dir)
      const targetDir = path.join(this.backupDir, dir)

      if (fs.existsSync(sourceDir)) {
        this.copyDirectory(sourceDir, targetDir)
        console.log(`  ✓ 备份完成: ${dir}`)
      }
    })
  }

  // 复制目录
  copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true })
    }

    const files = fs.readdirSync(source)

    files.forEach(file => {
      const sourcePath = path.join(source, file)
      const targetPath = path.join(target, file)

      if (fs.lstatSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath)
      } else {
        fs.copyFileSync(sourcePath, targetPath)
      }
    })
  }

  // 生成迁移报告
  generateMigrationReport() {
    console.log('\n📊 生成迁移报告...')

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCharacters: Object.keys(RESOURCE_MAPPING).length,
        totalThemes: 0,
        totalExpressions: 0
      },
      details: {}
    }

    Object.entries(RESOURCE_MAPPING).forEach(([characterName, characterData]) => {
      const characterInfo = {
        name: characterName,
        themes: characterData.themes ? Object.keys(characterData.themes).length : 0,
        expressions: characterData.expressions ? Object.keys(characterData.expressions).length : 0,
        migratedFiles: []
      }

      report.summary.totalThemes += characterInfo.themes
      report.summary.totalExpressions += characterInfo.expressions

      if (characterData.themes) {
        Object.entries(characterData.themes).forEach(([themeName, themeData]) => {
          characterInfo.migratedFiles.push({
            type: 'theme',
            name: themeName,
            target: `/characters/${characterName}/${themeData.target}`
          })
        })
      }

      if (characterData.expressions) {
        Object.entries(characterData.expressions).forEach(([expressionName, expressionData]) => {
          characterInfo.migratedFiles.push({
            type: 'expression',
            name: expressionName,
            target: `/characters/${characterName}/${expressionData.target}`
          })
        })
      }

      report.details[characterName] = characterInfo
    })

    const reportPath = path.join(this.targetDir, 'migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`  ✓ 迁移报告已生成: ${reportPath}`)

    // 输出摘要
    console.log('\n📋 迁移摘要:')
    console.log(`  - 角色数量: ${report.summary.totalCharacters}`)
    console.log(`  - 主题数量: ${report.summary.totalThemes}`)
    console.log(`  - 表情数量: ${report.summary.totalExpressions}`)
  }

  // 执行完整的重组流程
  async execute() {
    console.log('🚀 开始执行角色资源重组...\n')

    try {
      // 1. 创建备份
      this.createBackup()

      // 2. 创建目录结构
      this.createDirectoryStructure()

      // 3. 重组资源文件
      this.reorganizeCharacterAssets()

      // 4. 创建资源清单
      this.createAssetManifest()

      // 5. 生成迁移报告
      this.generateMigrationReport()

      console.log('\n✅ 角色资源重组完成!')
      console.log(`📁 目标目录: ${this.targetDir}`)
      console.log(`💾 备份目录: ${this.backupDir}`)

    } catch (error) {
      console.error('\n❌ 重组过程中发生错误:', error.message)
      process.exit(1)
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const publicDir = process.argv[2] || './public'
  const reorganizer = new CharacterAssetReorganizer(publicDir)
  reorganizer.execute()
}

module.exports = CharacterAssetReorganizer