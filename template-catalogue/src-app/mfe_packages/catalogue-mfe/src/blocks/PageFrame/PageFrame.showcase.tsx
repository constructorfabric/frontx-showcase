import { PageFrame } from './PageFrame';

/** A page with two paragraphs. */
export default function PageFrameShowcase() {
  return (
    <PageFrame testId="showcase-page">
      <p>First block.</p>
      <p>Second block.</p>
    </PageFrame>
  );
}
