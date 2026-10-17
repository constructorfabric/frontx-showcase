#!/usr/bin/env node
// The root-owned baseline of the `verify:ui` gate (scripts/design-verify-baseline.json): the findings a run carries on purpose, each with its reason, a checker false finding of GAPS G34 or a kit defect with its GAPS kit-defects row and upstream draft. `build <findings.json>` writes it from a run made without the baseline and refuses a finding no rule below knows (that one is a defect to fix, not a baseline entry); `check` fails when a carried finding has no reason, a reason its rule no longer gives, or no rule any more.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isEntryPoint } from './entry-point.mjs';

// @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule
const G34 = 'G34 false finding';
const KIT_EXAMPLES = 'kit-defects row for the kit examples the catalogue shows, upstream draft grouping them by component';
// @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule

/**
 * The reasons a finding may be carried for: rule id, route and target patterns, and the reason, or a function of the route that gives it. The first rule that matches names the reason. CSS Module classes keep their source name (`_codeBlock_<hash>`), which the targets match on.
 * @type {Array<{ id: RegExp, route: RegExp, target: RegExp, reason: string | ((route: string) => string) }>}
 */
// @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule
export const REASONS = [
  { id: /^card-content-overflow$/, route: /./, target: /\b_codeBlock_/, reason: `${G34}: the kit candidate CodeBlock scrolls its code horizontally (overflow-x: auto) and the checker counts a scroll region as overflow` },
  { id: /^card-content-overflow$/, route: /screen=(templates;route=|libs|blocks;route=(file-explorer|package-list))/, target: /\b_card_/, reason: `${G34}: the kit Card holds a kit candidate CodeBlock whose code scrolls horizontally; the checker counts the scroll region as the card's overflow` },
  { id: /^card-content-overflow$/, route: /./, target: /\b_wrapper_/, reason: `${G34}: a wide table scrolls inside its kit DataTable wrapper (overflow: auto)` },
  { id: /^card-missing-padding$/, route: /./, target: /\b_codeBlock_/, reason: `${G34}: the kit candidate CodeBlock scrolls its code horizontally (overflow-x: auto); the checker counts ink inside a horizontal scroll container, so a line ending in the scroll region's padding reads as content at the card's edge (the fix belongs upstream in template-design-guardrails)` },
  { id: /^card-missing-padding$/, route: /screen=libs/, target: /\b_card_/, reason: `${G34}: the kit Card holds a kit candidate CodeBlock whose code scrolls horizontally; the checker counts ink inside a horizontal scroll container, so a line ending in the scroll region reads as content at the card's edge (the fix belongs upstream in template-design-guardrails)` },
  { id: /^clipped-text$/, route: /screen=libs;route=/, target: /\b_itemDescription_/, reason: 'Kit defect: the kit ItemDescription always clamps to two lines (overflow: hidden) and does not break a long identifier, so at a phone width beside a classic scrollbar it clips one (GAPS kit-defects row "ItemDescription clamp"; a configurable clamp is to be proposed upstream in gears-frontx)' },
  { id: /^card-missing-padding$/, route: /screen=catalogue$/, target: /^section\._card_/, reason: `${G34}: the catalogue ListCard runs its header band and divided link rows edge to edge by design (GAPS kit gap: no list card with flush rows)` },
  { id: /^card-missing-padding$/, route: /screen=(home|blocks;route=kit-showcase)$/, target: /\b_card_/, reason: `${G34}: the KitShowcase tile is a kit Card with no padding of its own whose sample and link row pad themselves; the checker reads the kit Separator spanning the card as ink at its edge (the design draws the same tile)` },
  { id: /^control-height-mismatch$/, route: /./, target: /./, reason: `${G34}: the checker compares controls it takes for one row; these are stacked rows, list items or different control sizes on purpose` },
  { id: /^small-control-text$/, route: /screen=inbox-(contacts|dashboard)/, target: /\b_(sortButtonInner|headerLabel)_/, reason: 'Kit defect: the kit DataTable sort header draws its label at 10px (GAPS kit-defects row "DataTable sort header text", upstream draft)' },
  { id: /^small-control-text$/, route: /screen=catalogue;route=components\/questionnaire/, target: /\b_shortcut_/, reason: 'Kit defect: the kit Questionnaire draws its shortcut hint at 10px (GAPS kit-defects row, upstream draft)' },
  { id: /^axe\/color-contrast$/, route: /screen=(catalogue;route=components\/|inbox-(chat|mail))/, target: /#base-ui-_r_[0-9a-z]+_$/, reason: 'Kit defect: the kit paints an inactive TabsTrigger in 60% of the foreground, 4.08 to 4.38:1 (GAPS kit-defects row "inactive TabsTrigger contrast", upstream draft)' },
  { id: /^axe\/color-contrast$/, route: /screen=catalogue;route=components\/badge/, target: /\b_badge_/, reason: 'Kit defect: the kit Badge category tone falls under 4.5:1 in the dark theme (GAPS kit-defects row "Badge tones", upstream draft)' },
  { id: /^axe\/color-contrast$/, route: /screen=catalogue;route=components\/input-group/, target: /\b_group_/, reason: 'Kit defect: the kit InputGroup addon text falls under 4.5:1 in the dark theme (GAPS kit-defects row, upstream draft)' },
  { id: /^axe\/color-contrast$/, route: /screen=mfe-theme/, target: /data-token="destructive"/, reason: 'Kit defect: the kit dark theme pairs --destructive-foreground (white) with --destructive #fb7185 under 4.5:1 (GAPS kit-defects row "destructive Button/Bubble", upstream draft)' },
  { id: /^card-(missing-padding|content-overflow)$/, route: /screen=catalogue;route=components\//, target: /./, reason: (route) => `${G34}: a part of the kit's own ${route.split('/').pop()} example that the checker takes for a card` },
  { id: /^axe\//, route: /screen=catalogue;route=components\//, target: /./, reason: (route) => `Kit example defect: the kit's own ${route.split('/').pop()} example (${KIT_EXAMPLES})` },
];
// @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule

/**
 * @typedef {{ route: string, theme: string, width: number, findings?: Array<{ id?: string, target?: string, detail?: string, reason?: string }>, environmentError?: string }} State
 */

/**
 * The reason a finding is carried for, or undefined when no rule knows it.
 * @param {State} state
 * @param {{ id?: string, target?: string }} finding
 * @returns {string | undefined}
 */
// @cpt-algo:cpt-site-algo-dev-run-verify-ui-baseline:p3
export function reasonFor(state, finding) {
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule
  const id = finding.id ?? '';
  const target = finding.target ?? '';
  const rule = REASONS.find((candidate) => candidate.id.test(id) && candidate.route.test(state.route) && candidate.target.test(target));
  if (!rule) return undefined;
  return typeof rule.reason === 'function' ? rule.reason(state.route) : rule.reason;
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-match-rule
}

/**
 * The baseline built from a runner report: the states with findings, every finding with its reason; the findings no rule knows and the states that produced no evidence are returned, not written.
 * @param {{ baseUrl?: string, themeKey?: string, states?: State[] }} report
 * @param {string} source - the report's path, recorded in the baseline
 */
export function buildBaseline(report, source) {
  const unknown = [];
  const environmentFailures = [];
  const states = [];
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-for-each-finding
  for (const state of report.states ?? []) {
    if (state.environmentError) {
      environmentFailures.push(`${state.route} ${state.theme} ${state.width}: ${state.environmentError}`);
      continue;
    }
    const findings = [];
    for (const finding of state.findings ?? []) {
      const reason = reasonFor(state, finding);
      // The checker words its details with long dashes, which the repository text policy refuses; the runner keys findings without the detail.
      const detail = finding.detail?.replace(/[\u2013\u2014]/g, '-');
      if (reason) findings.push({ ...finding, ...(detail === undefined ? {} : { detail }), reason });
      else unknown.push({ route: state.route, theme: state.theme, width: state.width, id: finding.id, target: finding.target });
    }
    if (findings.length > 0) states.push({ route: state.route, theme: state.theme, width: state.width, findings });
  }
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-for-each-finding
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-return-baseline
  const baseline = {
    tool: 'design-verify runner baseline (scripts/design-verify-baseline.mjs)',
    source,
    baseUrl: report.baseUrl,
    themeKey: report.themeKey,
    summary: { states: states.length, findings: states.reduce((sum, state) => sum + state.findings.length, 0) },
    states,
  };
  return { baseline, unknown, environmentFailures };
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-return-baseline
}

/**
 * Problems of a baseline: a carried finding without a reason, with a reason its rule no longer gives, or that no rule knows any more.
 * @param {{ states?: State[] }} baseline
 * @returns {string[]}
 */
export function checkBaseline(baseline) {
  const problems = [];
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-check-reasons
  for (const state of baseline.states ?? []) {
    for (const finding of state.findings ?? []) {
      const at = `${state.route} ${state.theme} ${state.width} ${finding.id} ${finding.target}`;
      const expected = reasonFor(state, finding);
      if (!finding.reason?.trim()) problems.push(`${at}: no reason`);
      else if (expected === undefined) problems.push(`${at}: no rule names a reason for it any more; rebuild the baseline`);
      else if (finding.reason !== expected) problems.push(`${at}: the reason is not the one its rule gives; rebuild the baseline`);
    }
  }
  return problems;
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-check-reasons
}

/**
 * A finding's target with its generated React ids (`#_r_1n_`, and the kit's `#base-ui-_r_8_`) read as any id: they number elements in render order, which differs between runs, so the same element carries another id in the next run.
 * @param {string | undefined} target
 * @returns {string}
 */
export function stableTarget(target) {
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-uncarried
  return (target ?? '').replace(/_r_[0-9a-z]+_/g, '_r_*_');
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-uncarried
}

/**
 * The findings of a run the baseline does not carry, matched on route, theme, width, rule and stable target, as many times as the baseline carries each.
 * @param {{ states?: State[] }} baseline
 * @param {{ states?: State[] }} report
 * @returns {Array<{ route: string, theme: string, width: number, id?: string, target?: string }>}
 */
export function uncarriedFindings(baseline, report) {
  // @cpt-begin:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-uncarried
  const key = (state, finding) => JSON.stringify([state.route, state.theme, state.width, finding.id ?? '', stableTarget(finding.target)]);
  const carried = new Map();
  for (const state of baseline.states ?? []) for (const finding of state.findings ?? []) carried.set(key(state, finding), (carried.get(key(state, finding)) ?? 0) + 1);
  const uncarried = [];
  for (const state of report.states ?? []) {
    for (const finding of state.findings ?? []) {
      const left = carried.get(key(state, finding)) ?? 0;
      if (left > 0) carried.set(key(state, finding), left - 1);
      else uncarried.push({ route: state.route, theme: state.theme, width: state.width, id: finding.id, target: finding.target });
    }
  }
  return uncarried;
  // @cpt-end:cpt-site-algo-dev-run-verify-ui-baseline:p3:inst-uncarried
}

// @cpt-flow:cpt-site-flow-dev-run-verify-ui-baseline:p3
if (isEntryPoint(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const baselinePath = path.join(root, 'scripts', 'design-verify-baseline.json');
  const [command, input] = process.argv.slice(2);
  if (command === 'build' && input) {
    // @cpt-begin:cpt-site-flow-dev-run-verify-ui-baseline:p3:inst-build-baseline
    const report = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
    const { baseline, unknown, environmentFailures } = buildBaseline(report, path.basename(input));
    if (environmentFailures.length > 0 || unknown.length > 0) {
      for (const line of environmentFailures) console.error(`verify:ui:baseline: no evidence: ${line}`);
      for (const finding of unknown) console.error(`verify:ui:baseline: no reason (fix it, or add a rule naming its G34 or kit-defect row): ${finding.route} ${finding.theme} ${finding.width} ${finding.id} ${finding.target}`);
      process.exit(1);
    }
    fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(`verify:ui:baseline: ${baseline.summary.findings} findings in ${baseline.summary.states} states, each with its reason`);
    // @cpt-end:cpt-site-flow-dev-run-verify-ui-baseline:p3:inst-build-baseline
  } else if (command === 'check') {
    // @cpt-begin:cpt-site-flow-dev-run-verify-ui-baseline:p3:inst-check-baseline
    if (!fs.existsSync(baselinePath)) {
      console.error('verify:ui:baseline: scripts/design-verify-baseline.json is missing');
      process.exit(1);
    }
    const problems = checkBaseline(JSON.parse(fs.readFileSync(baselinePath, 'utf8')));
    for (const problem of problems) console.error(`verify:ui:baseline: ${problem}`);
    if (problems.length > 0) process.exit(1);
    console.log('verify:ui:baseline: every carried finding names its reason');
    // @cpt-end:cpt-site-flow-dev-run-verify-ui-baseline:p3:inst-check-baseline
  } else {
    console.error('usage: node scripts/design-verify-baseline.mjs build <findings.json> | check');
    process.exit(2);
  }
}
