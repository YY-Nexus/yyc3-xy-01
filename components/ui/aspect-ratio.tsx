/**
 * @file aspect-ratio.tsx
 * @description YYC³ AI小语智能成长守护系统UI宽高比组件，提供固定宽高比功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
