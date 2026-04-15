export default async function decorate(block) {
  const rows = [...block.children];

  // Row 1: Tag + Heading - mark the tag paragraph
  if (rows[0]) {
    const cells = [...rows[0].children];
    if (cells[0]) {
      const tagP = cells[0].querySelector('p');
      if (tagP) tagP.classList.add('tag');
    }
    // Merge cells into one div for centering
    if (cells.length > 1) {
      const content = document.createElement('div');
      cells.forEach((cell) => {
        content.append(...cell.childNodes);
      });
      rows[0].replaceChildren(content);
    }
  }

  // Row 2: Image + Featured card - already structured correctly
  // Row 3: Three quickfinder cards - already structured correctly

  // Add dot class to the period in the heading
  const heading = block.querySelector('h2');
  if (heading) {
    const dot = heading.querySelector('.dot');
    if (!dot) {
      heading.innerHTML = heading.innerHTML.replace(/\.$/, '<span class="dot">.</span>');
    }
  }
}
