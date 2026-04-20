// @todo: напишите здесь код парсера
const currencies = Object.fromEntries([
  [String.fromCodePoint(0x20bd), "RUB"],
  [String.fromCodePoint(0x20ac), "EUR"],
  [String.fromCodePoint(0x0024), "USD"],
]);

function getAttributeValue(selector, attribute) {
  return document.querySelector(selector).getAttribute(attribute);
}

function getChildren(selector) {
  return document.querySelector(selector).children;
}

function getText(selector, inner = false) {
  if (inner) {
    return document.querySelector(selector).innerHTML;
  }
  return document.querySelector(selector).textContent;
}

function getDatasetAttr(selector, attr) {
  return document.querySelector(selector).dataset[attr];
}

function parseMeta() {
  const ogContent = (og) =>
    getAttributeValue(`meta[property='og:${og}']`, "content");
  const language = getAttributeValue("html", "lang");
  const title = getText("title").split("—")[0].trim();
  const keywords = getAttributeValue("meta[name='keywords']", "content").split(
    ", ",
  );
  const description = getAttributeValue("meta[name='description']", "content");
  const opengraph = {
    title: ogContent("title").split("—")[0].trim(),
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
  const name = getText(".about h1");
  const isLiked = "active" in document.querySelector("figure button").classList;
  const tags = (() => {
    const tags = {};
    const tagTypes = {
      red: "discount",
      blue: "label",
      green: "category",
    };
    const tagCollection = getChildren("div.tags");
    if (!tagCollection.length) {
      return tags;
    } else {
      for (const element of tagCollection) {
        const key = tagTypes[element.className];
        if (!(key in tags)) {
          tags[key] = [];
        }
        tags[key].push(element.textContent.trim());
      }
      return tags;
    }
  })();

  const prices = getText(".about .price").trim().split("\n");
  const [price, oldPrice] = prices.map((element) => {
    return +element.trim().split("").splice(1).join("");
  });

  const discount = oldPrice - price;
  const discountPercent = `${discount ? ((discount / oldPrice) * 100).toFixed(2) : 0}%`;
  const currency = currencies[prices[0][0]];
  const properties = (() => {
    const properties = {};
    const propertyCollection = getChildren("ul.properties");
    if (!propertyCollection.length) {
      return properties;
    } else {
      for (const element of propertyCollection) {
        const liElement = element.children;
        properties[liElement[0].textContent.trim()] =
          liElement[1].textContent.trim();
      }
      return properties;
    }
  })();

  const description = getText("div.description", true).trim().replace('<h3 class="unused">', "<h3>");
  const images = (() => {
    const images = [];
    images.push({});
    const imageCollection = getChildren("div.preview nav");
    for (const element of imageCollection) {
      const isDefaultImage = !(element.getAttribute("disabled") === null);
      const image = {
        preview: element.children[0].getAttribute("src"),
        full: element.children[0].dataset.src,
        alt: element.children[0].getAttribute("alt"),
      };
      if (isDefaultImage) {
        images[0] = image;
        continue;
      }
      images.push(image);
    }
    return images;
  })();

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
    images,
  };
}

function parseSuggested() {
  const suggested = [];
  const suggestedCollection = getChildren(".suggested .container .items");
  for (const element of suggestedCollection) {
    const item = {
      image: element.children[0].getAttribute("src"),
      name: element.children[1].textContent.trim(),
      description: element.children[3].textContent.trim(),
      price: element.children[2].textContent
        .trim()
        .split("")
        .splice(1)
        .join(""),
      currency: currencies[element.children[2].textContent[0]],
    };
    suggested.push(item);
  }
  return suggested;
}

function parseReviews() {
  const reviews = [];
  const reviewsCollection = getChildren(".reviews .container .items");
  for (const element of reviewsCollection) {
    const rating = (() => {
      let count = 0;
      for (const rate of element.children[0].children) {
        if (rate.className === "filled") {
          count++;
        }
      }
      return count;
    })();
    const title = element.children[1].children[0].textContent.trim();
    const description = element.children[1].children[1].textContent.trim();
    const date = element.children[2].children[2].textContent
      .trim()
      .split("/")
      .join(".");
    const author = {
      avatar: element.children[2].children[0].getAttribute("src"),
      name: element.children[2].children[1].textContent.trim(),
    };
    const item = {
      rating,
      author,
      title,
      description,
      date,
    };

    reviews.push(item);
  }

  return reviews;
}

function parsePage() {
  return {
    meta: parseMeta(),
    product: parseProduct(),
    suggested: parseSuggested(),
    reviews: parseReviews(),
  };
}

window.parsePage = parsePage;
