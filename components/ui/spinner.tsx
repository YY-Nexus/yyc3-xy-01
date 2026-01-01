/**
 * @file spinner.tsx
 * @description YYC³ AI小语智能成长守护系统UI加载动画组件，提供加载状态指示功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
