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
  tool: ["使用器具", "廚具"],
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

const buildRecipeIngredientRequirements = (recipe) => {
  const recipeIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : null;

  if (recipeIngredients && recipeIngredients.length > 0) {
    return recipeIngredients
      .map((item) => {
        const main = normalizeText(item?.main);
        if (!main) {
          return null;
        }
        const alternatives = Array.isArray(item?.alternatives)
          ? item.alternatives.map(normalizeText).filter(Boolean)
          : [];
        return { main, alternatives };
      })
      .filter(Boolean);
  }

  return INGREDIENT_FIELDS.map((keys) => normalizeText(pickFieldValue(recipe, keys)))
    .filter(Boolean)
    .map((main) => ({ main, alternatives: [] }));
};

const buildIngredientStatus = (recipe, ownedSet) => {
  const requirements = buildRecipeIngredientRequirements(recipe);
  const usedAlternatives = [];
  let missingCount = 0;

  requirements.forEach((requirement) => {
    const mainKey = requirement.main.toLowerCase();
    if (ownedSet.has(mainKey)) {
      return;
    }

    const usedAlternative = requirement.alternatives.find((alternative) =>
      ownedSet.has(alternative.toLowerCase())
    );

    if (usedAlternative) {
      usedAlternatives.push({ main: requirement.main, used: usedAlternative });
      return;
    }

    missingCount += 1;
  });

  return { missingCount, usedAlternatives };
};

const buildMissingCount = (recipe, ownedSet) =>
  buildIngredientStatus(recipe, ownedSet).missingCount;

const buildRecipeStatusLabel = ({ missingCount, usedAlternatives }) => {
  if (missingCount > 0) {
    return `不可做（缺 ${missingCount} 樣）`;
  }
  if (usedAlternatives.length > 0) {
    return "可做（替代）";
  }
  return "可做";
};

const buildIngredientEntries = (recipe) => {
  const items = [];
  const recipeIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : null;

  if (recipeIngredients && recipeIngredients.length > 0) {
    recipeIngredients.forEach((item) => {
      const text = normalizeText(item?.main);
      if (!text) {
        return;
      }
      const alternatives = Array.isArray(item?.alternatives)
        ? item.alternatives.map(normalizeText).filter(Boolean)
        : [];
      items.push({ text, isBonus: false, alternatives });
    });
  } else {
    INGREDIENT_FIELDS.forEach((keys) => {
      const rawValue = pickFieldValue(recipe, keys);
      const text = normalizeText(rawValue);
      if (text) {
        items.push({ text, isBonus: false, alternatives: [] });
      }
    });
  }

  const bonusText = normalizeText(pickFieldValue(recipe, FIELD_MAP.bonus));
  if (bonusText) {
    items.push({ text: bonusText, isBonus: true, alternatives: [] });
  }

  return items;
};

