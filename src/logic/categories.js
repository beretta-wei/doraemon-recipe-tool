export const toCategorySlug = (category) => {
  if (!category) {
    return "";
  }
  return category
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/?%*:|"<>]/g, "-");
};

export const getCategoryHref = (category) =>
  `category-${toCategorySlug(category)}.html`;
