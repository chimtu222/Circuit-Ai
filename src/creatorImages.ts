const creatorImageModules = import.meta.glob(
  "./assets/creator/subbu-*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default"
  }
) as Record<string, string>;

function shuffleArray(items: string[]) {
  const clonedItems = [...items];

  for (let index = clonedItems.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const temp = clonedItems[index];
    clonedItems[index] = clonedItems[randomIndex];
    clonedItems[randomIndex] = temp;
  }

  return clonedItems;
}

export function getRandomCreatorImages(limit = 8) {
  const allImages = Object.values(creatorImageModules);

  return shuffleArray(allImages).slice(0, limit);
}