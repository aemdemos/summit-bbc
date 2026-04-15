export default async function decorate(block) {
  // Footer links block is simple enough that the authored HTML works as-is.
  // Ensure social links open in new tabs.
  block.querySelectorAll('a[href*="linkedin.com"], a[href*="instagram.com"]').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}
