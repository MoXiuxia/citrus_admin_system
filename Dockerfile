# 这个Dockerfile用于整体构建，但推荐使用上面的分服务构建
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制根目录配置文件
COPY package*.json ./
COPY .env.example .env

# 安装根目录依赖
RUN npm install

# 复制后端代码
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm install

# 复制前端代码
WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install && npm run build

# 复制构建好的前端文件到后端静态目录
WORKDIR /app
RUN cp -r frontend/dist/* backend/public/

# 设置工作目录回到后端
WORKDIR /app/backend

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "app.js"]