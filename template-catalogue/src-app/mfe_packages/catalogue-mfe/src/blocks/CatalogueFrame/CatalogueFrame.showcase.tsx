import { CatalogueFrame } from './CatalogueFrame';

/** The frame with placeholder regions in each slot. */
export default function CatalogueFrameShowcase() {
  return (
    <CatalogueFrame sections={<nav aria-label="Sections">Sections</nav>} panel={<nav aria-label="Pages">Pages</nav>}>
      <p>The current page.</p>
    </CatalogueFrame>
  );
}
