import { useEffect } from 'react';

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  const existed = Boolean(element);
  const previous = element?.getAttribute('content') ?? null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);

  return () => {
    if (!existed) element.remove();
    else if (previous !== null) element.setAttribute('content', previous);
    else element.removeAttribute('content');
  };
}

/**
 * Keep document title, description, and robots meta in sync with the current
 * route. Values are restored when the component unmounts.
 */
export function useDocumentMeta({ title, description, noIndex = false } = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const previousTitle = document.title;
    if (title) document.title = title;

    const cleanups = [];
    if (typeof description === 'string') {
      cleanups.push(upsertMeta('name', 'description', description));
      cleanups.push(upsertMeta('property', 'og:description', description));
    }
    if (title) {
      cleanups.push(upsertMeta('property', 'og:title', title));
    }
    cleanups.push(upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow'));

    return () => {
      document.title = previousTitle;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [title, description, noIndex]);
}

export default useDocumentMeta;
