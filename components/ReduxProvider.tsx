/**
 * @file ReduxProvider.tsx
 * @description Redux状态管理Provider组件，为应用提供全局状态管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import React, { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/lib/store'

interface ReduxProviderProps {
  children: ReactNode
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}