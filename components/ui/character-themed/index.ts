/**
 * @file 主题化UI组件库导出
 * @description 基于角色主题的统一UI组件集合
 * @author YYC³ Development Team
 * @version 1.0.0
 * @created 2024-12-14
 */

// 主题化基础组件 - 只导出已创建的组件
export { CharacterInput } from './CharacterInput'
export { CharacterContainer } from './CharacterContainer'
export { CharacterAlert } from './CharacterAlert'

// 导出类型定义
export type {
  CharacterTheme,
  CharacterSize,
  CharacterVariant,
  CharacterColorScheme
} from './types'

// 导出工具函数
export {
  useCharacterTheme,
  useCharacter,
  useThemeColors,
  useSelectedTheme,
  useSelectedExpression
} from '../CharacterThemeContext'

// 导出主题管理器
export { CharacterThemeProvider } from '../CharacterThemeContext'