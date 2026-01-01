/**
 * @file UI组件统一导出
 * @description 统一导出所有UI组件和系统
 * @author YYC³ Development Team
 * @version 1.0.0
 * @created 2024-12-14
 */

// 核心角色系统
export { CharacterThemeProvider, useCharacterTheme } from './CharacterThemeContext'
export { CharacterSelector } from './CharacterSelector'

// 主题化组件库
export * from './character-themed'

// 动画容器
export { AnimatedContainer } from './AnimatedContainer'
export { FadeIn, SlideUp, SlideLeft, ScaleIn, BounceIn, AnimatedList, StaggerContainer } from './AnimatedContainer'

// 角色管理器
export { characterManager, CharacterManager } from '@/lib/character-manager'
export { assetManager, AssetManager } from '@/lib/asset-manager'
export { resourceLoader, ResourceLoader } from '@/lib/resource-loader'
export { animationSystem, AnimationSystem } from '@/lib/animation-system'
export { responsiveSystem, ResponsiveSystem } from '@/lib/responsive-system'

// 便捷函数
export {
  getCharacterByGender,
  getCharacterForUser,
  getCharacterThemeColors,
  preloadCharacterImages as preloadCharacterAssets
} from '@/lib/character-manager'

export {
  getThemeAssetPath,
  getExpressionAssetPath,
  preloadCharacterAssets as preloadAssets,
  getCharacterAssets
} from '@/lib/asset-manager'

export {
  loadCharacterResources,
  preloadMultipleCharacters,
  validateResourceIntegrity
} from '@/lib/resource-loader'

export {
  createVariants,
  createResponsiveAnimation,
  queueAnimation
} from '@/lib/animation-system'

export {
  useScreenSize,
  useBreakpoints,
  useResponsiveValue,
  getBreakpointState,
  resolveResponsiveValue,
  generateResponsiveClasses
} from '@/lib/responsive-system'