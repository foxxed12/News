# Используем официальный Node.js образ
FROM node:18

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости, включая недостающие
RUN npm install && \
    npm install @nestjs/config @nestjs/mapped-types && \
    npm install --save-dev @types/express

# Копируем исходники проекта
COPY . .

# Собираем проект
RUN npm run build

# Пробрасываем порт
EXPOSE 3001

# Запуск приложения
CMD ["npm", "run", "start:prod"]

