# Инструкция по загрузке фотографий яхт

## 📍 Куда загружать фотографии

Все фотографии яхт должны быть загружены в GitHub в папку:
```
public/media/yachts/
```

## 📁 Структура папок

Для каждой яхты есть отдельная папка:
- `monte-carlo-6/` - Monte Carlo 6
- `van-dutch-40/` - Van Dutch 40
- `evo-43/` - EVO 43

## 📸 Какие фотографии нужны

### Для Monte Carlo 6
Папка: `public/media/yachts/monte-carlo-6/`

1. `hero.jpg` - Главное фото (лучший ракурс яхты)
2. `exterior-1.jpg` - Внешний вид сбоку
3. `interior-1.jpg` - Главный салон
4. `flybridge.jpg` - Флайбридж
5. `cabin.jpg` - Каюта
6. `dining.jpg` - Обеденная зона

### Для Van Dutch 40
Папка: `public/media/yachts/van-dutch-40/`

1. `hero.jpg` - Главное фото
2. `exterior-1.jpg` - Внешний вид сбоку
3. `interior-1.jpg` - Интерьер каюты
4. `cockpit.jpg` - Кокпит
5. `cabin.jpg` - Каюта
6. `sunpad.jpg` - Зона для загара

### Для EVO 43
Папка: `public/media/yachts/evo-43/`

1. `hero.jpg` - Главное фото
2. `exterior-1.jpg` - Внешний вид сбоку
3. `interior-1.jpg` - Главный салон
4. `flybridge.jpg` - Флайбридж
5. `cabin.jpg` - Каюта
6. `dining.jpg` - Обеденная зона

### Для страницы «Golf on the Yacht» (гольф на яхте)
Папка: `public/media/destinations/golf/`

1. `hero.jpg` - Лучший кадр: гость бьёт с платформы яхты
2. `platform.jpg` - Платформа яхты, подготовленная для гольфа
3. `green.jpg` - Плавающий грин на воде
4. `swing.jpg` - Гость в момент удара на борту
5. `balls.jpg` - Эко-шары крупным планом
6. `sunset.jpg` - Гольф-сессия на закате

Галерея на странице подхватывает файлы автоматически: если какого-то фото
ещё нет, оно просто не показывается — можно загружать по частям.
После загрузки `hero.jpg` нужно также указать его в
`src/data/adventures.ts` (запись `golf-on-the-yacht`, поля `image` и
`coverImage`) — тогда фото появится и на карточке в каталоге.

Видео услуги загружайте на YouTube-канал @imperial_wave и пришлите ссылку —
мы встроим его на страницу (константа `GOLF_VIDEO_ID` в
`src/app/destinations/golf-on-the-yacht/GolfOnTheYachtContent.tsx`).

## 📐 Требования к фотографиям

- **Формат**: JPEG (.jpg)
- **Размер**: минимум 1920x1080 пикселей (Full HD)
- **Пропорции**: 16:10 или 16:9
- **Максимальный размер файла**: 2 МБ
- **Качество**: Высокое качество, профессиональные фото

## 🚀 Как загрузить фотографии (3 способа)

### Способ 1: Через веб-интерфейс GitHub (самый простой)

1. Откройте https://github.com/aylisrg/imperialyachting.com
2. Перейдите в `public/media/yachts/monte-carlo-6/` (или другую яхту)
3. Нажмите "Add file" → "Upload files"
4. Перетащите фотографии (убедитесь что имена файлов правильные!)
5. Внизу напишите: "Add photos for Monte Carlo 6"
6. Нажмите "Commit changes"

### Способ 2: Через Git в командной строке

```bash
# 1. Клонируйте репозиторий (если ещё не сделали)
git clone https://github.com/aylisrg/imperialyachting.com.git
cd imperialyachting.com

# 2. Скопируйте фотографии в нужную папку
cp ~/Downloads/hero.jpg public/media/yachts/monte-carlo-6/
cp ~/Downloads/exterior-1.jpg public/media/yachts/monte-carlo-6/
# и так далее...

# 3. Добавьте, закоммитьте и отправьте
git add public/media/yachts/
git commit -m "Add photos for Monte Carlo 6"
git push origin main
```

### Способ 3: Через GitHub Desktop

1. Откройте GitHub Desktop
2. Откройте репозиторий imperialyachting.com
3. Скопируйте фотографии в `public/media/yachts/monte-carlo-6/`
4. В GitHub Desktop увидите изменения
5. Напишите сообщение: "Add photos for Monte Carlo 6"
6. Нажмите "Commit to main"
7. Нажмите "Push origin"

## ✅ Проверка

После загрузки фотографий:

1. Подождите 1-2 минуты (GitHub Pages пересоберёт сайт)
2. Откройте: https://aylisrg.github.io/imperialyachting.com/fleet/monte-carlo-6
3. Проверьте что все фотографии отображаются

## ⚠️ Важно!

- **Точные имена файлов** - Имена файлов должны **точно** совпадать (регистр важен!)
- **Все 6 фото** - Для каждой яхты нужны все 6 фотографий
- **Время обновления** - Изменения появятся на сайте через 1-2 минуты
- **Оптимизация** - Сожмите фотографии перед загрузкой (используйте TinyJPG.com)

## 🔍 Примеры правильных имён файлов

✅ **Правильно:**
- `hero.jpg`
- `exterior-1.jpg`
- `cabin.jpg`

❌ **Неправильно:**
- `Hero.jpg` (заглавная буква)
- `hero.jpeg` (должно быть .jpg)
- `hero-1.jpg` (лишние символы)
- `monte-carlo-hero.jpg` (не то имя)

## 🆘 Проблемы?

**Фотографии не показываются на сайте?**
- Проверьте имена файлов (должны точно совпадать)
- Подождите 2-3 минуты для пересборки сайта
- Очистите кеш браузера (Cmd+Shift+R на Mac)
- Убедитесь что фотографии в правильной папке

**Не удаётся загрузить?**
- Проверьте размер файла (максимум 2 МБ)
- Используйте Способ 1 (веб-интерфейс) - он самый простой
- Убедитесь что у вас есть доступ к репозиторию

## 📞 Нужна помощь?

Полная инструкция на английском: `public/media/yachts/README.md`

GitHub репозиторий: https://github.com/aylisrg/imperialyachting.com
