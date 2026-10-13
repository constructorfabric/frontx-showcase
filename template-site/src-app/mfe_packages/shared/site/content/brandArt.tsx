import type { ReactElement, ReactNode } from 'react';
import { ArchitectureFigure } from '@gears-frontx/site-brand/art/ArchitectureFigure';
import { ChartThumb } from '@gears-frontx/site-brand/art/ChartThumb';
import { ClosingVisual } from '@gears-frontx/site-brand/art/ClosingVisual';
import { HairlineFigure } from '@gears-frontx/site-brand/art/HairlineFigure';
import { HeroArt } from '@gears-frontx/site-brand/art/HeroArt';
import { MetricBars } from '@gears-frontx/site-brand/art/MetricBars';
import { TemplateFigure } from '@gears-frontx/site-brand/art/TemplateFigure';
import { WorkbenchFigure } from '@gears-frontx/site-brand/art/WorkbenchFigure';
import type { Figure } from './outline';

/*
 * The brand art the blocks take in their art slots, in one place: each function picks the art component of @gears-frontx/site-brand for an entry, so the renderer and the screens name no drawing. Art carries its own palettes; nothing here styles it.
 */

// @cpt-begin:cpt-template-site-flow-content-model-read-content-page:p1:inst-render-entries
/** The labels and link elements the architecture drawing takes. */
export interface ArchitectureArt {
  label: string;
  kit: { title: string; note?: string; link: ReactElement };
  rules: { title: string; note?: string; link: ReactElement };
  shell: { title: string; link: ReactElement; templates: { label: string; link: ReactElement } };
  screens: readonly { title: string; hint: string; link: ReactElement }[];
  wires: { kit: string; rules: string };
}

/** The words the change-story workbench drawing takes. */
export interface WorkbenchArt {
  /** The prompt given to the agent, with the part that is emphasised. */
  task: { before: string; emphasis: string; after: string };
  diff: { path: string; removed: string; added: string };
  result: { label: string; nav: string; title: string; text: string };
}

/** One bar of a metric chart. */
export interface MetricArtBar {
  label: string;
  share: number;
  featured: boolean;
}

/** A figure of the hairline family, decoration beside its text. */
export function figureArt(figure: Figure): ReactNode {
  return <HairlineFigure stock={figure} />;
}

/** The hero's drawing, named for assistive technology. */
export function heroArt(label: string): ReactNode {
  return <HeroArt label={label} />;
}

/** The architecture map: the drawing with its linked nodes. A map with other than two screens draws none. */
export function architectureArt({ label, kit, rules, shell, screens, wires }: ArchitectureArt): ReactNode {
  const [first, second] = screens;
  if (!first || !second || screens.length !== 2) return undefined;
  return <ArchitectureFigure label={label} kit={{ ...kit, note: kit.note ?? '' }} rules={{ ...rules, note: rules.note ?? '' }} shell={shell} screens={[first, second]} wires={wires} />;
}

/** The change story's workbench: the prompt, the diff of the file and the preview of the result. */
export function workbenchArt({ task, diff, result }: WorkbenchArt): ReactNode {
  return (
    <WorkbenchFigure
      task={
        <>
          {task.before}
          <strong>{task.emphasis}</strong>
          {task.after}
        </>
      }
      diff={diff}
      result={{ label: result.label, navLabel: result.nav, title: result.title, text: result.text }}
    />
  );
}

/** The bars of one metric, the featured one in the brand colour; proportions only. */
export function metricArt(bars: readonly MetricArtBar[]): ReactNode {
  return <MetricBars bars={bars.map((bar) => ({ label: bar.label, share: bar.share, tone: bar.featured ? 'featured' : 'reference' }))} />;
}

/** The drawing of a template card: the shell, the screens workspace or the design guardrails. */
export function templateArt(template: 'shell' | 'screens' | 'guardrails'): ReactNode {
  return <TemplateFigure template={template} />;
}

/** A chart thumbnail of a kit showcase tile, with the words some of them carry. */
export function chartArt(name: 'area' | 'bar' | 'distribution' | 'trends', words?: { centre?: string; label?: string; value?: string }): ReactNode {
  return <ChartThumb chart={name} centre={words?.centre} caption={words?.label !== undefined && words.value !== undefined ? { label: words.label, value: words.value } : undefined} />;
}

/** The closing band's visual, decoration. */
export function closingArt(): ReactNode {
  return <ClosingVisual />;
}
// @cpt-end:cpt-template-site-flow-content-model-read-content-page:p1:inst-render-entries
