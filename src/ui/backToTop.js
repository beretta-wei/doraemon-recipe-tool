const VISIBILITY_THRESHOLD = 200;

const createBackToTopButton = () => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-to-top";
  button.setAttribute("aria-label", "回到頂端");

  const icon = document.createElement("span");
  icon.className = "back-to-top__icon";
  icon.textContent = "↑";

  button.appendChild(icon);
  return button;
};

const getDefaultScrollContainer = () =>
  document.scrollingElement || document.documentElement;

export const attachBackToTopButton = (host, scrollContainer) => {
  if (!(host instanceof HTMLElement)) {
    return null;
  }

  const resolvedScrollContainer =
    scrollContainer instanceof HTMLElement
      ? scrollContainer
      : getDefaultScrollContainer();

  if (!resolvedScrollContainer) {
    return null;
  }

  const button = createBackToTopButton();

  const updateVisibility = () => {
    const shouldShow = resolvedScrollContainer.scrollTop > VISIBILITY_THRESHOLD;
    button.classList.toggle("is-visible", shouldShow);
  };

  button.addEventListener("click", () => {
    resolvedScrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  });

  resolvedScrollContainer.addEventListener("scroll", updateVisibility, {
    passive: true,
  });

  updateVisibility();
  host.appendChild(button);
  return button;
};
