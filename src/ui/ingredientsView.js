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

const createDetailRow = (label, contentNode, { interactive = false, onClick } = {}) => {
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

  if (interactive) {
    wrapper.classList.add("ingredient-card__row--interactive");
    wrapper.tabIndex = 0;
    wrapper.setAttribute("role", "button");
    wrapper.addEventListener("click", (event) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      onClick?.();
    });
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.();
      }
    });
  }
  return wrapper;
};

const createOwnedToggle = (item) => {
  const label = document.createElement("label");
  label.className = "ingredient-card__owned";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = ownedState.get(item.name);
  checkbox.addEventListener("change", () => {
    ownedState.set(item.name, checkbox.checked);
  });

  const text = document.createElement("span");
  text.textContent = "已擁有";

  label.appendChild(checkbox);
  label.appendChild(text);

  return { element: label, checkbox };
};

export function renderIngredientsView(container, ingredients, category) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "category-title";
  title.textContent = category;
  container.appendChild(title);

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
  list.className = "ingredient-list";

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ingredient-card";

    const name = document.createElement("h3");
    name.className = "ingredient-card__title";
    name.textContent = item.name;

    const sub = document.createElement("p");
    sub.className = "ingredient-card__subtitle";
    sub.textContent = item.smallCategory || "—";

    card.appendChild(name);
    card.appendChild(sub);

    card.appendChild(
      createDetailRow("取得季節", createTagList(item.seasons))
    );
    card.appendChild(
      createDetailRow("取得方式", createTagList(item.obtainMethod))
    );
    card.appendChild(
      createDetailRow("取得位置", createTagList(item.obtainLocation))
    );
    const ownedToggle = createOwnedToggle(item);
    card.appendChild(
      createDetailRow("我擁有", ownedToggle.element, {
        interactive: true,
        onClick: () => {
          ownedToggle.checkbox.checked = !ownedToggle.checkbox.checked;
          ownedState.set(item.name, ownedToggle.checkbox.checked);
        },
      })
    );

    list.appendChild(card);
  });

  container.appendChild(list);
}
