# Wake: дизайн-код Imperial Yachting

Wake это дизайн-код сайта imperialyachting.com: живое видео с наших лодок вместо картинок, крупная типографика, острые углы, линии 1px, без градиентов, теней и стекла. Только проверяемые факты. Подробно: [DESIGN-CODE.md](DESIGN-CODE.md), задача #46.

## Файлы
- `tokens.css`, `tokens.json`: токены (цвета sea, teal, sand, copper, light, шрифты, отступы).
- `DESIGN-CODE.md`: принципы, палитра, типографика, компоненты.
- `design-code.html` и `design-code-*.png`: визуальный гайд.
- `prototype/RULES.md`: правила live-концепта, клипов, кадра и размеров.
- `prototype/content/clips.json`: список клипов (пишет `prototype/scripts/make-clip.sh`), `prototype/content/fleet.json`: флот.
- `prototype/index.html`: live-прототип главной (открывать через http-сервер).
- `pages/`: макеты страниц (`index.html` + PNG), общий `pages.css`, генераторы `gen.py`, `gen2.py`, `gen3.py`, скриншоты `shot.py`, `shot2.py`, `shot3.py`, статьи блога `posts.json`.
- `screens/`: ранние скриншоты live-концепта.
- `reviews/`: скриншоты дизайн-ревью веток редизайна.
- `clips/posters/`: постеры клипов JPG (до 300 КБ).

## Клипы
Имена файлов: `<clip>-<1920|960>.<mp4|webm>` и постер `<clip>.jpg`. 1920 до 5 МБ, 960 до 2 МБ. На сайте база клипов `NEXT_PUBLIC_CLIP_BASE_URL`, по умолчанию `/videos` (папка `public/videos/` в .gitignore, на VPS отдаёт nginx).

12 клипов: hero-vd40-speed (hero), moneta-golden, vd40-aerial, evo43-run (fleet), ilia-harbour, ilia-onboard, misha-onboard (people), harbour-traffic, vd40-skyline, route-skyline, harbour-sunset, route-canal (section).

## Макеты страниц
Desktop 1440, mobile 390 или 360. `fold` первый экран, `full` вся страница.

