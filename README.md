# 📰 Новостной портал (Fullstack)

Проект новостного сайта на NestJS + React + PostgreSQL.

## 📂 Структура

.
├── backend/ NestJS backend (API)
├── frontend/ React + Vite + Tailwind
├── docker-compose.yml
└── .env.example Переменные окружения


## 🚀 Быстрый старт (через Docker)

1. Скопируй `.env.example`:

```bash
cp backend/.env.example backend/.env

    Собери и запусти:

docker-compose up --build