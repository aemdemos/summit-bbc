export default async function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      // Check if cell contains only a picture/img (image-only cell)
      const pic = cell.querySelector('picture');
      const hasText = cell.querySelector('h2, h3, p');
      if (pic && !hasText) {
        cell.classList.add('image-cell');
      } else {
        cell.classList.add('text-cell');
      }
    });
  });

  // Mark rows for styling
  if (rows[0]) rows[0].classList.add('featured-row');
  if (rows[1]) rows[1].classList.add('cards-row');
}