const matchesIngredientFilter = (recipe, keyword) => {
  const query = normalizeText(keyword);
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();
  const recipeIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  return recipeIngredients.some((ingredient) => {
    const main = normalizeText(ingredient?.main).toLowerCase();
    if (main === normalizedQuery) {
      return true;
    }

    const alternatives = Array.isArray(ingredient?.alternatives)
      ? ingredient.alternatives
      : [];

    return alternatives.some(
      (alternative) => normalizeText(alternative).toLowerCase() === normalizedQuery
    );
  });
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

const createRecipeCard = (
  recipe,
  { onOpenPriceDrawer, onOpenIngredientDrawer, ingredientStatus }
) => {
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
    const hasAlternatives =
      !entry.isBonus && Array.isArray(entry.alternatives) && entry.alternatives.length > 0;
    if (hasAlternatives) {
      item.classList.add("recipe-card__ingredient--has-alternatives");
    }
    if (entry.isBonus) {
      item.classList.add("is-bonus");
    }

    if (hasAlternatives) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recipe-card__ingredient-button";
      button.textContent = entry.text;
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        onOpenIngredientDrawer({
          name: entry.text,
          alternatives: entry.alternatives,
        });
      });
      item.appendChild(button);
    } else {
      const label = document.createElement("span");
      label.className = "recipe-card__ingredient-label";
      label.textContent = entry.text;
      item.appendChild(label);
    }

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
    createMetaItem("料理狀態", buildRecipeStatusLabel(ingredientStatus)),
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

  const ingredientDrawerOverlay = document.createElement("div");
  ingredientDrawerOverlay.className = "recipes-view__drawer-overlay";
  ingredientDrawerOverlay.setAttribute("aria-hidden", "true");

  const ingredientDrawer = document.createElement("aside");
  ingredientDrawer.className = "recipes-view__drawer";
  ingredientDrawer.setAttribute("role", "dialog");
  ingredientDrawer.setAttribute("aria-modal", "true");
  ingredientDrawer.setAttribute("aria-hidden", "true");

  const ingredientDrawerPanel = document.createElement("div");
  ingredientDrawerPanel.className = "recipes-view__drawer-panel";

  const ingredientDrawerHeader = document.createElement("div");
  ingredientDrawerHeader.className = "recipes-view__drawer-header";

  const ingredientDrawerTitle = document.createElement("h3");
  ingredientDrawerTitle.className = "recipes-view__drawer-title";

  const ingredientDrawerClose = document.createElement("button");
  ingredientDrawerClose.type = "button";
  ingredientDrawerClose.className =
    "recipes-view__drawer-close btn btn-outline-secondary btn-sm";
  ingredientDrawerClose.textContent = "關閉";

  ingredientDrawerHeader.append(ingredientDrawerTitle, ingredientDrawerClose);

  const ingredientDrawerList = document.createElement("ul");
  ingredientDrawerList.className = "recipes-view__drawer-list";

  ingredientDrawerPanel.append(ingredientDrawerHeader, ingredientDrawerList);
  ingredientDrawer.appendChild(ingredientDrawerPanel);

  let activeIngredient = null;
  const updateBodyDrawerState = () => {
    const isOpen =
      priceDrawer.classList.contains("is-visible") ||
      ingredientDrawer.classList.contains("is-visible");
    document.body.classList.toggle("is-drawer-open", isOpen);
  };

  const closePriceDrawer = () => {
    priceDrawerOverlay.classList.remove("is-visible");
    priceDrawer.classList.remove("is-visible");
    priceDrawerOverlay.setAttribute("aria-hidden", "true");
    priceDrawer.setAttribute("aria-hidden", "true");
    updateBodyDrawerState();
  };

  const openPriceDrawer = (recipe) => {
    closeIngredientDrawer();
    activeIngredient = null;
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
    updateBodyDrawerState();
  };

  const closeIngredientDrawer = () => {
    ingredientDrawerOverlay.classList.remove("is-visible");
    ingredientDrawer.classList.remove("is-visible");
    ingredientDrawerOverlay.setAttribute("aria-hidden", "true");
    ingredientDrawer.setAttribute("aria-hidden", "true");
    activeIngredient = null;
    updateBodyDrawerState();
  };

  const openIngredientDrawer = (ingredient) => {
    closePriceDrawer();
    activeIngredient = ingredient;
    ingredientDrawerTitle.textContent = ingredient?.name || "";
    ingredientDrawerList.innerHTML = "";
    const alternatives = Array.isArray(ingredient?.alternatives)
      ? ingredient.alternatives
      : [];

    if (alternatives.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "recipes-view__drawer-item";
      emptyItem.textContent = "目前沒有可用的替代材料。";
      ingredientDrawerList.appendChild(emptyItem);
    } else {
      alternatives.forEach((name) => {
        const item = document.createElement("li");
        item.className = "recipes-view__drawer-item";
        item.textContent = name;
        ingredientDrawerList.appendChild(item);
      });
    }

    ingredientDrawerOverlay.classList.add("is-visible");
    ingredientDrawer.classList.add("is-visible");
    ingredientDrawerOverlay.setAttribute("aria-hidden", "false");
    ingredientDrawer.setAttribute("aria-hidden", "false");
    updateBodyDrawerState();
  };

  priceDrawerOverlay.addEventListener("click", closePriceDrawer);
  priceDrawerClose.addEventListener("click", closePriceDrawer);
  ingredientDrawerOverlay.addEventListener("click", closeIngredientDrawer);
  ingredientDrawerClose.addEventListener("click", closeIngredientDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePriceDrawer();
      closeIngredientDrawer();
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
      const ingredientStatus = buildIngredientStatus(recipe, ownedIngredientSet);
      column.appendChild(
        createRecipeCard(recipe, {
          onOpenPriceDrawer: openPriceDrawer,
          onOpenIngredientDrawer: openIngredientDrawer,
          ingredientStatus,
        })
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

  wrapper.append(
    filter,
    list,
    priceDrawerOverlay,
    priceDrawer,
    ingredientDrawerOverlay,
    ingredientDrawer
  );
  container.appendChild(wrapper);
}
