# Grafana Local LLM Chat Plugin

**Автор:** KaverinIvan  
**Лицензия:** Non-Commercial (PolyForm) — коммерческое использование запрещено.

Плагин для Grafana, который добавляет в интерфейс окно чата для общения с локальной языковой моделью (через API, совместимое с OpenAI, например `llama.cpp`). 

Плагин включает в себя Go-бэкенд, который выступает в роли умного прокси. Это позволяет обходить ограничения браузера (CORS) и безопасно пересылать запросы от React-интерфейса напрямую на ваш сервер с GPU.

## Архитектура
1. **Frontend (React)**: Окно чата, встроенное в Grafana. Отправляет POST-запросы на `/api/plugins/ivan-localllm-app/resources/chat`.
2. **Backend (Go)**: Перехватывает запрос из React, добавляет необходимые заголовки и пересылает его на сервер с LLM.
3. **LLM Server**: Внешний сервер (например, `llama.cpp`), на котором запущена модель.

## Требования
- **Grafana**: v11.0.0 или новее (рекомендуется v13+).
- **Node.js**: v20+ (рекомендуется v22).
- **Go**: v1.22+ (рекомендуется v1.25+).
- **LLM API**: Любой сервер с OpenAI-совместимым API (`/v1/chat/completions`).

---

## Установка и сборка

### 1. Клонирование и установка зависимостей
```bash
git clone https://github.com/KaverinIvan/ivan-localllm-app.git
cd ivan-localllm-app

# Установка зависимостей фронтенда (с флагом legacy-peer-deps для совместимости React)
npm install --legacy-peer-deps

# Установка библиотек для рендеринга Markdown-таблиц
npm install react-markdown remark-gfm
npm install react@19 react-dom@19 @types/react@19 @types/react-dom@19 --legacy-peer-deps

# Подготовка Go-модулей
export GOTOOLCHAIN=auto
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=off
go mod tidy