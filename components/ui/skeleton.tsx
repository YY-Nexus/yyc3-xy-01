/**
 * @file skeleton.tsx
 * @description YYC³ AI小语智能成长守护系统UI骨架屏组件，提供内容加载占位功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
