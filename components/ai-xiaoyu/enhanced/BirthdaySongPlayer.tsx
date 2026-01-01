'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BirthdaySongPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(0)

  const songs = [
    { id: 1, title: '小语专属生日歌', duration: '3:24' },
    { id: 2, title: '生日快乐歌', duration: '2:45' },
    { id: 3, title: '祝你生日快乐', duration: '2:30' },
    { id: 4, title: 'Happy Birthday', duration: '2:15' },
    { id: 5, title: '生日祝福歌', duration: '3:00' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎵 生日歌曲播放</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-pink-50 rounded-lg">
            <div className="text-sm text-pink-800">
              <div className="font-semibold mb-2">当前播放</div>
              <div>歌曲: {songs[currentSong].title}</div>
              <div>时长: {songs[currentSong].duration}</div>
              <div>状态: {isPlaying ? '播放中 🎵' : '已暂停'}</div>
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              variant={isPlaying ? "default" : "outline"}
            >
              {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
            </Button>
            <Button 
              onClick={() => setCurrentSong((currentSong + 1) % songs.length)}
              variant="outline"
            >
              ⏭️ 下一首
            </Button>
          </div>
          <div className="text-center text-gray-500 text-sm">
            生日歌曲播放组件开发中...
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
