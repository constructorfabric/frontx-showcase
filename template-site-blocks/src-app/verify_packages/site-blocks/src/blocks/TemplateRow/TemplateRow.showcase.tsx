import { createElement } from 'react';
import { TemplateRow } from './TemplateRow';

export const showcase = { title: 'Template row', group: 'docs', summary: 'A template that follows the leading ones as one full-width whole-card link.' } as const;

export default function TemplateRowShowcase() {
  return <TemplateRow item={{ title: 'Add Design Guardrails', text: 'Design rules, agent guidance and interface checks for the screens you build.', link: createElement('a', { href: '/?screen=templates;route=template-design-guardrails' }) }} />;
}
