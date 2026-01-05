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

const isScrollableContainer = (element) => {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  const { overflowY } = window.getComputedStyle(element);
  return overflowY === "auto" || overflowY === "scroll";
};

const findScrollableContainer = (root) => {
  if (!(root instanceof HTMLElement)) {
    return null;
  }

  if (isScrollableContainer(root)) {
    return root;
  }

  const candidates = Array.from(root.querySelectorAll("*"));
  return candidates.find((element) => isScrollableContainer(element)) ?? null;
};

export const attachBackToTopButton = (host, scrollContainerRoot) => {
  if (!(host instanceof HTMLElement)) {
    return null;
  }

  const resolvedScrollContainer = findScrollableContainer(
    scrollContainerRoot
  );

  if (!resolvedScrollContainer) {
    return null;
  }

  const existingButton = host.querySelector(".back-to-top");
  if (existingButton) {
    existingButton.remove();
  }

  const button = createBackToTopButton();

  const updateVisibility = () => {
    const shouldShow = resolvedScrollContainer.scrollTop > VISIBILITY_THRESHOLD;
    button.classList.toggle("is-visible", shouldShow);
  };

  const handleClick = () => {
    resolvedScrollContainer.scrollTo({ top: 0, behavior: "smooth" });
  };

  button.addEventListener("click", handleClick);

  resolvedScrollContainer.addEventListener("scroll", updateVisibility, {
    passive: true,
  });

  updateVisibility();
  host.appendChild(button);
  return () => {
    resolvedScrollContainer.removeEventListener("scroll", updateVisibility);
    button.removeEventListener("click", handleClick);
    button.remove();
  };
};
