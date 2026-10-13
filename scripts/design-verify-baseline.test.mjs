import { describe, expect, it } from 'vitest';
import { buildBaseline, checkBaseline, reasonFor, stableTarget, uncarriedFindings } from './design-verify-baseline.mjs';

const state = (route, findings, theme = 'light', width = 1440) => ({ route, theme, width, findings });

describe('reasonFor', () => {
  it('names the checker false finding (G34) or the kit defect behind a known finding', () => {
    expect(reasonFor(state('/?screen=libs', []), { id: 'card-content-overflow', target: 'div._codeBlock_115nl_8._sizeDefault_115nl_76' })).toMatch(/^G34 false finding: .*CodeBlock/);
    expect(reasonFor(state('/?screen=inbox-contacts', []), { id: 'small-control-text', target: 'span._sortButtonInner_c72nh_85' })).toMatch(/^Kit defect: .*DataTable/);
    expect(reasonFor(state('/?screen=catalogue;route=components/badge', []), { id: 'axe/color-contrast', target: 'div[data-theme="light"][dir="ltr"],#base-ui-_r_2_' })).toMatch(/TabsTrigger/);
    expect(reasonFor(state('/?screen=catalogue;route=components/field', []), { id: 'axe/label', target: 'div,#base-ui-_r_9_' })).toMatch(/^Kit example defect: .*field example/);
  });

  it('names nothing for a finding no rule knows: it is a defect to fix, not a baseline entry', () => {
    expect(reasonFor(state('/?screen=home', []), { id: 'axe/color-contrast', target: 'p._lead_abcde_3' })).toBeUndefined();
    expect(reasonFor(state('/?screen=home', []), { id: 'card-content-overflow', target: 'div._card_136no_6._sizeDefault_136no_82' })).toBeUndefined();
  });
});

describe('buildBaseline', () => {
  it('keeps the states with findings, each finding with its reason, and lists the findings no rule knows', () => {
    const report = {
      baseUrl: 'http://localhost:5173/',
      themeKey: 'frontx:studio:theme',
      states: [
        state('/?screen=docs', []),
        state('/?screen=libs', [{ id: 'card-content-overflow', target: 'div._codeBlock_115nl_8._sizeDefault_115nl_76', detail: 'scrollWidth 4087' }]),
        state('/?screen=home', [{ id: 'axe/color-contrast', target: 'p._lead_abcde_3' }]),
        { route: '/?screen=x', theme: 'light', width: 390, environmentError: 'timeout' },
      ],
    };
    const { baseline, unknown, environmentFailures } = buildBaseline(report, 'findings.json');
    expect(baseline.states).toHaveLength(1);
    expect(baseline.states[0].findings[0]).toMatchObject({ id: 'card-content-overflow', reason: expect.stringMatching(/^G34/) });
    expect(baseline.source).toBe('findings.json');
    expect(unknown).toEqual([{ route: '/?screen=home', theme: 'light', width: 1440, id: 'axe/color-contrast', target: 'p._lead_abcde_3' }]);
    expect(environmentFailures).toEqual(['/?screen=x light 390: timeout']);
  });

  it('writes the checker\'s detail with the short hyphen, since the repository text policy refuses the long dashes the checker words it with', () => {
    const { baseline } = buildBaseline({ states: [state('/?screen=libs', [{ id: 'card-content-overflow', target: 'div._codeBlock_115nl_8', detail: 'overflows by 4px \u2014 wide content scrolls \u2013 or wraps' }])] }, 'f.json');
    expect(baseline.states[0].findings[0].detail).toBe('overflows by 4px - wide content scrolls - or wraps');
    expect(JSON.stringify(baseline)).not.toMatch(/[\u2013\u2014]/);
  });
});

describe('checkBaseline', () => {
  it('accepts a baseline whose every finding carries the reason its rule gives', () => {
    const { baseline } = buildBaseline({ states: [state('/?screen=libs', [{ id: 'card-content-overflow', target: 'div._codeBlock_115nl_8' }])] }, 'f.json');
    expect(checkBaseline(baseline)).toEqual([]);
  });

  it('fails a finding without a reason, with a reason no rule gives, or that no rule knows any more', () => {
    const baseline = {
      states: [
        state('/?screen=libs', [
          { id: 'card-content-overflow', target: 'div._codeBlock_115nl_8' },
          { id: 'card-content-overflow', target: 'div._codeBlock_115nl_8', reason: 'looks fine' },
          { id: 'axe/color-contrast', target: 'p._lead_abcde_3', reason: 'G34 false finding: something' },
        ]),
      ],
    };
    expect(checkBaseline(baseline)).toEqual([
      '/?screen=libs light 1440 card-content-overflow div._codeBlock_115nl_8: no reason',
      '/?screen=libs light 1440 card-content-overflow div._codeBlock_115nl_8: the reason is not the one its rule gives; rebuild the baseline',
      '/?screen=libs light 1440 axe/color-contrast p._lead_abcde_3: no rule names a reason for it any more; rebuild the baseline',
    ]);
  });
});

describe('uncarriedFindings', () => {
  const carried = { states: [state('/?screen=catalogue;route=components/select', [
    { id: 'control-height-mismatch', target: 'button#base-ui-_r_h_._trigger_163c9_6 vs button#base-ui-_r_k_._trigger_163c9_6', reason: 'G34' },
    { id: 'axe/color-contrast', target: 'div,#base-ui-_r_8_', reason: 'Kit' },
  ])] };

  it('reads a generated React id as any id, since React numbers elements in render order, which differs between runs', () => {
    expect(stableTarget('div[data-theme="light"],#base-ui-_r_1g_')).toBe('div[data-theme="light"],#base-ui-_r_*_');
    expect(stableTarget('div#_r_1n_._group_10ue0_9')).toBe('div#_r_*_._group_10ue0_9');
    const report = { states: [state('/?screen=catalogue;route=components/select', [
      { id: 'control-height-mismatch', target: 'button#base-ui-_r_2b_._trigger_163c9_6 vs button#base-ui-_r_2f_._trigger_163c9_6' },
      { id: 'axe/color-contrast', target: 'div,#base-ui-_r_1i_' },
    ])] };
    expect(uncarriedFindings(carried, report)).toEqual([]);
  });

  it('returns a finding the baseline does not carry, and one occurring more often than it carries', () => {
    const report = { states: [state('/?screen=catalogue;route=components/select', [
      { id: 'axe/color-contrast', target: 'div,#base-ui-_r_1i_' },
      { id: 'axe/color-contrast', target: 'div,#base-ui-_r_2i_' },
      { id: 'card-content-overflow', target: 'div._card_136no_6' },
    ])] };
    expect(uncarriedFindings(carried, report)).toEqual([
      { route: '/?screen=catalogue;route=components/select', theme: 'light', width: 1440, id: 'axe/color-contrast', target: 'div,#base-ui-_r_2i_' },
      { route: '/?screen=catalogue;route=components/select', theme: 'light', width: 1440, id: 'card-content-overflow', target: 'div._card_136no_6' },
    ]);
  });
});
