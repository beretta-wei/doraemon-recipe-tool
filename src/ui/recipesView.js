import ownedState from "../state/ownedState.js";

const INGREDIENT_FIELDS = [
  ["材料1", "材料 1"],
  ["材料2", "材料 2"],
  ["材料3", "材料 3"],
  ["材料4", "材料 4"],
  ["材料5", "材料 5"],
];
const PRICE_FIELDS = [
  "⭐️0.5",
  "⭐️1.0",
  "⭐️1.5",
  "⭐️2.0",
  "⭐️2.5",
  "⭐️3.0",
  "⭐️3.5",
  "⭐️4.0",
  "⭐️4.5",
  "⭐️5.0",
];
const FIELD_MAP = {
  name: ["料理食譜"],
  tool: ["使用器具"],
  recovery: ["回復量"],
  bonus: ["食譜+"],
};

const pickFieldValue = (recipe, keys) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(recipe, key)) {
      return recipe[key];
    }
  }
  return "";
};

const normalizeText = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const buildOwnedIngredientSet = () =>
  new Set(
    ownedState
      .getAllOwned()
      .map((name) => normalizeText(name).toLowerCase())
      .filter(Boolean)
  );

const buildRequiredIngredients = (recipe) =>
  INGREDIENT_FIELDS.map((keys) => normalizeText(pickFieldValue(recipe, keys)))
    .filter(Boolean);

const buildMissingCount = (recipe, ownedSet) => {
  const requiredIngredients = buildRequiredIngredients(recipe);
  const requiredCount = requiredIngredients.length;
  const ownedCount = requiredIngredients.filter((name) =>
    ownedSet.has(name.toLowerCase())
  ).length;
  return requiredCount - ownedCount;
};

const buildIngredientEntries = (recipe) => {
  const items = [];

  INGREDIENT_FIELDS.forEach((keys) => {
    const rawValue = pickFieldValue(recipe, keys);
    const text = normalizeText(rawValue);
    if (text) {
      items.push({ text, isBonus: false });
    }
  });

  const bonusText = normalizeText(pickFieldValue(recipe, FIELD_MAP.bonus));
  if (bonusText) {
    items.push({ text: bonusText, isBonus: true });
  }

  return items;
};

const matchesIngredientFilter = (recipe, keyword) => {
  const query = normalizeText(keyword);
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  return buildIngredientEntries(recipe).some((entry) =>
    entry.text.toLowerCase().includes(normalizedQuery)
  );
};

const createMetaItem = (label, value, { placeholder = "" } = {}) => {
  const wrapper = document.createElement("div");
  wrapper.className = "recipe-card__meta-item";

  const dt = document.createElement("dt");
  dt.textContent = label;

  const dd = document.createElement("dd");
  const text = normalizeText(value);
  dd.textContent = text || placeholder;

  wrapper.append(dt, dd);
  return wrapper;
};

const buildPriceEntries = (recipe) =>
  PRICE_FIELDS.map((field) => ({
    star: field,
    value: normalizeText(recipe[field]),
  }));

const createPriceMetaItem = (label, onOpen) => {
  const wrapper = document.createElement("div");
  wrapper.className = "recipe-card__meta-item recipe-card__meta-item--drawer";

  const dt = document.createElement("dt");
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className =
    "recipe-card__drawer-toggle btn btn-outline-primary btn-sm w-100";
  toggleButton.setAttribute("aria-haspopup", "dialog");

  const labelText = document.createElement("span");
  labelText.className = "recipe-card__drawer-label";
  labelText.textContent = label;

  const icon = document.createElement("span");
  icon.className = "recipe-card__drawer-icon";
  icon.textContent = "▸";

  toggleButton.append(labelText, icon);
  dt.appendChild(toggleButton);

  const dd = document.createElement("dd");
  dd.className = "recipe-card__drawer-placeholder";
  dd.textContent = "";

  wrapper.append(dt, dd);

  toggleButton.addEventListener("click", onOpen);

  return wrapper;
};

