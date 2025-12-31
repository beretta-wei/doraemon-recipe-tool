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

const createPriceMetaItem = (label, entries, { placeholder = "—" } = {}) => {
  const wrapper = document.createElement("div");
  wrapper.className = "recipe-card__meta-item recipe-card__meta-item--collapsible";

  const dt = document.createElement("dt");
  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "recipe-card__toggle";
  toggleButton.setAttribute("aria-expanded", "false");

  const labelText = document.createElement("span");
  labelText.className = "recipe-card__toggle-label";
  labelText.textContent = label;

  const hintText = document.createElement("span");
  hintText.className = "recipe-card__toggle-hint";
  hintText.textContent = "點擊查看";

  const icon = document.createElement("span");
  icon.className = "recipe-card__toggle-icon";
  icon.textContent = "▸";

  toggleButton.append(labelText, hintText, icon);
  dt.appendChild(toggleButton);

  const dd = document.createElement("dd");
  const list = document.createElement("ul");
  list.className = "recipe-card__prices";

  entries.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "recipe-card__price";

    const star = document.createElement("span");
    star.className = "recipe-card__price-star";
    star.textContent = entry.star;

    const value = document.createElement("span");
    value.className = "recipe-card__price-value";
    value.textContent = entry.value || placeholder;

    item.append(star, value);
    list.appendChild(item);
  });

  dd.appendChild(list);
  wrapper.append(dt, dd);

  toggleButton.addEventListener("click", () => {
    const isExpanded = wrapper.classList.toggle("is-expanded");
    toggleButton.setAttribute("aria-expanded", String(isExpanded));
    hintText.textContent = isExpanded ? "點擊收合" : "點擊查看";
  });

  return wrapper;
};

const createRecipeCard = (recipe) => {
  const card = document.createElement("article");
  card.className = "recipe-card";

  const header = document.createElement("div");
  header.className = "recipe-card__header";

  const title = document.createElement("h3");
  title.className = "recipe-card__title";
  title.textContent = normalizeText(pickFieldValue(recipe, FIELD_MAP.name));

  header.appendChild(title);

  const ingredientSection = document.createElement("div");
  ingredientSection.className = "recipe-card__section";

  const ingredientTitle = document.createElement("p");
  ingredientTitle.className = "recipe-card__section-title";
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
  meta.className = "recipe-card__meta";
  meta.append(
    createMetaItem("使用器具", pickFieldValue(recipe, FIELD_MAP.tool)),
    createMetaItem("回復量", pickFieldValue(recipe, FIELD_MAP.recovery), {
      placeholder: "—",
    }),
    createPriceMetaItem("每星售價", buildPriceEntries(recipe))
  );

  card.append(header, ingredientSection, meta);

  return card;
};

export function renderRecipesView(container, recipes) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "recipes-view";

  const list = document.createElement("div");
  list.className = "recipes-view__list";

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
  filter.className = "recipes-view__filter";

  const filterLabel = document.createElement("label");
  filterLabel.className = "recipes-view__filter-label";
  filterLabel.textContent = "依食材篩選料理";
  filterLabel.setAttribute("for", "recipes-filter-ingredient");

  const filterInput = document.createElement("input");
  filterInput.id = "recipes-filter-ingredient";
  filterInput.className = "recipes-view__filter-input";
  filterInput.type = "search";
  filterInput.placeholder = "輸入食材名稱（例如：馬鈴薯）";
  filterInput.autocomplete = "off";

  filter.append(filterLabel, filterInput);

  const renderList = (filteredRecipes) => {
    list.innerHTML = "";

    if (filteredRecipes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "recipes-view__empty";
      empty.textContent = "沒有符合的料理，請嘗試其他食材。";
      list.appendChild(empty);
      return;
    }

    filteredRecipes.forEach((recipe) => {
      list.appendChild(createRecipeCard(recipe));
    });
  };

  const updateFilter = () => {
    const keyword = filterInput.value;
    const filteredRecipes = recipes.filter((recipe) =>
      matchesIngredientFilter(recipe, keyword)
    );
    renderList(filteredRecipes);
  };

  filterInput.addEventListener("input", updateFilter);
  renderList(recipes);

  wrapper.append(filter, list);
  container.appendChild(wrapper);
}
