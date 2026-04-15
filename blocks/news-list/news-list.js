export default async function decorate(block) {
  const rows = [...block.children];
  // First row is the header (title + button) — leave it as-is
  // Remaining rows are news items — each has [image cell, text cell]

  const newsRows = rows.slice(1);

  // Build a grid container for the news cards
  const grid = document.createElement('div');
  grid.className = 'news-grid';

  newsRows.forEach((row) => {
    const cells = [...row.children];
    const card = document.createElement('div');
    card.className = 'news-card';

    // Image cell
    if (cells[0]) {
      const pic = cells[0].querySelector('picture');
      if (pic) card.appendChild(pic);
    }

    // Text cell
    if (cells[1]) {
      const h4 = cells[1].querySelector('h4');
      if (h4) card.appendChild(h4);
    }

    grid.appendChild(card);
    row.style.display = 'none';
  });

  block.appendChild(grid);
}