const createRecipeCard = (recipe, { onOpenPriceDrawer }) => {
  const card = document.createElement("article");
  card.className = "recipe-card card shadow-sm h-100";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body d-flex flex-column gap-3";

  const header = document.createElement("div");
  header.className = "recipe-card__header";

  const title = document.createElement("h3");
  title.className = "recipe-card__title h5 mb-0";
  title.textContent = normalizeText(pickFieldValue(recipe, FIELD_MAP.name));

  header.appendChild(title);

  const ingredientSection = document.createElement("div");
  ingredientSection.className = "recipe-card__section";

  const ingredientTitle = document.createElement("p");
  ingredientTitle.className = "recipe-card__section-title text-muted mb-1";
  ingredientTitle.textContent = "食材";

  const ingredientList = document.createElement("ul");
  ingredientList.className = "recipe-card__ingredients";

  const ingredientEntries = buildIngredientEntries(recipe);
  ingredientEntries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "recipe-card__ingredient";
    if (entry.isBonus) {
      item.classList.add("is-bonus");
    }
    item.textContent = entry.text;

    if (entry.isBonus) {
      const badge = document.createElement("span");
      badge.className = "recipe-card__bonus";
      badge.textContent = "食譜+";
      item.appendChild(badge);
    }

    ingredientList.appendChild(item);
  });

  ingredientSection.append(ingredientTitle, ingredientList);

  const meta = document.createElement("dl");
  meta.className = "recipe-card__meta mb-0";
  meta.append(
    createMetaItem("使用器具", pickFieldValue(recipe, FIELD_MAP.tool)),
    createMetaItem("回復量", pickFieldValue(recipe, FIELD_MAP.recovery), {
      placeholder: "—",
    }),
    createPriceMetaItem("每星售價", () => onOpenPriceDrawer(recipe))
  );

  cardBody.append(header, ingredientSection, meta);
  card.appendChild(cardBody);

  return card;
};

