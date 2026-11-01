/**
 * Copy text to the system clipboard.
 *
 * Attempts the modern Clipboard API first, then falls back to the
 * legacy `document.execCommand('copy')` approach for older browsers.
 *
 * @param {string} text – The text to copy
 * @returns {Promise<boolean>} `true` if the copy succeeded, `false` otherwise
 */
export async function copyToClipboard(text) {
  // Modern Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy fallback
    }
  }

  // Legacy fallback using a hidden textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Keep the textarea out of view
    textarea.setAttribute('readonly', '');
    Object.assign(textarea.style, {
      position: 'fixed',
      left: '-9999px',
      top: '-9999px',
      opacity: '0',
    });

    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  } catch {
    return false;
  }
}
