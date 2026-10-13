import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileIcon } from 'lucide-react';
import {
  TranscriptAttachment,
  TranscriptBubble,
  TranscriptImageBubble,
  TranscriptMeta,
} from '@inbox-shared/blocks/TranscriptMessage';
import { expectNoAxeViolations } from './axe';

describe('TranscriptMessage', () => {
  it('draws a text bubble with its attachment and the time with a named receipt last', async () => {
    const { container } = render(
      <TranscriptBubble align="end" variant="default">
        <TranscriptAttachment icon={<FileIcon />} name="report.pdf" size="1.2 MB" />
        Here it is
        <TranscriptMeta time="9:15" receipt={{ read: true, label: 'Read' }} />
      </TranscriptBubble>
    );
    expect(screen.getByText('report.pdf')).toBeTruthy();
    expect(screen.getByText('9:15')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Read' })).toBeTruthy();
    expect(container.querySelector('[data-align="end"]')).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it('gives a captioned image an empty text alternative and a caption-less one its own', async () => {
    const { container } = render(
      <>
        <TranscriptImageBubble align="start" variant="secondary" src="/a.svg" alt="Shared image" caption="The chart" time="9:15" />
        <TranscriptImageBubble
          align="start"
          variant="secondary"
          src="/b.svg"
          alt="Shared image"
          time="9:16"
          receipt={{ read: false, label: 'Delivered' }}
        />
      </>
    );
    const images = container.querySelectorAll('img');
    expect(images[0]?.getAttribute('alt')).toBe('');
    expect(images[1]?.getAttribute('alt')).toBe('Shared image');
    expect(screen.getByText('The chart')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Delivered' })).toBeTruthy();
    await expectNoAxeViolations(container);
  });
});
