/**
 * @fileoverview framer-motion模拟模块
 * @description 完全模拟framer-motion库，避免在测试环境中加载实际的动画代码
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @modified 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { ReactNode } from 'react'
import React from 'react'

// 创建一个简单的React组件工厂
const createMotionComponent = (tag: string) => {
  const MotionComponent = React.forwardRef<any, any>(({ children, ...props }, ref) => {
    // 过滤掉所有动画相关属性，只保留DOM属性
    const {
      whileHover,
      whileTap,
      whileFocus,
      whileInView,
      animate,
      initial,
      exit,
      variants,
      transition,
      layout,
      layoutId,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragPropagation,
      dragTransition,
      onDrag,
      onDragStart,
      onDragEnd,
      onDirectionLock,
      onDragTransitionEnd,
      layoutScroll,
      layoutDependency,
      ...rest
    } = props

    // 返回一个简单的React元素，而不是React元素描述对象
    return React.createElement(tag, {
      ...rest,
      ref,
    }, children)
  })

  // 添加显示名称以便调试
  MotionComponent.displayName = `motion.${tag}`

  return MotionComponent
}

// 创建所有motion组件
const motion = {
  div: createMotionComponent('div'),
  button: createMotionComponent('button'),
  span: createMotionComponent('span'),
  i: createMotionComponent('i'),
  a: createMotionComponent('a'),
  img: createMotionComponent('img'),
  form: createMotionComponent('form'),
  input: createMotionComponent('input'),
  label: createMotionComponent('label'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  h4: createMotionComponent('h4'),
  h5: createMotionComponent('h5'),
  h6: createMotionComponent('h6'),
  section: createMotionComponent('section'),
  article: createMotionComponent('article'),
  header: createMotionComponent('header'),
  footer: createMotionComponent('footer'),
  nav: createMotionComponent('nav'),
  main: createMotionComponent('main'),
  aside: createMotionComponent('aside'),
  ul: createMotionComponent('ul'),
  ol: createMotionComponent('ol'),
  li: createMotionComponent('li'),
}

// AnimatePresence组件
const AnimatePresence = ({ children }: { children: ReactNode }) => children

// 动画相关的hooks
const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
})

const useMotionValue = (initial: any) => ({
  value: initial,
  set: () => {},
  get: () => initial,
  reset: () => {},
  velocity: () => 0,
  stop: () => {},
  isAnimating: () => false,
})

const useTransform = (value: any, _transform: any) => ({
  value: value,
  set: () => {},
  get: () => value,
  reset: () => {},
  velocity: () => 0,
  stop: () => {},
  isAnimating: () => false,
})

const useSpring = () => ({})

const useInView = () => false

const useScroll = () => ({
  scrollY: { get: () => 0, set: () => {} },
  scrollX: { get: () => 0, set: () => {} },
})

const useReducedMotion = () => false

const useViewportScroll = () => ({
  scrollY: { get: () => 0 },
  scrollX: { get: () => 0 },
})

const useAnimationControls = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
})

const useDragControls = () => ({
  start: () => {},
  stop: () => {},
})

const usePresence = () => [true, null]

const useIsPresent = () => true

// 其他组件
const LayoutGroup = ({ children }: { children: ReactNode }) => children

const Reorder = { 
  Group: ({ children }: { children: ReactNode }) => children 
}

// 动画函数
const animate = () => Promise.resolve()

const motionValue = (initial: any) => ({
  value: initial,
  set: () => {},
  get: () => initial,
  reset: () => {},
  velocity: () => 0,
  stop: () => {},
  isAnimating: () => false,
})

// 空对象和类型
const PanInfo = {}
const AnimationControls = {}
const MotionValue = {}
const TransformProperties = {}

// 导出所有模拟的内容
export {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  useScroll,
  useReducedMotion,
  useViewportScroll,
  useAnimationControls,
  useDragControls,
  usePresence,
  useIsPresent,
  LayoutGroup,
  Reorder,
  animate,
  motionValue,
  PanInfo,
  AnimationControls,
  MotionValue,
  TransformProperties,
}

// 默认导出，兼容默认导入
export default {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
  useScroll,
  useReducedMotion,
  useViewportScroll,
  useAnimationControls,
  useDragControls,
  usePresence,
  useIsPresent,
  LayoutGroup,
  Reorder,
  animate,
  motionValue,
  PanInfo,
  AnimationControls,
  MotionValue,
  TransformProperties,
}