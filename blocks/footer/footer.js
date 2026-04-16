import { getMetadata, loadSections } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { decorateMain } from '../../scripts/scripts.js';

/**
 * Loads a fragment, falling back to full HTML parsing for local dev.
 * @param {string} path The fragment path
 * @returns {Promise<HTMLElement>} The fragment main element
 */
async function loadFooterFragment(path) {
  const fragment = await loadFragment(path);
  if (fragment) return fragment;

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

/**
 * Creates an SVG social icon element.
 * @param {string} name The social network name
 * @returns {Element|null} The SVG element or null
 */
function createSocialIcon(name) {
  /* eslint-disable browser-security/detect-mixed-content, browser-security/no-http-urls -- W3C SVG namespace */
  const svgNs = 'http://www.w3.org/2000/svg';
  /* eslint-enable browser-security/detect-mixed-content, browser-security/no-http-urls */
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  const path = document.createElementNS(svgNs, 'path');

  const paths = {
    linkedin: [
      'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037',
      '-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046',
      'c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455',
      'v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064',
      ' 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225',
      ' 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771',
      ' 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0',
      ' 22.222 0h.003z',
    ].join(''),
    instagram: [
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691',
      ' 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012',
      ' 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266',
      '.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149',
      '-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0',
      '-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919',
      ' 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014',
      ' 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0',
      ' 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98',
      'C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072',
      ' 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948',
      ' 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979',
      '-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0',
      ' 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4',
      ' 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44',
      ' 0 0 0 0-2.881z',
    ].join(''),
  };

  if (!Object.hasOwn(paths, name)) return null;
  path.setAttribute('d', paths[name]);
  svg.append(path);
  return svg;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — prefer local content on localhost
  const footerMeta = getMetadata('footer');
  let footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  if (!footerMeta && window.location.hostname === 'localhost') {
    const localResp = await fetch('/content/footer');
    if (localResp.ok) footerPath = '/content/footer';
  }
  const fragment = await loadFooterFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // find social links section and copyright section
  const sections = footer.querySelectorAll('.section');
  sections.forEach((section) => {
    const links = section.querySelectorAll('a');
    const hasOnlyLinks = links.length > 0
      && section.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');

    if (hasOnlyLinks) {
      // social links section
      const socialsDiv = document.createElement('div');
      socialsDiv.className = 'footer-socials';
      links.forEach((link) => {
        const name = link.textContent.trim().toLowerCase();
        const icon = createSocialIcon(name);
        if (icon) {
          link.textContent = '';
          link.append(icon);
          link.setAttribute('aria-label', name);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener');
        }
        socialsDiv.append(link);
      });
      section.textContent = '';
      section.append(socialsDiv);
    } else {
      // copyright section
      section.classList.add('footer-copyright');
    }
  });

  block.append(footer);
}
