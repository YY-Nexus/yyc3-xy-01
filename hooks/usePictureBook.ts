/**
 * @file usePictureBook.ts
 * @description 绘本管理Hook，提供绘本阅读和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { PictureBook, ReadingProgress, BookCategory } from "@/types/ai-creative"

// 示例绘本数据
const SAMPLE_BOOKS: PictureBook[] = [
  {
    id: "book-1",
    title: "小熊的星星梦",
    author: "AI小语",
    coverUrl: "/placeholder.svg?height=400&width=300",
    category: "story",
    ageRange: [3, 6],
    duration: 8,
    isAIGenerated: true,
    isFavorite: false,
    readCount: 128,
    createdAt: new Date("2024-01-15"),
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "在一片宁静的森林里，住着一只名叫毛毛的小熊。每天晚上，毛毛都会仰望星空，数着闪烁的星星。",
      },
      {
        pageNumber: 2,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: '"我好想摸一摸星星啊！"毛毛对妈妈说。熊妈妈笑着说："星星住在很远很远的地方呢。"',
      },
      {
        pageNumber: 3,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "毛毛决定爬上森林里最高的山，去触摸星星。他带上妈妈做的蜂蜜饼干，出发了。",
      },
      {
        pageNumber: 4,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: '在山脚下，毛毛遇到了一群萤火虫。"你们是从星星上掉下来的吗？"毛毛好奇地问。',
      },
      {
        pageNumber: 5,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "萤火虫们围着毛毛跳起了舞，一闪一闪的，就像地上的星星。毛毛开心极了！",
      },
      {
        pageNumber: 6,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "爬到山顶时，毛毛看到了一个小湖。湖水倒映着满天星星，星星仿佛就在他脚边。",
      },
      {
        pageNumber: 7,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "毛毛伸出小爪子，轻轻触碰湖面。星星的倒影在他指尖荡漾开来，好美啊！",
      },
      {
        pageNumber: 8,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: '回到家，毛毛告诉妈妈："我摸到星星啦！"他带着美好的回忆，进入了甜甜的梦乡。',
      },
    ],
  },
  {
    id: "book-2",
    title: "彩虹桥上的小兔子",
    author: "AI小语",
    coverUrl: "/placeholder.svg?height=400&width=300",
    category: "story",
    ageRange: [3, 6],
    duration: 6,
    isAIGenerated: true,
    isFavorite: true,
    readCount: 256,
    createdAt: new Date("2024-02-01"),
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "雨后的天空出现了一道美丽的彩虹。小兔子蹦蹦跳跳，想看看彩虹的尽头在哪里。",
      },
      {
        pageNumber: 2,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "小兔子穿过花田，跳过小溪，彩虹看起来越来越近了。",
      },
      {
        pageNumber: 3,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: '一只蝴蝶飞过来说："小兔子，你要去哪里呀？""我要找彩虹的尽头！"',
      },
      {
        pageNumber: 4,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "突然，小兔子发现自己站在了彩虹上！彩虹变成了一座桥，七彩的光芒闪耀。",
      },
      {
        pageNumber: 5,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "小兔子在彩虹桥上滑滑梯，每种颜色都是不同的味道——红色是草莓，橙色是橘子！",
      },
      {
        pageNumber: 6,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "当彩虹渐渐消失，小兔子轻轻落回地面。它的毛变成了七彩色，好神奇！",
      },
    ],
  },
  {
    id: "book-3",
    title: "为什么天会下雨",
    author: "AI小语",
    coverUrl: "/placeholder.svg?height=400&width=300",
    category: "science",
    ageRange: [4, 8],
    duration: 5,
    isAIGenerated: true,
    isFavorite: false,
    readCount: 89,
    createdAt: new Date("2024-02-15"),
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "太阳公公照在湖面上，水变成了看不见的水蒸气，慢慢飘向天空。",
      },
      {
        pageNumber: 2,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "水蒸气飘到高高的天上，遇到冷空气，就变成了一朵朵白云。",
      },
      {
        pageNumber: 3,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "云朵里的小水滴越聚越多，云变得又大又重，颜色也变深了。",
      },
      {
        pageNumber: 4,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "当小水滴多到云朵托不住的时候，它们就会落下来，变成雨滴。",
      },
      {
        pageNumber: 5,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "雨水落到地上，流进小溪、河流，最后又回到大海和湖泊里。",
      },
      {
        pageNumber: 6,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "然后太阳又会把水变成水蒸气，这就是大自然神奇的水循环！",
      },
    ],
  },
  {
    id: "book-4",
    title: "小小情绪管理师",
    author: "AI小语",
    coverUrl: "/placeholder.svg?height=400&width=300",
    category: "emotion",
    ageRange: [3, 6],
    duration: 7,
    isAIGenerated: true,
    isFavorite: false,
    readCount: 312,
    createdAt: new Date("2024-03-01"),
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "开心的时候，我的嘴角会翘起来，眼睛弯成月牙，想要跳起来！",
      },
      {
        pageNumber: 2,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "难过的时候，我的眼泪会流下来，心里感觉空空的。这时候我需要一个拥抱。",
      },
      {
        pageNumber: 3,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "生气的时候，我的脸会变红，想要大声喊叫。深呼吸，1、2、3...",
      },
      {
        pageNumber: 4,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "害怕的时候，我想躲起来，心跳得好快。没关系，害怕是正常的。",
      },
      {
        pageNumber: 5,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "每种情绪都是我的朋友。当我有情绪的时候，我可以告诉爸爸妈妈。",
      },
      {
        pageNumber: 6,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "我还可以画画、听音乐、抱抱玩具，让自己慢慢平静下来。",
      },
      {
        pageNumber: 7,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "我是情绪的小主人，我可以和所有的情绪做朋友，做最棒的自己！",
      },
    ],
  },
  {
    id: "book-5",
    title: "十二生肖的故事",
    author: "AI小语",
    coverUrl: "/placeholder.svg?height=400&width=300",
    category: "culture",
    ageRange: [4, 8],
    duration: 10,
    isAIGenerated: true,
    isFavorite: true,
    readCount: 445,
    createdAt: new Date("2024-03-15"),
    pages: [
      {
        pageNumber: 1,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "很久很久以前，玉皇大帝想选十二种动物当生肖，于是举办了一场过河比赛。",
      },
      {
        pageNumber: 2,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "小老鼠很聪明，请求老实的老牛带它过河。善良的老牛答应了。",
      },
      {
        pageNumber: 3,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "快到终点时，小老鼠跳到老牛前面，成了第一名！老牛只能当第二。",
      },
      {
        pageNumber: 4,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "老虎游泳很厉害，它奋力游过大河，得了第三名。",
      },
      {
        pageNumber: 5,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "小兔子蹦蹦跳跳，踩着石头和木头过河，得了第四名。",
      },
      {
        pageNumber: 6,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "龙本来飞得最快，但它停下来帮助大地降雨，所以只得了第五名。",
      },
      {
        pageNumber: 7,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "蛇、马、羊、猴、鸡、狗、猪也都努力完成了比赛，成为了十二生肖。",
      },
      {
        pageNumber: 8,
        imageUrl: "/placeholder.svg?height=600&width=800",
        text: "从此，十二生肖按照比赛顺序，轮流代表每一年。你是什么生肖呢？",
      },
    ],
  },
]

interface UsePictureBookReturn {
  books: PictureBook[]
  currentBook: PictureBook | null
  currentPage: number
  isPlaying: boolean
  isLoading: boolean
  readingProgress: Map<string, ReadingProgress>
  selectBook: (bookId: string) => void
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  play: () => void
  pause: () => void
  toggleFavorite: (bookId: string) => void
  filterByCategory: (category: BookCategory | "all") => void
  searchBooks: (query: string) => void
  getBooksByAge: (age: number) => PictureBook[]
}

export function usePictureBook(): UsePictureBookReturn {
  const [allBooks] = useState<PictureBook[]>(SAMPLE_BOOKS)
  const [filteredBooks, setFilteredBooks] = useState<PictureBook[]>(SAMPLE_BOOKS)
  const [currentBook, setCurrentBook] = useState<PictureBook | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [readingProgress, setReadingProgress] = useState<Map<string, ReadingProgress>>(new Map())

  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis
    }
  }, [])

  const selectBook = useCallback(
    (bookId: string) => {
      const book = allBooks.find((b) => b.id === bookId)
      if (book) {
        setCurrentBook(book)
        const progress = readingProgress.get(bookId)
        setCurrentPage(progress?.currentPage || 1)
        setIsPlaying(false)
        if (synthesisRef.current) {
          synthesisRef.current.cancel()
        }
      }
    },
    [allBooks, readingProgress],
  )

  const updateProgress = useCallback(
    (bookId: string, page: number) => {
      if (!currentBook) return

      setReadingProgress((prev) => {
        const newMap = new Map(prev)
        const existing = newMap.get(bookId)
        newMap.set(bookId, {
          bookId,
          childId: "current-child",
          currentPage: page,
          totalPages: currentBook.pages.length,
          startedAt: existing?.startedAt || new Date(),
          lastReadAt: new Date(),
          isCompleted: page >= currentBook.pages.length,
        })
        return newMap
      })
    },
    [currentBook],
  )

  const speakCurrentPage = useCallback(() => {
    if (!currentBook || !synthesisRef.current) return

    const page = currentBook.pages.find((p) => p.pageNumber === currentPage)
    if (!page) return

    synthesisRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(page.text)
    utterance.lang = "zh-CN"
    utterance.rate = 0.9
    utterance.pitch = 1.1

    const voices = synthesisRef.current.getVoices()
    const chineseVoice =
      voices.find((v) => v.lang.includes("zh") && v.name.includes("Female")) ||
      voices.find((v) => v.lang.includes("zh"))
    if (chineseVoice) {
      utterance.voice = chineseVoice
    }

    utterance.onend = () => {
      if (currentBook && currentPage < currentBook.pages.length) {
        setTimeout(() => {
          setCurrentPage((prev) => {
            const nextPage = prev + 1
            updateProgress(currentBook.id, nextPage)
            return nextPage
          })
        }, 1000)
      } else {
        setIsPlaying(false)
      }
    }

    utteranceRef.current = utterance
    synthesisRef.current.speak(utterance)
  }, [currentBook, currentPage, updateProgress])

  useEffect(() => {
    if (isPlaying && currentBook) {
      speakCurrentPage()
    }
  }, [isPlaying, currentPage, speakCurrentPage, currentBook])

  const goToPage = useCallback(
    (page: number) => {
      if (!currentBook) return
      if (page >= 1 && page <= currentBook.pages.length) {
        setCurrentPage(page)
        updateProgress(currentBook.id, page)
        if (isPlaying && synthesisRef.current) {
          synthesisRef.current.cancel()
        }
      }
    },
    [currentBook, isPlaying, updateProgress],
  )

  const nextPage = useCallback(() => {
    if (!currentBook) return
    if (currentPage < currentBook.pages.length) {
      goToPage(currentPage + 1)
    }
  }, [currentBook, currentPage, goToPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  const play = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    setIsPlaying(false)
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
    }
  }, [])

  const toggleFavorite = useCallback((bookId: string) => {
    setFilteredBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book)),
    )
  }, [])

  const filterByCategory = useCallback(
    (category: BookCategory | "all") => {
      if (category === "all") {
        setFilteredBooks(allBooks)
      } else {
        setFilteredBooks(allBooks.filter((book) => book.category === category))
      }
    },
    [allBooks],
  )

  const searchBooks = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredBooks(allBooks)
        return
      }
      const lowerQuery = query.toLowerCase()
      setFilteredBooks(
        allBooks.filter(
          (book) => book.title.toLowerCase().includes(lowerQuery) || book.author.toLowerCase().includes(lowerQuery),
        ),
      )
    },
    [allBooks],
  )

  const getBooksByAge = useCallback(
    (age: number) => {
      return allBooks.filter((book) => age >= book.ageRange[0] && age <= book.ageRange[1])
    },
    [allBooks],
  )

  return {
    books: filteredBooks,
    currentBook,
    currentPage,
    isPlaying,
    isLoading,
    readingProgress,
    selectBook,
    goToPage,
    nextPage,
    prevPage,
    play,
    pause,
    toggleFavorite,
    filterByCategory,
    searchBooks,
    getBooksByAge,
  }
}
