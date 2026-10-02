# Telegram Chat на GREEN-API

Тестовое задание «Фронтенд разработчик React». Веб-интерфейс для отправки и получения текстовых сообщений в Telegram через [GREEN-API](https://green-api.com/telegram). Внешний вид повторяет [web.max.ru](https://web.max.ru/): слева список чатов, справа переписка.

Стек: React 19, TypeScript, Vite, Tailwind CSS 4. Бэкенд не нужен, приложение обращается к GREEN-API напрямую из браузера.

## Возможности

- Вход по `idInstance` и `apiTokenInstance` с проверкой состояния инстанса (`getStateInstance`)
- Создание чата по номеру телефона получателя
- Отправка текстовых сообщений методом [SendMessage](https://green-api.com/telegram/docs/api/sending/SendMessage/)
- Получение ответов через [HTTP API](https://green-api.com/telegram/docs/api/receiving/technology-http-api/) (`receiveNotification` + `deleteNotification`)
- Статусы отправки и повтор неотправленного сообщения
- Счетчик непрочитанных, автоматическое создание чата при сообщении с незнакомого номера
- Адаптивная верстка: на мобильных экранах список чатов и переписка открываются по очереди

## Запуск

Нужен Node.js 20.19+ или 22.12+.

```bash
npm install
npm run dev
```

Откройте http://localhost:5173.

Другие команды:

```bash
npm run build    # production-сборка в dist/
npm run preview  # просмотр сборки
npm run lint     # oxlint
```

## Настройка инстанса GREEN-API

1. Зарегистрируйтесь в [личном кабинете](https://console.green-api.com/) и создайте инстанс Telegram.
2. Авторизуйте инстанс: в Telegram откройте «Настройки → Устройства → Подключить устройство» и отсканируйте QR-код из кабинета.
3. В настройках инстанса:
   - оставьте поле `webhookUrl` пустым, иначе HTTP API не отдаст уведомления;
   - включите «Получать уведомления о входящих сообщениях» (`incomingWebhook`);
   - желательно включите уведомления об исходящих сообщениях и статусах (`outgoingAPIMessageWebhook`, `outgoingWebhook`). По ним приложение узнает Telegram id получателя и корректно связывает его ответы с чатом, даже если номер телефона скрыт настройками приватности.
4. Скопируйте `apiUrl`, `idInstance` и `apiTokenInstance` из кабинета.

## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance`. Поле `apiUrl` заполнится автоматически (`https://XXXX.api.green-api.com`, где `XXXX` это первые 4 цифры `idInstance`). Если в кабинете указан другой адрес, исправьте его вручную.
2. Введите номер получателя в международном формате (например, `79001234567`) и нажмите «+».
3. Напишите сообщение и нажмите Enter (Shift+Enter переносит строку).
4. Ответ получателя появится в чате в течение нескольких секунд.

## Устройство проекта

```
src/
  api/greenApi.ts              запросы к GREEN-API и разбор уведомлений
  hooks/useCredentials.ts      учетные данные в sessionStorage
  hooks/useChats.ts            состояние чатов (useReducer), сохранение в localStorage
  hooks/useNotificationPolling.ts  цикл receiveNotification -> deleteNotification
  components/                  LoginForm, ChatLayout, Sidebar, ChatList, ChatWindow, MessageList, MessageBubble, MessageInput
  utils/                       форматирование телефона, времени, аватаров
```

Получение сообщений устроено как long polling: `receiveNotification?receiveTimeout=5` ждет уведомление до 5 секунд, после обработки уведомление удаляется из очереди через `deleteNotification`. Уведомления, которые не нужны приложению, тоже удаляются, чтобы очередь не застревала. При сетевых ошибках запросы повторяются с нарастающей паузой (3, 5, 10, 30 секунд). При выходе или закрытии страницы цикл останавливается через `AbortController`.

Входящее сообщение сопоставляется с чатом по Telegram id отправителя, а если он еще не известен, то по `senderPhoneNumber`.

## Безопасность

- `apiTokenInstance` хранится только в `sessionStorage` и удаляется при закрытии вкладки или нажатии «Выйти». В логах он не появляется.
- История переписки хранится в `localStorage` отдельно для каждого `idInstance`.
- Текст сообщений выводится только средствами React, без `dangerouslySetInnerHTML`.
- `apiUrl` принимается только с протоколом https и в домене `green-api.com`, чтобы токен не ушел на посторонний адрес.
- Ограничение самого GREEN-API: токен передается в URL запроса, а запросы идут из браузера напрямую. Для production стоит вынести вызовы API на свой сервер-прокси и не отдавать токен на клиент.

## Ограничения Telegram

- Отправить сообщение по номеру можно, только если Telegram позволяет найти пользователя по номеру (номер зарегистрирован в Telegram, и настройки приватности получателя это разрешают).
- Сообщения, отправленные с телефона, а не из этого интерфейса, в чате не отображаются. Поддерживаются только текстовые сообщения.

## Деплой на Vercel

Vercel определяет Vite автоматически, дополнительная конфигурация не нужна.

Через веб-интерфейс:

1. Загрузите репозиторий на GitHub.
2. На [vercel.com/new](https://vercel.com/new) импортируйте репозиторий.
3. Framework Preset: Vite, Build Command: `npm run build`, Output Directory: `dist`. Нажмите Deploy.

Через CLI:

```bash
npm i -g vercel
vercel        # preview-деплой
vercel --prod # production
```

Переменные окружения не нужны: учетные данные вводятся в интерфейсе.
