import { getMetadata, loadSections } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateMain } from '../../scripts/scripts.js';

/**
 * Loads a fragment, falling back to full HTML parsing for local dev.
 * @param {string} path The fragment path
 * @returns {Promise<HTMLElement>} The fragment main element
 */
async function loadNavFragment(path) {
  // try standard fragment loading first
  const fragment = await loadFragment(path);
  if (fragment) return fragment;

  // fallback: fetch full HTML page and extract main content (local dev)
  const resp = await fetch(path);
  if (resp.ok) {
    const html = await resp.text();
    const main = document.createElement('main');
    // parse into an inert document via iframe srcdoc to avoid XXE
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.srcdoc = html;
    document.body.append(iframe);
    await new Promise((resolve) => { iframe.addEventListener('load', resolve); });
    const sourceMain = iframe.contentDocument.querySelector('main');
    if (sourceMain) {
      const maxNodes = 200;
      let count = 0;
      while (sourceMain.firstChild && count < maxNodes) {
        main.append(sourceMain.firstChild);
        count += 1;
      }
    }
    iframe.remove();
    decorateMain(main);
    await loadSections(main);
    return main;
  }
  return null;
}

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * Organizes mega-menu dropdown items into columns based on section headers.
 * Items with href="#" that have no nested content are treated as column headings.
 * @param {Element} navSections The nav sections element
 */
function decorateMegaMenu(navSections) {
  navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navItem) => {
    const subList = navItem.querySelector('ul');
    if (!subList) return;

    let colIndex = 0;
    [...subList.children].forEach((li) => {
      const link = li.querySelector('a');
      if (!link) return;

      // Items linking to "#" with no sub-list are section headings
      const isHeading = link.getAttribute('href') === '#' && !li.querySelector('ul');
      if (isHeading) {
        colIndex += 1;
        li.classList.add('mega-heading', 'mega-col-start');
      }
      li.setAttribute('data-col', String(colIndex));
    });
  });
}

/**
 * Replaces the search text link with an SVG search icon
 * @param {Element} navTools The nav tools element
 */
function decorateSearchIcon(navTools) {
  if (!navTools) return;
  const searchLink = navTools.querySelector('a');
  if (!searchLink) return;

  const icon = document.createElement('span');
  icon.className = 'search-icon';
  icon.setAttribute('aria-label', 'Search');
  /* eslint-disable browser-security/detect-mixed-content, browser-security/no-http-urls -- W3C SVG namespace */
  const svgNs = 'http://www.w3.org/2000/svg';
  /* eslint-enable browser-security/detect-mixed-content, browser-security/no-http-urls */
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const circle = document.createElementNS(svgNs, 'circle');
  circle.setAttribute('cx', '11');
  circle.setAttribute('cy', '11');
  circle.setAttribute('r', '7');
  const line = document.createElementNS(svgNs, 'line');
  line.setAttribute('x1', '16.5');
  line.setAttribute('y1', '16.5');
  line.setAttribute('x2', '21');
  line.setAttribute('y2', '21');
  svg.append(circle, line);
  icon.append(svg);
  searchLink.textContent = '';
  searchLink.appendChild(icon);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment — prefer local content on localhost
  const navMeta = getMetadata('nav');
  let navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  if (!navMeta && window.location.hostname === 'localhost') {
    const localResp = await fetch('/content/nav');
    if (localResp.ok) navPath = '/content/nav';
  }
  const fragment = await loadNavFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });

    // organize mega-menu columns
    decorateMegaMenu(navSections);
  }

  // decorate search icon in tools
  const navTools = nav.querySelector('.nav-tools');
  decorateSearchIcon(navTools);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
