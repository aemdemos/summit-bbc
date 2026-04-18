export default async function decorate(block) {
  const rows = [...block.children];

  // Row 1: Featured card (image + text) — add class, leave structure intact
  if (rows[0]) {
    rows[0].classList.add('co-featured');
  }

  // Rows 2+: Quickfinder cards — collect all cells into a flat grid
  const quickfinderRows = rows.slice(1);
  if (quickfinderRows.length) {
    const grid = document.createElement('div');
    grid.classList.add('co-quickfinder-grid');
    quickfinderRows.forEach((row) => {
      [...row.children].forEach((cell) => {
        cell.classList.add('co-quickfinder-card');
        grid.append(cell);
      });
      row.remove();
    });
    block.append(grid);
  }
}
