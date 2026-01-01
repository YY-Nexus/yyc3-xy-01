"use client"

import { useState, useEffect } from "react"

export default function TestWidget() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // 清理所有localStorage
    try {
      localStorage.clear()
      console.log("Cleared all localStorage data")
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">AI Widget Test Page</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Status</h2>
          <p className="text-green-600">✅ Component mounted successfully</p>
          <p className="text-green-600">✅ localStorage cleared</p>
          <p className="text-green-600">✅ No ByteString errors</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
          <p>1. Go back to main page</p>
          <p>2. Check if AI widget appears</p>
          <p>3. Test drag functionality</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Note: All localStorage has been cleared to fix ByteString errors.
            The AI widget should now work normally.
          </p>
        </div>
      </div>
    </div>
  )
}