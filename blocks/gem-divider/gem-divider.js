export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const tagCell = cells[0];
  const headingCell = cells[1];

  // Build the divider structure
  const wrapper = document.createElement('div');
  wrapper.classList.add('gem-divider-inner');

  // H2 = tag/label (blue box with accent lines)
  if (tagCell) {
    const h2 = document.createElement('h2');
    h2.textContent = tagCell.textContent.trim();
    wrapper.append(h2);
  }

  // H3 = main heading text
  if (headingCell) {
    const h3 = document.createElement('h3');
    h3.textContent = headingCell.textContent.trim();
    wrapper.append(h3);
  }

  block.textContent = '';
  block.append(wrapper);
}