| Страница | Макет | PNG |
|---|---|---|
| `/services` | [HTML](pages/services/index.html) | [desktop-1440-fold](pages/services/desktop-1440-fold.png) · [desktop-1440-full](pages/services/desktop-1440-full.png) · [mobile-390-fold](pages/services/mobile-390-fold.png) · [mobile-390-full](pages/services/mobile-390-full.png) |
| `/services/charter` | [HTML](pages/services-charter/index.html) | [desktop-1440-fold](pages/services-charter/desktop-1440-fold.png) · [desktop-1440-full](pages/services-charter/desktop-1440-full.png) · [mobile-360-fold](pages/services-charter/mobile-360-fold.png) · [mobile-360-full](pages/services-charter/mobile-360-full.png) |
| `/services/yacht-management` | [HTML](pages/services-management/index.html) | [desktop-1440-fold](pages/services-management/desktop-1440-fold.png) · [desktop-1440-full](pages/services-management/desktop-1440-full.png) · [mobile-360-fold](pages/services-management/mobile-360-fold.png) · [mobile-360-full](pages/services-management/mobile-360-full.png) |
| `/services/cinematography` | [HTML](pages/services-cinematography/index.html) | [desktop-1440-fold](pages/services-cinematography/desktop-1440-fold.png) · [desktop-1440-full](pages/services-cinematography/desktop-1440-full.png) · [mobile-360-fold](pages/services-cinematography/mobile-360-fold.png) · [mobile-360-full](pages/services-cinematography/mobile-360-full.png) |
| `/services/brandwave` | [HTML](pages/services-brandwave/index.html) | [desktop-1440-fold](pages/services-brandwave/desktop-1440-fold.png) · [desktop-1440-full](pages/services-brandwave/desktop-1440-full.png) · [mobile-360-fold](pages/services-brandwave/mobile-360-fold.png) · [mobile-360-full](pages/services-brandwave/mobile-360-full.png) |
| `/services/speedboat-transfer` | [HTML](pages/services-speedboat-transfer/index.html) | [desktop-1440-fold](pages/services-speedboat-transfer/desktop-1440-fold.png) · [desktop-1440-full](pages/services-speedboat-transfer/desktop-1440-full.png) · [mobile-360-fold](pages/services-speedboat-transfer/mobile-360-fold.png) · [mobile-360-full](pages/services-speedboat-transfer/mobile-360-full.png) |
| `/fleet` | [HTML](pages/fleet/index.html) | [desktop-1440-fold](pages/fleet/desktop-1440-fold.png) · [desktop-1440-full](pages/fleet/desktop-1440-full.png) · [mobile-390-fold](pages/fleet/mobile-390-fold.png) · [mobile-390-full](pages/fleet/mobile-390-full.png) |
| `/fleet/van-dutch-40` | [HTML](pages/fleet-vd-40/index.html) | [desktop-1440-fold](pages/fleet-vd-40/desktop-1440-fold.png) · [desktop-1440-full](pages/fleet-vd-40/desktop-1440-full.png) · [mobile-390-fold](pages/fleet-vd-40/mobile-390-fold.png) · [mobile-390-full](pages/fleet-vd-40/mobile-390-full.png) |
| `/destinations` | [HTML](pages/destinations/index.html) | [desktop-1440-fold](pages/destinations/desktop-1440-fold.png) · [desktop-1440-full](pages/destinations/desktop-1440-full.png) · [mobile-390-fold](pages/destinations/mobile-390-fold.png) · [mobile-390-full](pages/destinations/mobile-390-full.png) |
| `/destinations/palm-jumeirah` | [HTML](pages/destinations-palm-jumeirah/index.html) | [desktop-1440-fold](pages/destinations-palm-jumeirah/desktop-1440-fold.png) · [desktop-1440-full](pages/destinations-palm-jumeirah/desktop-1440-full.png) · [mobile-390-fold](pages/destinations-palm-jumeirah/mobile-390-fold.png) · [mobile-390-full](pages/destinations-palm-jumeirah/mobile-390-full.png) |
| `/destinations/dock-and-dine-dubai` | [HTML](pages/destinations-dock-and-dine-dubai/index.html) | [desktop-1440-fold](pages/destinations-dock-and-dine-dubai/desktop-1440-fold.png) · [desktop-1440-full](pages/destinations-dock-and-dine-dubai/desktop-1440-full.png) · [mobile-390-fold](pages/destinations-dock-and-dine-dubai/mobile-390-fold.png) · [mobile-390-full](pages/destinations-dock-and-dine-dubai/mobile-390-full.png) |
| `/about` | [HTML](pages/about/index.html) | [desktop-1440-fold](pages/about/desktop-1440-fold.png) · [desktop-1440-full](pages/about/desktop-1440-full.png) · [mobile-390-fold](pages/about/mobile-390-fold.png) · [mobile-390-full](pages/about/mobile-390-full.png) |
| `/partners` | [HTML](pages/partners/index.html) | [desktop-1440-fold](pages/partners/desktop-1440-fold.png) · [desktop-1440-full](pages/partners/desktop-1440-full.png) · [mobile-390-fold](pages/partners/mobile-390-fold.png) · [mobile-390-full](pages/partners/mobile-390-full.png) |
| `/blog` | [HTML](pages/blog/index.html) | [desktop-1440-fold](pages/blog/desktop-1440-fold.png) · [desktop-1440-full](pages/blog/desktop-1440-full.png) · [mobile-360-fold](pages/blog/mobile-360-fold.png) · [mobile-360-full](pages/blog/mobile-360-full.png) |
| `/blog/<статья>` | [HTML](pages/blog-post/index.html) | [desktop-1440-fold](pages/blog-post/desktop-1440-fold.png) · [desktop-1440-full](pages/blog-post/desktop-1440-full.png) · [mobile-360-fold](pages/blog-post/mobile-360-fold.png) · [mobile-360-full](pages/blog-post/mobile-360-full.png) |
| `/contact` | [HTML](pages/contact/index.html) | [desktop-1440-fold](pages/contact/desktop-1440-fold.png) · [desktop-1440-full](pages/contact/desktop-1440-full.png) · [mobile-360-fold](pages/contact/mobile-360-fold.png) · [mobile-360-full](pages/contact/mobile-360-full.png) |

## Ревью
- `reviews/v1-services-fleet-contact/`: services, fleet, contact (d = desktop, m = mobile).
- `reviews/v2-contact/`: contact v2, 1440 и 360.
- `reviews/v3-about-destinations-blog-partners/`: about, destinations, palm, dock-and-dine, blog, blog-post, partners, 1440 и 360.

## Как перегенерировать
Нужны python3, playwright и Chrome (`/usr/bin/google-chrome`).
```
cd design/pages
python3 gen.py && python3 gen2.py && python3 gen3.py   # HTML
python3 shot.py && python3 shot2.py && python3 shot3.py # PNG
```
`shot.py`: services, fleet, fleet-vd-40. `shot2.py`: destinations, palm, dock-and-dine, about, partners. `shot3.py`: blog, blog-post, contact, services-*. После правки `pages.css` перегенерировать все PNG.
