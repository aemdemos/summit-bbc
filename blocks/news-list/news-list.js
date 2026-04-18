export default async function decorate(block) {
  const rows = [...block.children];
  // Row 0: header (title + View More button) — leave in place

  // Rows 1+: news items → ul > li
  const newsRows = rows.slice(1);
  if (newsRows.length) {
    const ul = document.createElement('ul');
    ul.classList.add('news-grid');
    newsRows.forEach((row) => {
      const li = document.createElement('li');
      li.classList.add('news-card');
      // Preserve original column divs as li children
      while (row.firstElementChild) li.append(row.firstElementChild);
      ul.append(li);
    });
    // Clean up original rows (now empty after moving children)
    newsRows.forEach((row) => row.remove());
    block.append(ul);
  }
}
