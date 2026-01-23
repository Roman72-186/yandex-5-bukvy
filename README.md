# 5Букв - Telegram Mini App Wordle Clone

Это приложение-клон Wordle для Telegram, написанное на Next.js, TypeScript и использующее PostgreSQL для хранения словаря.

## Архитектура

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, React Hooks
- **Backend**: Next.js API Routes, TypeScript
- **База данных**: PostgreSQL (через Prisma ORM)
- **Словарь**: Слова на русском языке, фильтруются скриптом `generate_dictionary.py`
- **Состояние**: React Hooks / Context API
- **Валидация**: Zod
- **Telegram WebApp**: `@twa-dev/sdk`

## Установка и запуск

1.  **Клонируйте репозиторий:**
    ```bash
    git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>.git
    cd five-letters-game
    ```

2.  **Установите зависимости:**
    ```bash
    npm install
    ```

3.  **Настройте переменные окружения:**
    - Создайте файл `.env` в корне проекта.
    - Пример содержимого `.env`:
      ```
      DATABASE_URL="postgresql://username:password@localhost:5432/five_letters_db"
      ```
    - Замените `username`, `password` и `five_letters_db` на ваши данные.

4.  **Настройте базу данных:**
    - Убедитесь, что PostgreSQL запущен.
    - Запустите скрипт для генерации словаря (требуется Python 3.x и pip):
      ```bash
      cd scripts
      pip install -r requirements.txt
      python generate_dictionary.py
      ```
      Это создаст файл `prisma/words.json`.
    - Запустите Prisma для миграции и сидирования:
      ```bash
      npx prisma migrate dev --name init
      npx prisma db seed
      ```

5.  **Запустите приложение в режиме разработки:**
    ```bash
    npm run dev
    ```
    Приложение будет доступно по адресу `http://localhost:3000`.

## Структура проекта

```
five-letters-game/
├── app/                    # Страницы Next.js (App Router)
│   └── api/
│       └── guess/
│           └── route.ts    # API маршрут для обработки попыток
├── components/             # Компоненты React
│   ├── ui/                 # Базовые UI компоненты (Grid, Key, Modal)
│   └── Game.tsx            # Главный компонент игры
├── hooks/                  # Кастомные React хуки
│   └── useWordle.ts        # Логика игры на клиенте
├── lib/                    # Вспомогательные функции и константы
│   └── constants.ts        # Конфигурация игры
├── services/               # Бизнес-логика (сервисный слой)
│   └── gameService.ts      # Логика проверки слов, взаимодействие с DB
├── prisma/                 # Конфигурация Prisma и сиды
│   ├── schema.prisma
│   ├── seed.ts
│   └── words.json          # Сгенерированный словарь
├── scripts/                # Вспомогательные скрипты
│   ├── generate_dictionary.py
│   └── requirements.txt
├── public/                 # Статические файлы
├── .env                    # Переменные окружения (не в репо)
├── .env.example            # Пример .env файла
├── .gitignore
├── next.config.js
├── package.json
├── README.md
├── tsconfig.json
└── ...
```

## Развертывание

Для развертывания на Vercel:

1.  Убедитесь, что ваш репозиторий находится на GitHub, GitLab или Bitbucket.
2.  Зайдите на [Vercel](https://vercel.com/).
3.  Создайте новый проект импортируйте ваш репозиторий.
4.  Vercel автоматически обнаружит Next.js и настроит сборку.
5.  Укажите переменные окружения (DATABASE_URL) в настройках проекта на Vercel.
6.  Убедитесь, что Prisma сконфигурирован для работы с удаленной базой данных.
7.  Развертывание запустится автоматически после каждого коммита в основную ветку.

## Интеграция с Telegram

Приложение задумано как Telegram Mini App. Для запуска внутри Telegram:

1.  Создайте бота через [@BotFather](https://t.me/BotFather).
2.  Настройте веб-приложение для вашего бота.
3.  Разместите приложение по HTTPS URL.
4.  Используйте `@twa-dev/sdk` для взаимодействия с Telegram WebApp API (отправка данных о результате игры).

## Лицензия

MIT
