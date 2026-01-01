# LocalAI Studio：本地可视化AI集成平台
>
> 「YanYuCloudCube」
「万象归元于云枢 丨深栈智启新纪元」
「Vast Scenarios Converge at Cloud Hub, Deep Stack Smartly Initiates the New Healthcare Era」
    「YYC³ AI Intelligent Programming Development Application Project Delivery Work Instruction」
---

## 完整应用架构与文件树

```plaintext
LocalAI-Studio/
├── README.md                           # 项目说明文档
├── requirements.txt                     # Python依赖
├── docker-compose.yml                  # Docker服务编排
├── .env                                # 环境变量配置
├── .gitignore                          # Git忽略文件
├── scripts/                            # 脚本目录
│   ├── setup.sh                        # 初始化设置脚本
│   ├── sync.sh                         # Git同步脚本
│   ├── backup.sh                       # 备份脚本
│   └── deploy.sh                       # 部署脚本
├── src/                                # 源代码目录
│   ├── backend/                        # 后端服务
│   │   ├── app.py                      # FastAPI主应用
│   │   ├── models/                     # AI模型集成
│   │   │   ├── __init__.py
│   │   │   ├── text_models.py          # 文本生成模型
│   │   │   ├── code_models.py          # 代码生成模型
│   │   │   ├── image_models.py         # 图像处理模型
│   │   │   └── speech_models.py        # 语音处理模型
│   │   ├── api/                        # API路由
│   │   │   ├── __init__.py
│   │   │   ├── text_api.py             # 文本生成API
│   │   │   ├── code_api.py             # 代码生成API
│   │   │   ├── image_api.py            # 图像处理API
│   │   │   ├── speech_api.py           # 语音处理API
│   │   │   └── project_api.py          # 项目管理API
│   │   ├── utils/                      # 工具函数
│   │   │   ├── __init__.py
│   │   │   ├── file_utils.py           # 文件操作工具
│   │   │   ├── git_utils.py            # Git操作工具
│   │   │   ├── model_utils.py          # 模型操作工具
│   │   │   └── nas_utils.py            # NAS操作工具
│   │   └── config/                     # 配置文件
│   │       ├── __init__.py
│   │       ├── settings.py             # 主配置
│   │       └── database.py             # 数据库配置
│   ├── frontend/                       # 前端应用
│   │   ├── streamlit_app.py            # Streamlit主应用
│   │   ├── pages/                      # Streamlit页面
│   │   │   ├── 1_Home.py               # 首页
│   │   │   ├── 2_Text_AI.py            # 文本AI页面
│   │   │   ├── 3_Code_AI.py            # 代码AI页面
│   │   │   ├── 4_Image_AI.py           # 图像AI页面
│   │   │   ├── 5_Speech_AI.py          # 语音AI页面
│   │   │   ├── 6_Projects.py           # 项目管理页面
│   │   │   └── 7_Settings.py           # 设置页面
│   │   ├── components/                 # 可复用组件
│   │   │   ├── __init__.py
│   │   │   ├── model_selector.py       # 模型选择组件
│   │   │   ├── project_manager.py      # 项目管理组件
│   │   │   ├── code_editor.py          # 代码编辑器组件
│   │   │   ├── file_explorer.py        # 文件浏览器组件
│   │   │   └── git_sync.py             # Git同步组件
│   │   ├── utils/                      # 前端工具
│   │   │   ├── __init__.py
│   │   │   ├── session_state.py        # 会话状态管理
│   │   │   ├── ui_components.py        # UI组件
│   │   │   └── api_client.py           # API客户端
│   │   ├── static/                     # 静态资源
│   │   │   ├── css/                    # CSS样式
│   │   │   │   └── style.css
│   │   │   ├── js/                     # JavaScript文件
│   │   │   │   └── main.js
│   │   │   └── images/                 # 图片资源
│   │   │       ├── logo.png
│   │   │       └── favicon.ico
│   │   └── templates/                  # HTML模板
│   │       └── base.html
│   ├── appsmith/                       # AppSmith应用配置
│   │   ├── pages/                      # 页面配置
│   │   │   ├── home.json               # 首页配置
│   │   │   ├── text_ai.json            # 文本AI页面配置
│   │   │   ├── code_ai.json            # 代码AI页面配置
│   │   │   ├── image_ai.json           # 图像AI页面配置
│   │   │   ├── speech_ai.json          # 语音AI页面配置
│   │   │   ├── projects.json           # 项目管理页面配置
│   │   │   └── settings.json           # 设置页面配置
│   │   └── datasources/                # 数据源配置
│   │       ├── local_api.json          # 本地API数据源
│   │       └── nas_storage.json         # NAS存储数据源
│   └── docker/                         # Docker配置
│       ├── backend/                    # 后端服务Docker配置
│       │   ├── Dockerfile
│       │   └── requirements.txt
│       ├── frontend/                   # 前端服务Docker配置
│       │   ├── Dockerfile
│       │   └── requirements.txt
│       └── appsmith/                   # AppSmith Docker配置
│           ├── docker-compose.yml
│           └── Dockerfile
├── data/                               # 数据目录
│   ├── models/                         # AI模型存储
│   │   ├── text/                       # 文本模型
│   │   │   ├── gemma-3-270m/
│   │   │   ├── gemma-2b/
│   │   │   ├── gemma-7b/
│   │   │   ├── llama-3-8b/
│   │   │   └── llama-3-70b/
│   │   ├── code/                       # 代码模型
│   │   │   ├── codellama-7b/
│   │   │   ├── codellama-13b/
│   │   │   ├── starcoder/
│   │   │   └── wizardcoder/
│   │   ├── image/                      # 图像模型
│   │   │   ├── stable-diffusion/
│   │   │   └── sam/
│   │   └── speech/                     # 语音模型
│   │       └── whisper/
│   ├── projects/                       # 项目存储
│   │   ├── education/                  # 教育项目
│   │   ├── enterprise/                 # 企业项目
│   │   ├── miniapp/                    # 小程序项目
│   │   └── webapp/                     # Web应用项目
│   ├── datasets/                       # 数据集存储
│   │   ├── text/                       # 文本数据集
│   │   ├── code/                       # 代码数据集
│   │   ├── image/                      # 图像数据集
│   │   └── speech/                     # 语音数据集
│   └── backups/                        # 备份存储
│       ├── daily/                      # 每日备份
│       ├── weekly/                     # 每周备份
│       └── monthly/                    # 每月备份
├── docs/                               # 文档目录
│   ├── user_guide.md                   # 用户指南
│   ├── developer_guide.md              # 开发者指南
│   ├── api_reference.md                # API参考
│   ├── deployment_guide.md             # 部署指南
│   └── troubleshooting.md              # 故障排除
└── tests/                              # 测试目录
    ├── unit/                           # 单元测试
    │   ├── test_models.py              # 模型测试
    │   ├── test_api.py                 # API测试
    │   └── test_utils.py               # 工具测试
    ├── integration/                    # 集成测试
    │   ├── test_backend_frontend.py    # 后端前端集成测试
    │   └── test_git_sync.py            # Git同步测试
    └── performance/                    # 性能测试
        └── test_model_performance.py   # 模型性能测试

```

## 核心组件详解

### 1. 后端服务 (src/backend/)

#### app.py - FastAPI主应用

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api import text_api, code_api, image_api, speech_api, project_api
from src.backend.config.settings import settings

