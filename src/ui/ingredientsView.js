import ownedState from "../state/ownedState.js";

const createTagList = (items) => {
  if (!items || items.length === 0) {
    const empty = document.createElement("span");
    empty.className = "ingredient-card__value";
    empty.textContent = "—";
    return empty;
  }

  const list = document.createElement("ul");
  list.className = "ingredient-card__tags";

  items.forEach((item) => {
    const tag = document.createElement("li");
    tag.className = "ingredient-card__tag";
    tag.textContent = item;
    list.appendChild(tag);
  });

  return list;
};

const createDetailRow = (label, contentNode) => {
  const wrapper = document.createElement("div");
  wrapper.className = "ingredient-card__row";

  const title = document.createElement("span");
  title.className = "ingredient-card__label";
  title.textContent = label;

  const value = document.createElement("div");
  value.className = "ingredient-card__value";
  value.appendChild(contentNode);

  wrapper.appendChild(title);
  wrapper.appendChild(value);

  return wrapper;
};

const createOwnedToggle = (item) => {
  const label = document.createElement("label");
  label.className = "ingredient-card__owned form-check d-flex align-items-center gap-2";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input m-0";
  checkbox.checked = ownedState.get(item.name);
  checkbox.disabled = true;
  checkbox.setAttribute("aria-label", "已擁有");

  const text = document.createElement("span");
  text.className = "form-check-label";
  text.textContent = "已擁有";

  label.appendChild(checkbox);
  label.appendChild(text);

  return { element: label, checkbox };
};

export function renderIngredientsView(container, ingredients, category) {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3";

  const title = document.createElement("h2");
  title.className = "category-title mb-0";
  title.textContent = category;

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "btn btn-outline-danger btn-sm";
  clearButton.textContent = "清除所有已擁有食材";
  clearButton.addEventListener("click", () => {
    ownedState.clearStorage();
    renderIngredientsView(container, ingredients, category);
  });

  header.append(title, clearButton);
  container.appendChild(header);

  const filtered = ingredients.filter(
    (item) => item.bigCategory === category
  );

  if (filtered.length === 0) {
    const empty = document.createElement("p");
    empty.className = "recipes-view__empty";
    empty.textContent = "目前沒有此分類的食材資料。";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "ingredient-list row g-3";

  filtered.forEach((item) => {
    const column = document.createElement("div");
    column.className = "col-12 col-md-6 col-lg-4";

    const card = document.createElement("article");
    card.className = "ingredient-card ingredient-card--interactive card shadow-sm h-100";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column gap-3";

    const name = document.createElement("h3");
    name.className = "ingredient-card__title h5 mb-0";
    name.textContent = item.name;

    const sub = document.createElement("p");
    sub.className = "ingredient-card__subtitle text-muted mb-0";
    sub.textContent = item.smallCategory || "—";

    cardBody.appendChild(name);
    cardBody.appendChild(sub);

    cardBody.appendChild(
      createDetailRow("取得季節", createTagList(item.seasons))
    );
    cardBody.appendChild(
      createDetailRow("取得方式", createTagList(item.obtainMethod))
    );
    cardBody.appendChild(
      createDetailRow("取得位置", createTagList(item.obtainLocation))
    );
    const ownedToggle = createOwnedToggle(item);
    cardBody.appendChild(
      createDetailRow("我擁有", ownedToggle.element)
    );

    const applyOwnedVisual = (isOwned) => {
      ownedToggle.checkbox.checked = isOwned;
      card.classList.toggle("ingredient-card--owned", isOwned);
    };

    applyOwnedVisual(ownedState.get(item.name));

    const toggleOwnedState = () => {
      const nextOwned = !ownedToggle.checkbox.checked;
      ownedState.set(item.name, nextOwned);
      applyOwnedVisual(nextOwned);
    };

    const shouldIgnoreToggle = (target) =>
      target instanceof HTMLElement && target.closest("button, a");

    card.addEventListener("click", (event) => {
      if (shouldIgnoreToggle(event.target)) {
        return;
      }
      toggleOwnedState();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleOwnedState();
      }
    });

    card.appendChild(cardBody);
    column.appendChild(card);
    list.appendChild(column);
  });

  container.appendChild(list);
}
