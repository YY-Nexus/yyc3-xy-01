# Q版形象资源重组方案

## 📁 当前资源状态

### 现有目录结构

```
public/
├── Q-MM/           # 13个女性形象文件 (命名不统一)
├── Q-GG/           # 3个男性形象文件
├── Q-GGMM/         # 2个混合形象文件
├── q-character/    # 4个标准化文件 (xiaoyu_fen.png, xiaoyu_lan.png等)
└── Q版角色/         # 其他形象文件
```

### 问题分析

1. **命名不统一** - Q版MM-1.png, Q版GG-1.png, xiaoyu_lan.png
2. **目录分散** - 4个不同目录存储类似资源
3. **缺少标准形象** - 男孩形象不完整

## 🎯 重组目标结构

```
public/
├── characters/
│   ├── female/
│   │   ├── xiaoyu/         # 小语 - 女孩默认形象
│   │   │   ├── default.png # 主形象 (蓝/粉版本)
│   │   │   ├── happy.png   # 开心表情
│   │   │   ├── sad.png     # 伤心表情
│   │   │   └── thinking.png# 思考表情
│   │   └── others/         # 其他女性形象
│   └── male/
│       ├── xiaoyan/        # 小言 - 男孩默认形象
│       │   ├── default.png # 主形象
│       │   ├── happy.png   # 开心表情
│       │   ├── sad.png     # 伤心表情
│       │   └── thinking.png# 思考表情
│       └── others/         # 其他男性形象
```

## 📋 执行步骤

1. **创建标准目录结构**
2. **选择并重命名核心形象文件**
3. **整理现有资源到新结构**
4. **更新角色管理器中的路径配置**