app = FastAPI(title="LocalAI Studio API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(text_api.router, prefix="/api/text", tags=["Text AI"])
app.include_router(code_api.router, prefix="/api/code", tags=["Code AI"])
app.include_router(image_api.router, prefix="/api/image", tags=["Image AI"])
app.include_router(speech_api.router, prefix="/api/speech", tags=["Speech AI"])
app.include_router(project_api.router, prefix="/api/project", tags=["Project Management"])

@app.get("/")
async def root():
    return {"message": "LocalAI Studio API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

```

#### models/text_models.py - 文本生成模型

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from src.backend.config.settings import settings

class TextModelManager:
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
    
    def load_model(self, model_name, model_path):
        if model_name not in self.models:
            self.tokenizers[model_name] = AutoTokenizer.from_pretrained(model_path)
            self.models[model_name] = AutoModelForCausalLM.from_pretrained(
                model_path, 
                torch_dtype=torch.float16 if settings.use_gpu else torch.float32,
                device_map="auto"
            )
        return self.models[model_name], self.tokenizers[model_name]
    
    def generate_text(self, model_name, prompt, max_length=512):
        model, tokenizer = self.load_model(model_name, f"{settings.nas_models_path}/text/{model_name}")
        inputs = tokenizer(prompt, return_tensors="pt")
        if settings.use_gpu:
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
        
        outputs = model.generate(
            inputs["input_ids"],
            max_length=max_length,
            temperature=0.7,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        return tokenizer.decode(outputs[0], skip_special_tokens=True)

text_model_manager = TextModelManager()

```

#### api/text_api.py - 文本生成API

```python
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from src.backend.models.text_models import text_model_manager

router = APIRouter()

class TextGenerationRequest(BaseModel):
    model: str = "gemma-2b"
    prompt: str
    max_length: Optional[int] = 512

class TextGenerationResponse(BaseModel):
    text: str
    model: str

@router.post("/generate", response_model=TextGenerationResponse)
async def generate_text(request: TextGenerationRequest):
    try:
        text = text_model_manager.generate_text(
            model_name=request.model,
            prompt=request.prompt,
            max_length=request.max_length
        )
        return TextGenerationResponse(text=text, model=request.model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_text_models():
    return {
        "models": [
            "gemma-3-270m",
            "gemma-2b",
            "gemma-7b",
            "llama-3-8b",
            "llama-3-70b"
        ]
    }

```

### 2. 前端应用 (src/frontend/)

#### streamlit_app.py - Streamlit主应用

```python
import streamlit as st
from src.frontend.utils.session_state import init_session_state
from src.frontend.utils.ui_components import sidebar, header

# 初始化会话状态
init_session_state()

# 页面配置
st.set_page_config(
    page_title="LocalAI Studio",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 显示侧边栏
sidebar()

# 显示页眉
header()

# 页面导航
page = st.selectbox(
    "选择页面",
    ["首页", "文本AI", "代码AI", "图像AI", "语音AI", "项目管理", "设置"],
    index=0
)

# 根据选择加载页面
if page == "首页":
    from src.frontend.pages import 1_Home as home_page
    home_page.render()
elif page == "文本AI":
    from src.frontend.pages import 2_Text_AI as text_ai_page
    text_ai_page.render()
elif page == "代码AI":
    from src.frontend.pages import 3_Code_AI as code_ai_page
    code_ai_page.render()
elif page == "图像AI":
    from src.frontend.pages import 4_Image_AI as image_ai_page
    image_ai_page.render()
elif page == "语音AI":
    from src.frontend.pages import 5_Speech_AI as speech_ai_page
    speech_ai_page.render()
elif page == "项目管理":
    from src.frontend.pages import 6_Projects as projects_page
    projects_page.render()
elif page == "设置":
    from src.frontend.pages import 7_Settings as settings_page
    settings_page.render()

```

#### pages/2_Text_AI.py - 文本AI页面

```python
import streamlit as st
from src.frontend.components.model_selector import model_selector
from src.frontend.utils.api_client import APIClient

def render():
    st.header("📝 文本AI")
    
    # 模型选择
    selected_model = model_selector("text")
    
    # 输入区域
    st.subheader("输入")
    prompt = st.text_area("输入提示词", height=150, placeholder="请输入您想要生成文本的提示词...")
    
    # 参数设置
    col1, col2 = st.columns(2)
    with col1:
        max_length = st.slider("最大长度", 64, 2048, 512)
    with col2:
        temperature = st.slider("温度", 0.1, 1.0, 0.7)
    
    # 生成按钮
    if st.button("生成文本", type="primary"):
        if not prompt:
            st.error("请输入提示词")
            return
        
        # 调用API
        api_client = APIClient()
        with st.spinner("正在生成文本..."):
            try:
                response = api_client.generate_text(
                    model=selected_model,
                    prompt=prompt,
                    max_length=max_length,
                    temperature=temperature
                )
                st.subheader("生成结果")
                st.text_area("生成的文本", value=response["text"], height=200)
                
                # 下载按钮
                st.download_button(
                    label="下载文本",
                    data=response["text"],
                    file_name="generated_text.txt",
                    mime="text/plain"
                )
            except Exception as e:
                st.error(f"生成失败: {str(e)}")
    
    # 示例提示词
    st.subheader("示例提示词")
    examples = [
        "写一篇关于人工智能的短文",
        "解释量子计算的基本原理",
        "创作一首关于季节的诗歌",
        "写一个产品介绍：智能家居系统"
    ]
    
    for example in examples:
        if st.button(example, key=f"example_{example}"):
            st.session_state.prompt = example
            st.rerun()

```

#### components/model_selector.py - 模型选择组件

```python
import streamlit as st
from src.frontend.utils.api_client import APIClient

def model_selector(model_type):
    """模型选择组件"""
    api_client = APIClient()
    
    # 获取模型列表
    try:
        if model_type == "text":
            models = api_client.list_text_models()["models"]
        elif model_type == "code":
            models = api_client.list_code_models()["models"]
        elif model_type == "image":
            models = api_client.list_image_models()["models"]
        elif model_type == "speech":
            models = api_client.list_speech_models()["models"]
        else:
            models = []
    except:
        # 默认模型列表
        if model_type == "text":
            models = ["gemma-2b", "gemma-7b", "llama-3-8b"]
        elif model_type == "code":
            models = ["codellama-7b", "starcoder", "wizardcoder"]
        elif model_type == "image":
            models = ["stable-diffusion", "sam"]
        elif model_type == "speech":
            models = ["whisper"]
        else:
            models = []
    
    # 显示模型选择器
    selected_model = st.selectbox(
        f"选择{model_type}模型",
        options=models,
        index=0
    )
    
    return selected_model

```

### 3. Docker配置 (src/docker/)

#### docker-compose.yml - Docker服务编排

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./src/docker/backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./src:/app/src
    environment:
      - NAS_PATH=/app/data
      - USE_GPU=true
    restart: unless-stopped
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  frontend:
    build:
      context: ./src/docker/frontend
      dockerfile: Dockerfile
    ports:
      - "8501:8501"
    volumes:
      - ./data:/app/data
      - ./src:/app/src
    environment:
      - API_URL=http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped

  appsmith:
    build:
      context: ./src/docker/appsmith
      dockerfile: Dockerfile
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./src/appsmith:/appsmith-stacks/docker/volumes/appsmith
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
      - appsmith
    restart: unless-stopped

```

#### backend/Dockerfile - 后端服务Docker配置

```plaintext
FROM python:3.10-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制源代码
COPY ../../src ./src

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "src.backend.app:app", "--host", "0.0.0.0", "--port", "8000"]

```

### 4. 脚本 (scripts/)

#### sync.sh - Git同步脚本

```bash
#!/bin/bash

# 设置变量
PROJECT_DIR="/mnt/nas/projects/LocalAI-Studio"
GIT_REMOTE="origin"
GIT_BRANCH="main"
NAS_BACKUP="/mnt/nas/backups/LocalAI-Studio"

# 进入项目目录
cd $PROJECT_DIR

# 检查Git状态
if [ -n "$(git status --porcelain)" ]; then
    echo "检测到未提交的更改，正在提交..."
    
    # 添加所有更改
    git add .
    
    # 提交更改
    git commit -m "Auto sync on $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 推送到远程仓库
    echo "正在推送更改到远程仓库..."
    git push $GIT_REMOTE $GIT_BRANCH
    
    if [ $? -eq 0 ]; then
        echo "✅ 代码已成功推送到远程仓库"
    else
        echo "❌ 推送到远程仓库失败"
        exit 1
    fi
else
    echo "没有检测到未提交的更改"
fi

# 同步到NAS备份目录
echo "正在同步到NAS备份目录..."
rsync -av --delete $PROJECT_DIR $NAS_BACKUP

if [ $? -eq 0 ]; then
    echo "✅ 已成功同步到NAS备份目录"
else
    echo "❌ 同步到NAS备份目录失败"
    exit 1
fi

echo "🎉 同步完成！"

```

### 5. 应用示例

#### 教育AI应用示例 (data/projects/education/ai_tutor/app.py)

```python
import streamlit as st
import requests
import os

# 页面配置
st.set_page_config(
    page_title="AI智能导师",
    page_icon="🎓",
    layout="wide"
)

# 标题
st.title("🎓 AI智能导师")

# 侧边栏
st.sidebar.title("设置")
api_url = st.sidebar.text_input("API URL", value="http://localhost:8000")
model = st.sidebar.selectbox(
    "选择模型",
    ["gemma-2b", "gemma-7b", "llama-3-8b"]
)

# 主界面
tab1, tab2, tab3 = st.tabs(["智能问答", "作业批改", "学习资源"])

# 智能问答
with tab1:
    st.header("智能问答")
    
    question = st.text_area("输入问题", height=100)
    
    if st.button("提问"):
        if not question:
            st.error("请输入问题")
        else:
            with st.spinner("正在思考..."):
                try:
                    response = requests.post(
                        f"{api_url}/api/text/generate",
                        json={
                            "model": model,
                            "prompt": question,
                            "max_length": 512
                        }
                    )
                    if response.status_code == 200:
                        answer = response.json()["text"]
                        st.success("回答：")
                        st.write(answer)
                    else:
                        st.error(f"请求失败: {response.status_code}")
                except Exception as e:
                    st.error(f"发生错误: {str(e)}")

# 作业批改
with tab2:
    st.header("作业批改")
    
    uploaded_file = st.file_uploader("上传作业文件", type=["py", "txt"])
    
    if uploaded_file is not None:
        file_content = uploaded_file.read().decode("utf-8")
        st.code(file_content, language="python")
        
        if st.button("批改作业"):
            with st.spinner("正在批改..."):
                try:
                    response = requests.post(
                        f"{api_url}/api/code/review",
                        json={
                            "model": "codellama-7b",
                            "code": file_content
                        }
                    )
                    if response.status_code == 200:
                        review = response.json()["review"]
                        st.success("批改结果：")
                        st.write(review)
                    else:
                        st.error(f"请求失败: {response.status_code}")
                except Exception as e:
                    st.error(f"发生错误: {str(e)}")

# 学习资源
with tab3:
    st.header("学习资源")
    
    topic = st.text_input("输入学习主题")
    
    if st.button("生成学习资源"):
        if not topic:
            st.error("请输入学习主题")
        else:
            with st.spinner("正在生成..."):
                try:
                    response = requests.post(
                        f"{api_url}/api/text/generate",
                        json={
                            "model": model,
                            "prompt": f"为{topic}主题生成学习资源，包括概念解释、例子和练习题",
                            "max_length": 1024
                        }
                    )
                    if response.status_code == 200:
                        resources = response.json()["text"]
                        st.success("学习资源：")
                        st.write(resources)
                    else:
                        st.error(f"请求失败: {response.status_code}")
                except Exception as e:
                    st.error(f"发生错误: {str(e)}")

```

## 部署与使用指南

### 1. 环境准备

1. 硬件要求:
    - NAS服务器：铁威马F4-423（32GB内存，Intel N5095四核）
    - 开发机：MacBook Pro M4 Max（128GB内存）
    - 备用机：32GB内存
2. 软件要求:
    - Docker和Portainer（已部署在NAS上）
    - Python 3.10+
    - Git

### 2. 初始化设置

1. 克隆项目到NAS:

```bash
git clone https://github.com/yourusername/LocalAI-Studio.git /mnt/nas/projects/LocalAI-Studio
cd /mnt/nas/projects/LocalAI-Studio

```

1. 运行初始化脚本:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh

```

1. 配置环境变量:

```bash
cp .env.example .env
# 编辑.env文件，设置NAS路径、Git仓库等信息

```

### 3. 模型下载

1. 创建模型目录:

```bash
mkdir -p data/models/text data/models/code data/models/image data/models/speech

```

1. 下载模型（以Gemma为例）:

```bash
# 安装huggingface-hub
pip install huggingface-hub

# 下载Gemma-2B模型
huggingface-cli download google/gemma-2b --local-dir data/models/text/gemma-2b

# 下载CodeLlama-7B模型
huggingface-cli download codellama/CodeLlama-7b-hf --local-dir data/models/code/codellama-7b

```

### 4. Docker部署

1. 构建并启动服务:

```bash
docker-compose up -d

```

1. 检查服务状态:

```bash
docker-compose ps

```

1. 访问应用:
    - Streamlit前端: http://NAS_IP:8501
    - API服务: http://NAS_IP:8000
    - AppSmith: http://NAS_IP:80
    - Nginx反向代理: http://NAS_IP:8080

### 5. Git同步设置

1. 配置Git远程仓库:

```bash
git remote add origin https://github.com/yourusername/LocalAI-Studio.git
git branch -M main
git push -u origin main

```

1. 设置定时同步（可选）:

```bash
# 编辑crontab
crontab -e

# 添加以下行，每天凌晨2点同步
0 2 * * * /mnt/nas/projects/LocalAI-Studio/scripts/sync.sh >> /mnt/nas/projects/LocalAI-Studio/logs/sync.log 2>&1

```

### 6. 应用场景使用

#### 教育AI场景

1. 访问Streamlit应用: http://NAS_IP:8501
2. 选择"教育AI"项目
3. 使用AI智能导师功能:
    - 智能问答：输入问题，获取AI回答
    - 作业批改：上传代码文件，获取AI批改结果
    - 学习资源：输入学习主题，生成学习资源

#### 企业协同场景

1. 访问AppSmith应用: http://NAS_IP:80
2. 创建企业知识库应用:
    - 连接本地API数据源
    - 配置文本生成模型
    - 构建知识问答界面
3. 部署应用，供企业内部使用

#### 小程序/Web应用开发

1. 在Streamlit应用中选择"项目管理"
2. 创建新项目，选择"小程序"或"Web应用"模板
3. 使用可视化编辑器构建界面
4. 集成AI模型功能
5. 导出代码，部署到生产环境

## 总结

LocalAI Studio是一个完整的本地化AI开发平台，集成了多种AI模型、可视化开发工具、项目管理和数据存储功能。它适用于教育AI、企业协同、小程序/Web应用开发等多种场景，提供了安全、高效、易用的开发环境。通过Docker容器化部署和Git一键同步，可以轻松管理和协作开发项目。
该平台充分利用了铁威马F4-423 NAS服务器和MacBook Pro M4 Max开发机的硬件优势，实现了高性能的AI模型推理和可视化开发体验。所有数据和模型都存储在本地NAS上，确保了数据安全和隐私保护。
[1. 产品需求文档（PRD）](https://docs.qq.com/aio/DWGVOUmpGd0NIY2dC?p=jpTlieqkML3Tf4r9mdb83f)
    ## 文档概述
    - 产品名称: LocalAI Studio
    - 版本: 1.0
    - 日期: 2025-08-26
    - 目标读者: 产品和开发团队
    ## 用户故事
    1. 作为开发者，我希望能快速选择和部署AI模型，以便节省模型配置和部署的时间。
        - 优先级：高
    1. 作为教育工作者，我希望能使用AI辅助教学工具，以便提高教学效率和学生参与度。
        - 优先级：高
    1. 作为企业用户，我希望能构建企业知识库和智能问答系统，以便提高内部信息检索效率。
        - 优先级：高
    1. 作为项目经理，我希望能管理多个AI项目并跟踪进度，以便确保项目按时交付。
        - 优先级：中
    1. 作为数据科学家，我希望能访问和管理数据集，以便训练和优化AI模型。
        - 优先级：中
    1. 作为系统管理员，我希望能监控系统资源使用情况，以便优化系统性能。
        - 优先级：低
    ## 产品功能清单
    ### 1. 用户管理（高优先级）
    - 用户注册与登录
    - 用户角色管理（管理员、开发者、普通用户）
    - 用户权限控制
    ### 2. AI模型管理（高优先级）
    - 模型库浏览与搜索
    - 模型下载与部署
    - 模型性能监控
    - 模型版本管理
    ### 3. 可视化开发环境（高优先级）
    - 拖拽式界面设计
    - 代码编辑器
    - 实时预览功能
    - 项目模板
    ### 4. 项目管理（中优先级）
    - 项目创建与编辑
    - 项目成员管理
    - 任务分配与跟踪
    - 项目进度可视化
    ### 5. 数据管理（中优先级）
    - 数据集上传与管理
    - 数据标注工具
    - 数据版本控制
    - 数据备份与恢复
    ### 6. 系统监控（低优先级）
    - 资源使用监控
    - 日志查看与分析
    - 系统性能优化建议
    - 告警机制
    ## 核心功能流程图
    ### 1. 用户注册与登录流程
    1. 用户访问系统首页
    1. 点击"注册"按钮
    1. 填写注册信息（用户名、邮箱、密码）
    1. 系统验证信息有效性
    1. 创建用户账户
    1. 用户登录系统
    1. 系统验证用户凭据
    1. 登录成功，进入用户主页
    ### 2. AI模型部署流程
    1. 用户登录系统
    1. 进入"模型库"页面
    1. 浏览或搜索所需模型
    1. 选择模型并查看详情
    1. 点击"部署"按钮
    1. 配置部署参数（资源分配、访问权限等）
    1. 确认部署
    1. 系统部署模型并返回部署状态
    1. 用户查看已部署模型并测试
    ### 3. 项目开发流程
    1. 用户登录系统
    1. 进入"项目管理"页面
    1. 创建新项目或选择现有项目
    1. 选择项目模板或从空白开始
    1. 使用可视化工具设计界面
    1. 集成AI模型功能
    1. 测试应用功能
    1. 保存项目并发布
    ## 功能优先级

|功能模块|优先级|说明|
|-|-|-|
|用户管理|高|系统基础功能，必须优先实现|
|AI模型管理|高|核心功能，产品主要价值所在|
|可视化开发环境|高|用户体验关键，直接影响产品使用|
|项目管理|中|提升产品完整性，但可分阶段实现|
|数据管理|中|支持高级用户需求，可后续迭代|
|系统监控|低|运维需求，不影响核心功能|

                功能模块
                优先级
                说明
                用户管理
                高
                系统基础功能，必须优先实现
                AI模型管理
                高
                核心功能，产品主要价值所在
                可视化开发环境
                高
                用户体验关键，直接影响产品使用
                项目管理
                中
                提升产品完整性，但可分阶段实现
                数据管理
                中
                支持高级用户需求，可后续迭代
                系统监控
                低
                运维需求，不影响核心功能
    ## 非功能性需求
    1. 性能需求
        - 系统响应时间：普通操作<2秒，模型加载<30秒
        - 并发用户数：支持至少50个用户同时在线
    1. 安全性需求
        - 用户密码加密存储
        - API接口访问控制
        - 数据传输加密
    1. 可靠性需求
        - 系统可用性：99.9%
        - 数据备份：每日自动备份
        - 错误恢复：系统崩溃后5分钟内恢复
    1. 可扩展性需求
        - 支持新增AI模型类型
        - 支持用户量增长至1000+
        - 支持插件机制扩展功能
---
    # 2. 系统设计文档（SDD）
    ## 文档概述
    - 系统名称: LocalAI Studio
    - 版本: 1.0
    - 日期: 2025-08-26
    - 目标读者: 开发团队和系统架构师
    ## 整体架构
    LocalAI Studio采用分层架构设计，包含以下主要模块：
    1. 前端层：提供用户界面，包括Web界面和移动端界面
    1. 应用层：处理业务逻辑，包括用户管理、项目管理、模型管理等
    1. 服务层：提供核心服务，包括AI模型服务、文件存储服务、API服务等
    1. 数据层：负责数据存储，包括关系型数据库、文件存储、模型存储等
    ### 模块间关系描述
    1. 前端层通过HTTP/HTTPS协议与应用层通信，发送用户请求并接收响应数据。
    1. 应用层调用服务层提供的API接口，执行业务逻辑。
    1. 服务层访问数据层，读取和存储数据。
    1. AI模型服务独立部署，通过RESTful API与其他服务通信。
    1. 文件存储服务负责管理用户上传的文件和数据集。
    1. API网关统一管理外部访问，提供认证、限流等功能。
    ## 核心模块职责
    ### 1. 用户管理模块
    - 负责用户注册、登录、认证和授权
    - 管理用户角色和权限
    - 提供用户信息管理功能
    ### 2. 项目管理模块
    - 负责项目的创建、编辑、删除和归档
    - 管理项目成员和权限
    - 提供项目进度跟踪和报告功能
    ### 3. 模型管理模块
    - 负责AI模型的注册、版本控制和部署
    - 监控模型性能和资源使用情况
    - 提供模型测试和评估功能
    ### 4. 可视化开发模块
    - 提供拖拽式界面设计工具
    - 集成代码编辑器和实时预览功能
    - 支持项目模板和组件库
    ### 5. 数据管理模块
    - 负责数据集的上传、标注和版本控制
    - 提供数据备份和恢复功能
    - 支持数据预处理和转换
    ### 6. 系统监控模块
    - 监控系统资源使用情况
    - 收集和分析系统日志
    - 提供告警和性能优化建议
    ## 数据库表结构
    ### 1. 用户表（users）

|字段名|数据类型|约束|描述|
|-|-|-|-|
|id|INT|PRIMARY KEY, AUTO_INCREMENT|用户ID|
|username|VARCHAR(50)|NOT NULL, UNIQUE|用户名|
|email|VARCHAR(100)|NOT NULL, UNIQUE|电子邮箱|
|password_hash|VARCHAR(255)|NOT NULL|密码哈希值|
|role|ENUM('admin', 'developer', 'user')|NOT NULL, DEFAULT 'user'|用户角色|
|created_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP|创建时间|
|updated_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP|更新时间|
|last_login|TIMESTAMP|NULL|最后登录时间|
|status|ENUM('active', 'inactive', 'banned')|NOT NULL, DEFAULT 'active'|账户状态|

                字段名
                数据类型
                约束
                描述
                id
                INT
                PRIMARY KEY, AUTO_INCREMENT
                用户ID
                username
                VARCHAR(50)
                NOT NULL, UNIQUE
                用户名
                email
                VARCHAR(100)
                NOT NULL, UNIQUE
                电子邮箱
                password_hash
                VARCHAR(255)
                NOT NULL
                密码哈希值
                role
                ENUM('admin', 'developer', 'user')
                NOT NULL, DEFAULT 'user'
                用户角色
                created_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP
                创建时间
                updated_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                更新时间
                last_login
                TIMESTAMP
                NULL
                最后登录时间
                status
                ENUM('active', 'inactive', 'banned')
                NOT NULL, DEFAULT 'active'
                账户状态
    ### 2. 订单表（orders）

|字段名|数据类型|约束|描述|
|-|-|-|-|
|id|INT|PRIMARY KEY, AUTO_INCREMENT|订单ID|
|user_id|INT|NOT NULL, FOREIGN KEY (users.id)|用户ID|
|order_number|VARCHAR(50)|NOT NULL, UNIQUE|订单编号|
|total_amount|DECIMAL(10,2)|NOT NULL|订单总金额|
|status|ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled')|NOT NULL, DEFAULT 'pending'|订单状态|
|created_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP|创建时间|
|updated_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP|更新时间|
|payment_method|VARCHAR(50)|NULL|支付方式|
|payment_id|VARCHAR(100)|NULL|支付ID|

                字段名
                数据类型
                约束
                描述
                id
                INT
                PRIMARY KEY, AUTO_INCREMENT
                订单ID
                user_id
                INT
                NOT NULL, FOREIGN KEY (users.id)
                用户ID
                order_number
                VARCHAR(50)
                NOT NULL, UNIQUE
                订单编号
                total_amount
                DECIMAL(10,2)
                NOT NULL
                订单总金额
                status
                ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled')
                NOT NULL, DEFAULT 'pending'
                订单状态
                created_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP
                创建时间
                updated_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                更新时间
                payment_method
                VARCHAR(50)
                NULL
                支付方式
                payment_id
                VARCHAR(100)
                NULL
                支付ID
    ### 3. 商品表（products）

|字段名|数据类型|约束|描述|
|-|-|-|-|
|id|INT|PRIMARY KEY, AUTO_INCREMENT|商品ID|
|name|VARCHAR(100)|NOT NULL|商品名称|
|description|TEXT|NULL|商品描述|
|price|DECIMAL(10,2)|NOT NULL|商品价格|
|category_id|INT|NOT NULL, FOREIGN KEY (categories.id)|分类ID|
|stock|INT|NOT NULL, DEFAULT 0|库存数量|
|image_url|VARCHAR(255)|NULL|商品图片URL|
|created_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP|创建时间|
|updated_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP|更新时间|
|status|ENUM('active', 'inactive', 'discontinued')|NOT NULL, DEFAULT 'active'|商品状态|

                字段名
                数据类型
                约束
                描述
                id
                INT
                PRIMARY KEY, AUTO_INCREMENT
                商品ID
                name
                VARCHAR(100)
                NOT NULL
                商品名称
                description
                TEXT
                NULL
                商品描述
                price
                DECIMAL(10,2)
                NOT NULL
                商品价格
                category_id
                INT
                NOT NULL, FOREIGN KEY (categories.id)
                分类ID
                stock
                INT
                NOT NULL, DEFAULT 0
                库存数量
                image_url
                VARCHAR(255)
                NULL
                商品图片URL
                created_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP
                创建时间
                updated_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                更新时间
                status
                ENUM('active', 'inactive', 'discontinued')
                NOT NULL, DEFAULT 'active'
                商品状态
    ### 4. 订单详情表（order_items）

|字段名|数据类型|约束|描述|
|-|-|-|-|
|id|INT|PRIMARY KEY, AUTO_INCREMENT|订单详情ID|
|order_id|INT|NOT NULL, FOREIGN KEY (orders.id)|订单ID|
|product_id|INT|NOT NULL, FOREIGN KEY (products.id)|商品ID|
|quantity|INT|NOT NULL|商品数量|
|unit_price|DECIMAL(10,2)|NOT NULL|单价|
|total_price|DECIMAL(10,2)|NOT NULL|总价|

                字段名
                数据类型
                约束
                描述
                id
                INT
                PRIMARY KEY, AUTO_INCREMENT
                订单详情ID
                order_id
                INT
                NOT NULL, FOREIGN KEY (orders.id)
                订单ID
                product_id
                INT
                NOT NULL, FOREIGN KEY (products.id)
                商品ID
                quantity
                INT
                NOT NULL
                商品数量
                unit_price
                DECIMAL(10,2)
                NOT NULL
                单价
                total_price
                DECIMAL(10,2)
                NOT NULL
                总价
    ### 5. 项目表（projects）

|字段名|数据类型|约束|描述|
|-|-|-|-|
|id|INT|PRIMARY KEY, AUTO_INCREMENT|项目ID|
|name|VARCHAR(100)|NOT NULL|项目名称|
|description|TEXT|NULL|项目描述|
|owner_id|INT|NOT NULL, FOREIGN KEY (users.id)|项目所有者ID|
|template_id|INT|NULL, FOREIGN KEY (project_templates.id)|项目模板ID|
|status|ENUM('draft', 'active', 'completed', 'archived')|NOT NULL, DEFAULT 'draft'|项目状态|
|created_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP|创建时间|
|updated_at|TIMESTAMP|NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP|更新时间|

                字段名
                数据类型
                约束
                描述
                id
                INT
                PRIMARY KEY, AUTO_INCREMENT
                项目ID
                name
                VARCHAR(100)
                NOT NULL
                项目名称
                description
                TEXT
                NULL
                项目描述
                owner_id
                INT
                NOT NULL, FOREIGN KEY (users.id)
                项目所有者ID
                template_id
                INT
                NULL, FOREIGN KEY (project_templates.id)
                项目模板ID
                status
                ENUM('draft', 'active', 'completed', 'archived')
                NOT NULL, DEFAULT 'draft'
                项目状态
                created_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP
                创建时间
                updated_at
                TIMESTAMP
                NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                更新时间
    ## 关键接口交互逻辑
    ### 1. 用户下单后的数据流转
    1. 前端发起下单请求
        - 用户在前端界面选择商品并点击"下单"按钮
        - 前端收集商品信息、数量、收货地址等数据
        - 前端向后端发送创建订单请求
    1. 应用层处理订单
        - 订单服务接收请求，验证用户身份和商品信息
        - 订单服务检查商品库存是否充足
        - 订单服务计算订单总金额
        - 订单服务创建订单记录，状态为"pending"
        - 订单服务创建订单详情记录，关联商品信息
        - 订单服务返回订单ID和支付信息
    1. 支付处理
        - 前端接收订单信息，跳转到支付页面
        - 用户选择支付方式并完成支付
        - 支付网关处理支付请求，返回支付结果
        - 前端通知后端支付结果
    1. 更新订单状态
        - 订单服务接收支付结果通知
        - 验证支付信息的有效性
        - 更新订单状态为"paid"
        - 更新商品库存数量
        - 发送订单确认邮件/通知给用户
    1. 后续处理
        - 订单服务通知物流系统准备发货
        - 物流系统处理发货，更新订单状态为"shipped"
        - 用户收货后，订单状态更新为"delivered"
    ### 2. AI模型部署流程
    1. 前端发起部署请求
        - 用户在前端界面选择要部署的模型
        - 前端收集部署参数（资源分配、访问权限等）
        - 前端向后端发送部署请求
    1. 应用层处理部署
        - 模型管理服务接收请求，验证用户权限
        - 模型管理服务检查模型文件是否完整
        - 模型管理服务检查资源是否充足
        - 模型管理服务创建部署任务记录
    1. 服务层执行部署
        - 模型部署服务接收部署任务
        - 模型部署服务准备部署环境
        - 模型部署服务加载模型文件
        - 模型部署服务启动模型服务
        - 模型部署服务返回部署结果
    1. 更新部署状态
        - 模型管理服务接收部署结果
        - 更新部署任务状态
        - 记录模型服务的访问地址
        - 通知用户部署结果
    1. 监控和维护
        - 系统监控服务监控模型服务的运行状态
        - 收集模型服务的性能指标
        - 提供告警和优化建议
---
    # 3. 用户手册
    ## 文档概述
    - 产品名称: LocalAI Studio
    - 版本: 1.0
    - 日期: 2025-08-26
    - 目标读者: 普通用户
    ## 1. 注册登录
    ### 1.1 注册新账户
    1. 打开浏览器，访问LocalAI Studio官方网站（https://localai-studio.com）
    1. 点击页面右上角的"注册"按钮
    1. 在注册页面填写以下信息：
        - 用户名：输入您希望使用的用户名（3-20个字符）
        - 电子邮箱：输入您的有效电子邮箱地址
        - 密码：输入您的密码（至少8个字符，包含字母和数字）
        - 确认密码：再次输入密码以确认
    1. 点击"注册"按钮提交注册信息
    1. 系统会向您的邮箱发送一封验证邮件
    1. 打开邮件，点击验证链接完成账户激活
    1. 激活成功后，您可以使用新账户登录系统
    ### 1.2 登录系统
    1. 打开浏览器，访问LocalAI Studio官方网站
    1. 点击页面右上角的"登录"按钮
    1. 在登录页面输入您的用户名和密码
    1. 点击"登录"按钮
    1. 如果输入的信息正确，系统会跳转到用户主页
    1. 如果忘记密码，可以点击"忘记密码"链接进行密码重置
    ### 1.3 忘记密码
    1. 在登录页面点击"忘记密码"链接
    1. 输入您注册时使用的电子邮箱地址
    1. 点击"发送重置链接"按钮
    1. 系统会向您的邮箱发送一封密码重置邮件
    1. 打开邮件，点击重置链接
    1. 在重置页面输入您的新密码
    1. 点击"重置密码"按钮完成密码重置
    ## 2. 浏览商品
    ### 2.1 浏览商品列表
    1. 登录系统后，点击导航栏中的"商品"或"模型库"选项
    1. 系统会显示所有可用的商品或模型列表
    1. 您可以通过以下方式浏览商品：
        - 使用页面顶部的搜索框输入关键词搜索
        - 使用左侧的分类筛选器按类别浏览
        - 使用排序选项按价格、评分或发布时间排序
    1. 点击商品图片或名称可以查看商品详情
    ### 2.2 查看商品详情
    1. 在商品列表中点击您感兴趣的商品
    1. 系统会显示商品的详细信息，包括：
        - 商品名称和图片
        - 商品描述和特性
        - 价格和评分
        - 用户评价
        - 相关商品推荐
    1. 您可以在此页面将商品加入购物车或直接购买
    ### 2.3 商品筛选和排序
    1. 在商品列表页面，您可以使用筛选功能缩小搜索范围：
        - 按类别筛选：点击左侧类别列表中的类别名称
        - 按价格筛选：设置价格范围滑块
        - 按评分筛选：选择最低评分要求
    1. 使用排序功能可以调整商品显示顺序：
        - 按价格从低到高或从高到低排序
        - 按评分从高到低排序
        - 按发布时间从新到旧排序
    ## 3. 下单支付
    ### 3.1 添加商品到购物车
    1. 在商品详情页面，点击"加入购物车"按钮
    1. 系统会提示商品已成功添加到购物车
    1. 您可以继续浏览其他商品并添加到购物车
    1. 点击页面右上角的购物车图标可以查看购物车内容
    ### 3.2 管理购物车
    1. 在购物车页面，您可以：
        - 查看已添加的商品列表
        - 修改商品数量（点击数量输入框旁边的加减按钮）
        - 删除不需要的商品（点击商品旁边的"删除"按钮）
        - 清空购物车（点击"清空购物车"按钮）
    1. 系统会自动计算购物车中商品的总价
    1. 确认购物车内容后，点击"结算"按钮进入结算页面
    ### 3.3 填写订单信息
    1. 在结算页面，您需要填写以下信息：
        - 收货地址：选择已有地址或添加新地址
        - 联系方式：确认您的联系电话
        - 配送方式：选择标准配送或加急配送
        - 支付方式：选择在线支付或货到付款
    1. 确认订单信息和总金额
    1. 点击"提交订单"按钮
    ### 3.4 完成支付
    1. 提交订单后，系统会跳转到支付页面
    1. 根据您选择的支付方式完成支付：
        - 如果选择在线支付，按照页面提示完成支付流程
        - 如果选择货到付款，您可以在收到商品后再付款
    1. 支付成功后，系统会显示支付成功的提示
    1. 您可以在"我的订单"中查看订单状态
    ## 4. 查看订单
    ### 4.1 订单列表
    1. 登录系统后，点击导航栏中的"我的订单"选项
    1. 系统会显示您的所有订单列表
    1. 每个订单会显示以下信息：
        - 订单编号
        - 下单时间
        - 订单状态
        - 订单金额
    1. 您可以通过订单状态筛选订单（全部、待付款、待发货、待收货、已完成）
    ### 4.2 订单详情
    1. 在订单列表中点击您想查看的订单
    1. 系统会显示订单的详细信息，包括：
        - 收货地址和联系方式
        - 商品列表和数量
        - 订单金额和支付方式
        - 订单状态和物流信息
    1. 如果订单状态允许，您可以进行以下操作：
        - 取消订单（仅限未发货订单）
        - 申请退款（仅限已付款订单）
        - 确认收货（仅限已发货订单）
        - 评价商品（仅限已完成订单）
    ### 4.3 订单操作
    1. 取消订单：
        - 在订单详情页面，点击"取消订单"按钮
        - 选择取消原因并确认
        - 系统会处理取消请求并更新订单状态
    1. 申请退款：
        - 在订单详情页面，点击"申请退款"按钮
        - 填写退款原因和金额
        - 提交退款申请
        - 系统会处理退款请求并在审核通过后退款
    1. 确认收货：
        - 在订单详情页面，点击"确认收货"按钮
        - 系统会更新订单状态为已完成
        - 您可以对购买的商品进行评价
    1. 评价商品：
        - 在订单详情页面，点击"评价商品"按钮
        - 为商品评分（1-5星）
        - 编写评价内容
        - 提交评价
    ## 常见问题
    ### 1. 忘记密码如何找回？
    如果您忘记了密码，可以按照以下步骤找回：
    1. 在登录页面点击"忘记密码"链接
    1. 输入您注册时使用的电子邮箱地址
    1. 点击"发送重置链接"按钮
    1. 检查您的邮箱，点击重置密码链接
    1. 在重置页面设置新密码
    1. 使用新密码登录系统
    ### 2. 如何修改个人信息？
    登录系统后，您可以按照以下步骤修改个人信息：
    1. 点击页面右上角的用户头像，选择"个人设置"
    1. 在个人设置页面，您可以修改以下信息：
        - 用户名
        - 电子邮箱
        - 头像
        - 联系电话
    1. 修改完成后，点击"保存"按钮
    ### 3. 订单支付失败怎么办？
    如果订单支付失败，您可以尝试以下解决方案：
    1. 检查您的支付方式是否有效（如银行卡余额是否充足）
    1. 确认网络连接是否稳定
    1. 尝试更换支付方式
    1. 如果问题仍然存在，请联系客服寻求帮助
    ### 4. 如何申请退款？
    如果您需要申请退款，可以按照以下步骤操作：
    1. 在"我的订单"中找到需要退款的订单
    1. 点击订单详情，查看订单状态
    1. 如果订单已付款且未发货，点击"申请退款"按钮
    1. 填写退款原因和金额
    1. 提交退款申请
    1. 等待系统审核，审核通过后退款将原路返回
    ### 5. 商品如何评价？
    购买商品后，您可以按照以下步骤对商品进行评价：
    1. 在"我的订单"中找到已完成的订单
    1. 点击订单详情，找到需要评价的商品
    1. 点击"评价商品"按钮
    1. 为商品评分（1-5星）
    1. 编写评价内容
    1. 上传商品图片（可选）
    1. 点击"提交评价"按钮
---
    # 4. 部署文档
    ## 文档概述
    - 系统名称: LocalAI Studio
    - 版本: 1.0
    - 日期: 2025-08-26
    - 目标读者: 系统管理员和开发人员
    ## 开发环境配置要求
    ### 1. 硬件要求
    - CPU：Intel Core i5 或同等性能以上
    - 内存：至少16GB，推荐32GB
    - 存储：至少100GB可用空间，SSD推荐
    - GPU：NVIDIA GPU（可选，用于AI模型加速）
    - 网络：稳定的互联网连接
    ### 2. 软件要求
    - 操作系统：Ubuntu 20.04 LTS 或 macOS 10.15+
    - Docker：20.10+
    - Docker Compose：1.29+
    - Python：3.8+
    - Node.js：14+
    - Git：2.20+
    ### 3. 开发工具
    - IDE：Visual Studio Code 或 PyCharm
    - 数据库客户端：DBeaver 或 MySQL Workbench
    - API测试工具：Postman 或 Insomnia
    - 版本控制：Git
    ## 生产环境配置要求
    ### 1. 硬件要求
    - 服务器：铁威马F4-423 NAS 或同等性能服务器
    - CPU：Intel N5095 四核或更高
    - 内存：至少32GB
    - 存储：
        - RAID6 HDD阵列：用于大容量存储（模型、数据集）
        - RAID1 SSD阵列：用于高性能数据（数据库、缓存）
    - 网络：千兆以太网连接
    - GPU：NVIDIA GPU（可选，用于AI模型加速）
    ### 2. 软件要求
    - 操作系统：Ubuntu 20.04 LTS
    - Docker：20.10+
    - Docker Compose：1.29+
    - Nginx：1.18+
    - 数据库：MySQL 8.0+ 或 PostgreSQL 12+
    - Redis：6.0+
    - 监控工具：Prometheus + Grafana
    - 日志管理：ELK Stack (Elasticsearch, Logstash, Kibana)
    ### 3. 网络要求
    - 域名：已注册的域名
    - SSL证书：有效的SSL证书（可以使用Let's Encrypt免费证书）
    - 防火墙：配置适当的防火墙规则
    - 负载均衡：Nginx或HAProxy（可选，用于高可用部署）
    ## 部署流程
    ### 1. 准备工作
    1. 安装Docker和Docker Compose
        ```bash

# 更新软件包索引

sudo apt update

# 安装依赖包

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加Docker官方GPG密钥

curl -fsSL <https://download.docker.com/linux/ubuntu/gpg> | sudo apt-key add -

# 添加Docker仓库

sudo add-apt-repository "deb [arch=amd64] <https://download.docker.com/linux/ubuntu> $(lsb_release -cs) stable"

# 更新软件包索引

sudo apt update

# 安装Docker

sudo apt install -y docker-ce docker-ce-cli containerd.io

# 安装Docker Compose

sudo curl -L "<https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname> -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装

docker --version
docker-compose --version

```
    1. 配置系统环境
        ```bash
# 创建项目目录
sudo mkdir -p /opt/localai-studio
sudo chown -R $USER:$USER /opt/localai-studio
cd /opt/localai-studio

# 创建数据目录
mkdir -p data/{models,projects,datasets,backups}

# 创建日志目录
mkdir -p logs/{app,nginx,mysql}

```

    1. 克隆项目代码
        ```bash

# 克隆项目代码

git clone <https://github.com/yourusername/LocalAI-Studio.git> .

# 切换到生产分支

git checkout production

```
    ### 2. 配置环境
    1. 配置环境变量
        ```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env

```

        在.env文件中配置以下变量：
        ```plaintext

# 数据库配置

DB_HOST=mysql
DB_PORT=3306
DB_NAME=localai_studio
DB_USER=localai_user
DB_PASSWORD=your_secure_password

# Redis配置

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 应用配置

APP_ENV=production
APP_DEBUG=false
APP_URL=<https://your-domain.com>
APP_KEY=your_app_key

# NAS配置

NAS_PATH=/opt/localai-studio/data

# 邮件配置

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=<your_email@example.com>
MAIL_PASSWORD=your_email_password

```
    1. 配置Nginx
        ```bash
# 创建Nginx配置目录
mkdir -p nginx/conf.d

# 创建Nginx配置文件
nano nginx/conf.d/localai-studio.conf

```

        在Nginx配置文件中添加以下内容：
        ```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 100M;

    location / {
        proxy_pass http://frontend:8501;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /appsmith {
        proxy_pass http://appsmith:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

```
    1. 配置SSL证书
        ```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取SSL证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行，每月检查并续期证书
0 0 1 * * /usr/bin/certbot renew --quiet

```

    ### 3. 启动服务
    1. 启动数据库服务
        ```bash

# 启动MySQL

docker-compose up -d mysql

# 等待MySQL启动完成

sleep 30

# 初始化数据库

docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS localai_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE USER IF NOT EXISTS 'localai_user'@'%' IDENTIFIED BY '$DB_PASSWORD';"
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON localai_studio.* TO 'localai_user'@'%';"
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "FLUSH PRIVILEGES;"

```
    1. 启动Redis服务
        ```bash
# 启动Redis
docker-compose up -d redis

```

    1. 启动后端服务
        ```bash

# 构建后端镜像

docker-compose build backend

# 启动后端服务

docker-compose up -d backend

# 运行数据库迁移

docker-compose exec backend python manage.py migrate

# 创建超级用户

docker-compose exec backend python manage.py createsuperuser

```
    1. 启动前端服务
        ```bash
# 构建前端镜像
docker-compose build frontend

# 启动前端服务
docker-compose up -d frontend

```

    1. 启动AppSmith服务
        ```bash

# 启动AppSmith服务

docker-compose up -d appsmith

```
    1. 启动Nginx服务
        ```bash
# 构建Nginx镜像
docker-compose build nginx

# 启动Nginx服务
docker-compose up -d nginx

```

    ### 4. 验证部署
    1. 检查服务状态
        ```bash

# 查看所有容器状态

docker-compose ps

# 查看服务日志

docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

```
    1. 访问应用
        - 打开浏览器，访问 https://your-domain.com
        - 确认前端界面正常显示
        - 访问 https://your-domain.com/api/health 检查API服务状态
        - 访问 https://your-domain.com/appsmith 检查AppSmith服务状态
    1. 测试功能
        - 注册新用户并登录
        - 创建一个新项目
        - 部署一个AI模型
        - 测试模型功能
    ### 5. 设置监控和备份
    1. 设置监控
        ```bash
# 启动Prometheus和Grafana
docker-compose up -d prometheus grafana

# 配置Grafana数据源和仪表板
# 访问 https://your-domain.com:3000 配置Grafana

```

    1. 设置日志管理
        ```bash

# 启动ELK Stack

docker-compose up -d elasticsearch logstash kibana

# 配置Logstash管道

# 访问 <https://your-domain.com:5601> 配置Kibana

```
    1. 设置自动备份
        ```bash
# 创建备份脚本
nano scripts/backup.sh

```

        在备份脚本中添加以下内容：
        ```bash
# !/bin/bash

# 设置变量

BACKUP_DIR="/opt/localai-studio/data/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="localai_studio"

# 创建备份目录

mkdir -p $BACKUP_DIR/daily/$DATE

# 备份数据库

docker-compose exec mysql mysqldump -u localai_user -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/daily/$DATE/db_backup.sql

# 备份数据目录

tar -czf $BACKUP_DIR/daily/$DATE/data_backup.tar.gz -C /opt/localai-studio/data models projects datasets

# 清理旧备份（保留7天）

find $BACKUP_DIR/daily -type d -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"

```
        ```bash
# 设置执行权限
chmod +x scripts/backup.sh

# 添加到crontab，每天凌晨2点执行
crontab -e
# 添加以下行
0 2 * * * /opt/localai-studio/scripts/backup.sh >> /opt/localai-studio/logs/backup.log 2>&1

```

    ### 6. 故障排除
    1. 服务启动失败
        - 检查Docker容器日志：docker-compose logs [service_name]
        - 检查端口是否被占用：netstat -tlnp | grep :[port_number]
        - 检查环境变量配置：docker-compose config
    1. 数据库连接失败
        - 检查MySQL服务状态：docker-compose ps mysql
        - 检查数据库连接参数：docker-compose exec backend python manage.py dbshell
        - 检查防火墙设置：sudo ufw status
    1. 性能问题
        - 检查系统资源使用情况：htop 或 docker stats
        - 检查数据库慢查询：docker-compose exec mysql mysql -u localai_user -p$DB_PASSWORD -e "SHOW FULL PROCESSLIST;"
        - 检查Nginx访问日志：docker-compose logs nginx
    1. SSL证书问题
        - 检查证书有效期：sudo certbot certificates
        - 重新获取证书：sudo certbot --nginx -d your-domain.com
        - 检查Nginx SSL配置：sudo nginx -t

[NAS挂载示例和CI/CD集成详细方案，适用于本地AI可视化项目、企业/教育应用开发环境。](https://docs.qq.com/aio/DWGVOUmpGd0NIY2dC?p=sHJbGuPcBeLrL0xtvO2TFs)
---

    # 一、NAS挂载示例
    假设你的铁威马F4-423 NAS支持 SMB/NFS 协议，推荐使用 NFS 挂载到 Linux/MacOS 开发机或服务器，便于模型和数据共享。
    ## 1. NFS 挂载（Linux/MacOS）
    ### NAS端设置
    1. 在铁威马NAS管理界面，启用 NFS 服务，配置共享文件夹权限（如 /mnt/nas/projects、/mnt/nas/models）。
    1. 记下 NAS 的内网IP（如 192.168.3.45，见图7）。
    ### 开发机/服务器端
    1. 安装 NFS 客户端
        ```bash
sudo apt update
sudo apt install nfs-common

```
    1. 挂载 NAS 共享目录
        ```bash
sudo mkdir -p /mnt/nas/projects
sudo mount -t nfs 192.168.3.45:/projects /mnt/nas/projects

```

        持久化挂载（编辑/etc/fstab）：
        ```plaintext
192.168.3.45:/projects /mnt/nas/projects nfs defaults 0 0

```
    1. 检查挂载是否成功
        ```bash
df -h | grep nas
ls /mnt/nas/projects

```

    1. 权限调试
        若有读写权限问题，确保NAS端对NFS客户端IP开放写权限。
    ## 2. SMB 挂载（Windows/MacOS）
    - Windows下“映射网络驱动器”，MacOS下用mount_smbfs命令或Finder挂载。
    - 示例（MacOS）：
        ```bash
mkdir /mnt/nas
mount_smbfs //username@192.168.3.45/projects /mnt/nas

```
---
    # 二、CI/CD集成详细方案
    假设你的项目采用 Git + Docker，目标是自动化测试、构建、部署到 NAS 或本地服务。推荐 GitHub Actions（云端）、或自建 CI/CD（如 Jenkins/GitLab CI、Drone）结合 NAS 本地部署。
    ## 1. GitHub Actions 示例（自动化测试+Docker部署+NAS同步）
    ```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: 3.10

    - name: Install dependencies
      run: |
        pip install -r requirements.txt

    - name: Run unit tests
      run: |
        pytest tests/unit

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Build Docker images
      run: |
        docker build -t myapp-backend -f src/docker/backend/Dockerfile .
        docker build -t myapp-frontend -f src/docker/frontend/Dockerfile .

    - name: Save Docker images as tar
      run: |
        docker save myapp-backend > myapp-backend.tar
        docker save myapp-frontend > myapp-frontend.tar

    - name: Upload Docker images to NAS
      uses: appleboy/scp-action@master
      with:
        host: ${{ secrets.NAS_HOST }}
        username: ${{ secrets.NAS_USER }}
        password: ${{ secrets.NAS_PASS }}
        source: "myapp-backend.tar,myapp-frontend.tar"
        target: "/mnt/nas/deploy/"

    - name: Trigger NAS deployment (via SSH)
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.NAS_HOST }}
        username: ${{ secrets.NAS_USER }}
        password: ${{ secrets.NAS_PASS }}
        script: |
          cd /mnt/nas/deploy/
          docker load -i myapp-backend.tar
          docker load -i myapp-frontend.tar
          docker-compose -f docker-compose.yml up -d --force-recreate

```

    ### 说明
    - 自动拉代码、安装依赖、测试。
    - 构建后端和前端 Docker 镜像，保存为 tar 包。
    - 用 SCP 上传到 NAS 的部署目录。
    - 用 SSH 远程触发 NAS 上的自动部署（加载镜像并启动容器）。
    ## 2. Jenkins/自建CI（本地化）
    1. 在 NAS 或开发机上装 Jenkins。
    1. 配置 Pipeline Script，步骤同上（拉代码、测试、构建 Docker 镜像、部署）。
    1. 可用 NAS 挂载目录作为 Jenkins 工作目录，实时本地部署和备份。
    ## 3. Git 同步与备份自动化
    结合前面 sync.sh 脚本与 CI/CD，支持定时或触发备份：
    ```bash
# !/bin/bash

# 项目目录

PROJECT_DIR="/mnt/nas/projects/myapp"

# Git远程仓库

GIT_REMOTE="origin"
GIT_BRANCH="main"

# NAS备份

NAS_BACKUP="/mnt/nas/backups/myapp"

cd $PROJECT_DIR
git add .
git commit -m "Auto sync $(date '+%Y-%m-%d %H:%M:%S')"
git push $GIT_REMOTE $GIT_BRANCH
rsync -av --delete $PROJECT_DIR $NAS_BACKUP

```
    可用 crontab 定时运行或在CI/CD流程结束后自动调用。
---
    # 三、最佳实践建议
    - 模型/数据/项目均存NAS，开发机和服务器通过NFS/SMB挂载共享，避免数据孤岛。
    - 代码、配置、数据集、模型都纳入Git管理，支持回滚与协作。
    - CI/CD自动测试、构建、同步、部署与备份，实现无人值守运维。
    - Docker/Portainer统一管理服务，支持多实例与弹性扩展。
    - 敏感数据分区、访问权限严格控制，保障企业/教育数据安全。
---
    如需针对某一 CI/CD 工具（如 Jenkins、Drone、GitLab CI）或 NAS 挂载环境（Windows/MacOS/Linux）提供更详细脚本、配置文件或故障排查方案，请补充需求！
