// Background color palette for card items (cycled in order)
const CARD_BG_DARK = ['people-cards-navy', 'people-cards-blue'];
const CARD_BG_LIGHT = 'people-cards-gray';

export default async function decorate(block) {
  const rows = [...block.children];
  const ul = document.createElement('ul');

  let darkIndex = 0;

  rows.forEach((row, i) => {
    if (i === 0) {
      // Featured row: one li with both column divs inside (50/50 layout)
      const li = document.createElement('li');
      li.classList.add('people-cards-featured');
      while (row.firstElementChild) li.append(row.firstElementChild);

      // Classify column divs
      [...li.children].forEach((div) => {
        const hasImg = div.querySelector('picture, img');
        const hasHeading = div.querySelector('h2, h3, h4, h5, h6');
        const textContent = div.textContent.trim();
        if (hasImg && !hasHeading && !textContent) {
          div.classList.add('people-cards-image');
        } else {
          div.classList.add('people-cards-text');
        }
      });

      ul.append(li);
    } else {
      // Card rows: each cell becomes its own li (25% each on desktop)
      [...row.children].forEach((cell) => {
        const li = document.createElement('li');
        li.classList.add('people-cards-card');

        const hasImg = cell.querySelector('picture, img');
        const hasHeading = cell.querySelector('h2, h3, h4, h5, h6');
        const textContent = cell.textContent.trim();

        if (hasImg && !hasHeading && !textContent) {
          // Image-only card
          li.classList.add('people-cards-image');
        } else if (hasHeading && hasHeading.tagName === 'H3'
          && cell.querySelectorAll('p').length > 1) {
          // Text card with heading + description + link = light bg
          li.classList.add('people-cards-text', CARD_BG_LIGHT);
        } else {
          // Text card with heading + link only = dark bg
          li.classList.add('people-cards-text', CARD_BG_DARK[darkIndex % CARD_BG_DARK.length]);
          darkIndex += 1;
        }

        while (cell.firstChild) li.append(cell.firstChild);
        ul.append(li);
      });
    }
  });

  block.textContent = '';
  block.append(ul);
}
