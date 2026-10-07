// Генератор статических страниц каталога из scripts/products.json.
// Запуск: node scripts/generate-catalog.js
// Перезаписывает kr1-html-shop/catalog.html и product-<slug>.html для каждого товара.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "kr1-html-shop");
const DATA_FILE = path.join(__dirname, "products.json");

// ВАЖНО: цифры тут зашиты в имена файлов фото на диске (например
// "04_2_bryuki_..._1.jpg"). Менять номер уже существующей категории
// нельзя — собьются пути к уже загруженным фото. Новые категории
// просто дописываются следующими номерами.
const catNum = {
  "verhnyaya-odezhda": 1,
  "bryuki": 2,
  "obuv": 3,
  "aksessuary": 4,
  "hudi-svitshoty": 5,
  "puhoviki": 6,
  "shorty": 7,
  "futbolki": 8,
  "bele-i-noski": 9,
};

const products = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

// Порядок категорий на странице каталога (можно менять свободно —
// это только порядок вывода, а не номера в именах файлов).
const catsOrder = [
  "verhnyaya-odezhda",
  "puhoviki",
  "hudi-svitshoty",
  "futbolki",
  "bryuki",
  "shorty",
  "obuv",
  "aksessuary",
  "bele-i-noski",
];

const NAV = `    <header class="header">
        <div class="header__inner">
            <a class="header__logo" href="index.html">KIYOUSHII</a>
            <nav class="nav">
                <a class="nav__link" href="index.html">Главная</a>
                <a class="nav__link" href="catalog.html">Каталог</a>
                <a class="nav__link" href="about.html">О нас</a>
                <a class="nav__link" href="contacts.html">Контакты</a>
            </nav>
        </div>
    </header>
`;

const FOOTER = `    <footer class="footer">
        <p class="footer__text">&copy;kiyoushii Shop. Все права защищены.</p>
    </footer>
`;

function imgFiles(p) {
  // ожидаемое имя файла: NN_catNum_cat-slug_product-slug_1.jpg (1, 2, 3 — порядковый номер фото)
  const prefix = `${String(p.num).padStart(2, "0")}_${catNum[p.cat]}_${p.cat}_${p.slug}_`;
  return [1, 2, 3].map((i) => `img/${prefix}${i}.jpg`);
}

function productPage(p) {
  const imgs = imgFiles(p);
  const thumbs = [1, 2]
    .map((i) => `                    <img class="product-detail-card__thumb" src="${imgs[i]}" alt="${p.title}, вид ${i + 1}">`)
    .join("\n");

  let extraSection;
  if (p.kind === "accessory") {
    const specsHtml = p.specs.map((s) => `                <li>${s}</li>`).join("\n");
    extraSection = `        <section class="sizes">
            <h2 class="sizes__title">Характеристики</h2>
            <ul class="specs-list">
${specsHtml}
            </ul>
        </section>`;
  } else {
    const ths = p.sizes.map((s) => `                        <th scope="col">${s}</th>`).join("\n");
    const tds = p.avail.map((a) => `                        <td>${a ? "В наличии" : "Нет в наличии"}</td>`).join("\n");
    extraSection = `        <section class="sizes">
            <h2 class="sizes__title">Размеры и наличие</h2>
            <table class="sizes__table">
                <thead>
                    <tr>
${ths}
                    </tr>
                </thead>
                <tbody>
                    <tr>
${tds}
                    </tr>
                </tbody>
            </table>
        </section>`;
  }

  return `<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHOP - ${p.title}</title>
    <link rel="stylesheet" href="css/style.css?v=2">
</head>

<body>
${NAV}
    <main>

        <article class="product-detail-card">
            <div class="product-detail-card__gallery">
                <img class="product-detail-card__img" src="${imgs[0]}" alt="${p.title}">
                <div class="product-detail-card__thumbs">
${thumbs}
                </div>
            </div>
            <div class="product-detail-card__info">
                <h1 class="product-detail-card__title">${p.title}</h1>
                <p class="product-detail-card__description">${p.desc}</p>
                <p class="product-detail-card__price">Цена: ${p.price}₽</p>
                <button class="product-detail-card__btn">В корзину</button>
            </div>
        </article>

${extraSection}
    </main>

${FOOTER}
</body>
</html>
`;
}

function catalogCard(p) {
  const imgs = imgFiles(p);
  const badge = p.badge ? `\n                        <span class="product-card__badge">${p.badge}</span>` : "";
  return `            <article class="product-card">
                <a class="product-card__link" href="product-${p.slug}.html">
                    <div class="product-card__media">
                        <img class="product-card__img" src="${imgs[0]}" alt="${p.title}">${badge}
                    </div>
                    <h3 class="product-card__title">${p.title}</h3>
                </a>
                <p class="product-card__price">${p.price}₽</p>
                <button class="product-card__btn">В корзину</button>
            </article>`;
}

function catalogPage() {
  const groups = catsOrder.map((cat) => {
    const items = products.filter((p) => p.cat === cat);
    if (items.length === 0) return "";
    const catRu = items[0].catRu;
    const cards = items.map(catalogCard).join("\n");
    return `        <section class="catalog-group" id="${cat}">
            <h2 class="catalog-group__title">${catRu}</h2>
            <div class="catalog">
${cards}
            </div>
        </section>`;
  }).filter(Boolean);
  const groupsHtml = groups.join("\n\n");
  return `<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHOP - Каталог</title>
    <link rel="stylesheet" href="css/style.css?v=2">
</head>

<body>
${NAV}
    <main>
        <h1>Каталог товаров</h1>

${groupsHtml}
    </main>

${FOOTER}
</body>
</html>
`;
}

// проверка: у каждого товара должны быть все 3 фото на диске
let missing = 0;
for (const p of products) {
  for (const img of imgFiles(p)) {
    if (!fs.existsSync(path.join(ROOT, img))) {
      console.warn("НЕТ ФОТО:", img, "(товар:", p.title + ")");
      missing++;
    }
  }
}
if (missing > 0) {
  console.warn(`\nВнимание: не найдено ${missing} фото. Страницы всё равно сгенерированы, но картинки будут битые.\n`);
}

for (const p of products) {
  const file = path.join(ROOT, `product-${p.slug}.html`);
  fs.writeFileSync(file, productPage(p), "utf-8");
}

fs.writeFileSync(path.join(ROOT, "catalog.html"), catalogPage(), "utf-8");

console.log(`Готово: ${products.length} товаров, ${catsOrder.length} категорий.`);
