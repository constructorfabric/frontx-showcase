// Browser APIs jsdom does not implement and the kit's components use: scrolling (the screen's router restores it), media queries, resize and intersection observers, element animations. Inert stand-ins: jsdom renders no layout, so the tests check that each page loads and renders, not how it looks.
window.scrollTo = () => {};
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.getAnimations ??= () => [];

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

class InertObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

globalThis.ResizeObserver ??= InertObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= InertObserver as unknown as typeof IntersectionObserver;
