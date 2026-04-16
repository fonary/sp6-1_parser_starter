// @todo: напишите здесь код парсера
function getAttributeValue(selector, attribute) {
  return document.querySelector(selector).getAttribute(attribute);
}

function getTextContent(selector) {
  return document.querySelector(selector).textContent;
}

function getDatasetAttr(selector, attr) {
  return document.querySelector(selector).dataset[attr];
}

function parseMeta() {
  const ogContent = (og) =>
    getAttributeValue(`meta[property='og:${og}']`, "content");
  const language = getAttributeValue("html", "lang");
  const title = getTextContent("title").split(" — ")[0].trim();
  const keywords = getAttributeValue("meta[name='keywords']", "content").split(
    ", ",
  );
  const description = getAttributeValue("meta[name='description']", "content");
  const opengraph = {
    title: ogContent("title"),
    image: ogContent("image"),
    type: ogContent("type"),
  };

  return {
    title,
    description,
    keywords,
    language,
    opengraph,
  };
}

function parseProduct() {
    const id = getDatasetAttr("section.product", "id");
    const name = getTextContent(".about h1");
    const isLiked = "active" in document.querySelector("figure button").classList;
    const tags = {};
    const price = document.querySelector(".about .price").innerHTML;
    console.log(price);
    const oldPrice = 0;
    const discount = oldPrice - price;
    const discountPercent = "";
    const currency = "";
    const properties = {};
    const description = "";
    const image = []
  return {
    id,
    name,
    isLiked,
    tags,
    price,
    oldPrice,
    discount,
    discountPercent,
    currency,
    properties,
    description,
    image,
  }
};

function parseSuggested() {return []};

function parseReviews() {return []};

function parsePage() {
  return {
    meta: { ...parseMeta() },
    product: { ...parseProduct() },
    suggested: [ ...parseSuggested() ],
    reviews: [ ...parseReviews() ],
  };
}

window.parsePage = parsePage;
