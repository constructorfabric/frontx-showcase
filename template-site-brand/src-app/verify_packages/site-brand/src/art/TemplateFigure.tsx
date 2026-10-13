import { HairlineFigure, type HairlineStock } from './HairlineFigure';

/** The roles a template plays on the site's pages: the host application, the workspace of screens, the design rules. */
export type TemplateRole = 'shell' | 'screens' | 'guardrails';

export interface TemplateFigureProps {
  template: TemplateRole;
  /** One sentence for assistive technology. Without it the figure is decoration and hidden from them. */
  label?: string;
}

// @cpt-begin:cpt-template-site-brand-algo-brand-art-template-figure:p2:inst-role-stock
const STOCK: Record<TemplateRole, HairlineStock> = {
  shell: 'hub',
  screens: 'riffle',
  guardrails: 'loupe',
};
// @cpt-end:cpt-template-site-brand-algo-brand-art-template-figure:p2:inst-role-stock

// @cpt-algo:cpt-template-site-brand-algo-brand-art-template-figure:p2
/** The figure of a template card: one hairline figure per template role, so every page that shows a template draws it the same way. */
export function TemplateFigure({ template, label }: TemplateFigureProps) {
  return <HairlineFigure stock={STOCK[template]} label={label} />;
}
