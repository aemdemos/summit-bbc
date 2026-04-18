export default async function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const textCell = row.querySelector(':scope > div:last-child');
  if (!textCell) return;

  // Find the CTA link (last link in the text cell)
  const links = textCell.querySelectorAll('a[href]');
  const ctaLink = links.length > 0 ? links[links.length - 1] : null;
  if (!ctaLink) return;

  // Wrap the h2 text in the same link as the CTA
  const h2 = textCell.querySelector('h2');
  if (h2 && ctaLink.href) {
    const titleLink = document.createElement('a');
    titleLink.href = ctaLink.href;
    titleLink.classList.add('hero-title-link');
    // Move h2's children into the link
    const maxNodes = 100;
    let count = 0;
    while (h2.firstChild && count < maxNodes) {
      titleLink.append(h2.firstChild);
      count += 1;
    }
    h2.append(titleLink);
  }
}
