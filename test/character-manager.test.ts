/**
 * @file character-manager.test.ts
 * @description YYC³ AI小语智能成长守护系统角色管理器测试，测试角色管理系统的核心功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { CharacterManager } from '../lib/character-manager'

describe('Character Manager Tests', () => {
  const characterManager = CharacterManager.getInstance()

  test('should get character by gender correctly', () => {
    const femaleChar = characterManager.getCharacterByGender('female')
    const maleChar = characterManager.getCharacterByGender('male')
    
    expect(femaleChar.name).toBe('小语')
    expect(maleChar.name).toBe('小言')
  })

  test('should get AI avatar path correctly', () => {
    const femaleAvatar = characterManager.getAIAvatarPath('female')
    const maleAvatar = characterManager.getAIAvatarPath('male')
    
    expect(femaleAvatar).toBe('/role-photos/girl/ai-avatars/girl-xiaoyu-lolita-blue-001.png')
    expect(maleAvatar).toBe('/role-photos/boy/ai-avatars/boy-xiaoyan-casual-001.png')
  })

  test('should get floating avatar path correctly', () => {
    const femaleChar = characterManager.getCharacterByGender('female')
    const maleChar = characterManager.getCharacterByGender('male')
    
    const femaleFloatingAvatar = characterManager.getAIFloatingAvatarPath(femaleChar)
    const maleFloatingAvatar = characterManager.getAIFloatingAvatarPath(maleChar)
    
    expect(femaleFloatingAvatar).toBe('/role-photos/girl/ai-avatars/girl-xiaoyu-lolita-pink-001.png')
    expect(maleFloatingAvatar).toBe('/role-photos/boy/ai-avatars/boy-xiaoyan-cool-001.png')
  })

  test('should get character image path correctly', () => {
    const femaleChar = characterManager.getCharacterByGender('female')
    
    // 默认图片
    const defaultImage = characterManager.getCharacterImagePath(femaleChar)
    expect(defaultImage).toBe('/role-photos/girl/xiaoyu-lolita-blue-008.png')
    
    // 特定主题图片
    const themeImage = characterManager.getCharacterImagePath(femaleChar, undefined, 'pink')
    expect(themeImage).toBe('/role-photos/girl/xiaoyu-lolita-pink-001.png')
    
    // 特定表情图片
    const expressionImage = characterManager.getCharacterImagePath(femaleChar, 'happy')
    expect(expressionImage).toBe('/role-photos/girl/xiaoyu-lolita-blue-010.png')
  })

  test('should get theme colors correctly', () => {
    const femaleChar = characterManager.getCharacterByGender('female')
    const themeColors = characterManager.getCharacterThemeColors(femaleChar, 'blue')
    
    expect(themeColors.primary).toBe('#3b82f6')
    expect(themeColors.secondary).toBe('#93c5fd')
    expect(themeColors.gradient).toBe('linear-gradient(135deg, #3b82f6, #93c5fd)')
  })

  test('should get expressions and catchphrases correctly', () => {
    const femaleChar = characterManager.getCharacterByGender('female')
    
    const happyExpression = characterManager.getCharacterExpression(femaleChar, 'happy')
    expect(happyExpression?.displayName).toBe('开心')
    
    const catchphrase = characterManager.getCatchphrase(femaleChar)
    expect(femaleChar.personality.catchphrases).toContain(catchphrase)
  })
})
