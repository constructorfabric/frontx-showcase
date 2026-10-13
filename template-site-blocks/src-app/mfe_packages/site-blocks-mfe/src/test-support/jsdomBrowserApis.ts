// The screen's router restores the scroll position on navigation, and jsdom does not implement scrolling.
window.scrollTo = () => {};