export function renderRecipesView(container, recipes) {
  container.innerHTML = "";

  const ownedIngredientSet = buildOwnedIngredientSet();
  const wrapper = document.createElement("div");
  wrapper.className = "recipes-view";

  const list = document.createElement("div");
  list.className = "recipes-view__list row g-3";

  const priceDrawerOverlay = document.createElement("div");
  priceDrawerOverlay.className = "recipes-view__drawer-overlay";
  priceDrawerOverlay.setAttribute("aria-hidden", "true");

  const priceDrawer = document.createElement("aside");
  priceDrawer.className = "recipes-view__drawer";
  priceDrawer.setAttribute("role", "dialog");
  priceDrawer.setAttribute("aria-modal", "true");
  priceDrawer.setAttribute("aria-hidden", "true");

  const priceDrawerPanel = document.createElement("div");
  priceDrawerPanel.className = "recipes-view__drawer-panel";

  const priceDrawerHeader = document.createElement("div");
  priceDrawerHeader.className = "recipes-view__drawer-header";

  const priceDrawerTitle = document.createElement("h3");
  priceDrawerTitle.className = "recipes-view__drawer-title";

  const priceDrawerClose = document.createElement("button");
  priceDrawerClose.type = "button";
  priceDrawerClose.className = "recipes-view__drawer-close btn btn-outline-secondary btn-sm";
  priceDrawerClose.textContent = "關閉";

  priceDrawerHeader.append(priceDrawerTitle, priceDrawerClose);

  const priceDrawerList = document.createElement("ul");
  priceDrawerList.className = "recipes-view__drawer-list";

  priceDrawerPanel.append(priceDrawerHeader, priceDrawerList);
  priceDrawer.appendChild(priceDrawerPanel);

  const closePriceDrawer = () => {
    priceDrawerOverlay.classList.remove("is-visible");
    priceDrawer.classList.remove("is-visible");
    priceDrawerOverlay.setAttribute("aria-hidden", "true");
    priceDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-drawer-open");
  };

  const openPriceDrawer = (recipe) => {
    priceDrawerTitle.textContent = normalizeText(
      pickFieldValue(recipe, FIELD_MAP.name)
    );
    priceDrawerList.innerHTML = "";
    buildPriceEntries(recipe).forEach((entry) => {
      const item = document.createElement("li");
      item.className = "recipes-view__drawer-item";

      const star = document.createElement("span");
      star.className = "recipes-view__drawer-star";
      star.textContent = entry.star;

      const value = document.createElement("span");
      value.className = "recipes-view__drawer-value";
      value.textContent = entry.value || "—";

      item.append(star, value);
      priceDrawerList.appendChild(item);
    });

    priceDrawerOverlay.classList.add("is-visible");
    priceDrawer.classList.add("is-visible");
    priceDrawerOverlay.setAttribute("aria-hidden", "false");
    priceDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-drawer-open");
  };

  priceDrawerOverlay.addEventListener("click", closePriceDrawer);
  priceDrawerClose.addEventListener("click", closePriceDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePriceDrawer();
    }
  });

  if (!Array.isArray(recipes) || recipes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "recipes-view__empty";
    empty.textContent =
      "目前沒有料理資料可顯示，請確認 recipes 資料檔是否已載入。";
    wrapper.appendChild(empty);
    container.appendChild(wrapper);
    return;
  }

  const filter = document.createElement("div");
  filter.className = "recipes-view__filter card shadow-sm";

  const filterBody = document.createElement("div");
  filterBody.className = "card-body";

  const filterLabel = document.createElement("label");
  filterLabel.className = "form-label mb-1";
  filterLabel.textContent = "依食材篩選料理";
  filterLabel.setAttribute("for", "recipes-filter-ingredient");

  const filterInput = document.createElement("input");
  filterInput.id = "recipes-filter-ingredient";
  filterInput.className = "form-control mb-3";
  filterInput.type = "search";
  filterInput.placeholder = "輸入食材名稱（例如：馬鈴薯）";
  filterInput.autocomplete = "off";

  const missingFilterLabel = document.createElement("label");
  missingFilterLabel.className = "form-label mb-1";
  missingFilterLabel.textContent = "依缺少材料篩選";
  missingFilterLabel.setAttribute("for", "recipes-filter-missing");

  const missingFilterSelect = document.createElement("select");
  missingFilterSelect.id = "recipes-filter-missing";
  missingFilterSelect.className = "form-select";

  [
    { label: "全部料理", value: "all" },
    { label: "缺 0 樣材料", value: "0" },
    { label: "缺 1 樣材料", value: "1" },
    { label: "缺 2 樣材料", value: "2" },
  ].forEach((option) => {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    missingFilterSelect.appendChild(item);
  });

  filterBody.append(
    filterLabel,
    filterInput,
    missingFilterLabel,
    missingFilterSelect
  );
  filter.appendChild(filterBody);

  const renderList = (filteredRecipes) => {
    list.innerHTML = "";

    if (filteredRecipes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "recipes-view__empty col-12";
      empty.textContent = "沒有符合的料理，請嘗試其他食材。";
      list.appendChild(empty);
      return;
    }

    filteredRecipes.forEach((recipe) => {
      const column = document.createElement("div");
      column.className = "col-12 col-lg-6";
      column.appendChild(
        createRecipeCard(recipe, { onOpenPriceDrawer: openPriceDrawer })
      );
      list.appendChild(column);
    });
  };

  const updateFilter = () => {
    const keyword = filterInput.value;
    const missingValue = missingFilterSelect.value;
    const filteredRecipes = recipes.filter((recipe) => {
      if (!matchesIngredientFilter(recipe, keyword)) {
        return false;
      }

      if (missingValue === "all") {
        return true;
      }

      const missingCount = buildMissingCount(recipe, ownedIngredientSet);
      return missingCount === Number(missingValue);
    });
    renderList(filteredRecipes);
  };

  filterInput.addEventListener("input", updateFilter);
  missingFilterSelect.addEventListener("change", updateFilter);
  renderList(recipes);

  wrapper.append(filter, list, priceDrawerOverlay, priceDrawer);
  container.appendChild(wrapper);
}
