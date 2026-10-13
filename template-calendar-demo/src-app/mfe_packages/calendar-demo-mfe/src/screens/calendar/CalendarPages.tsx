import { createElement } from 'react';
import { CalendarClock } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia } from '@gears-frontx/ui-kit';
import { EmptyTitle, Link } from '@gears-frontx/kit-candidates';
import { Link as RouterLink } from '@gears-frontx/routing-tanstack';
import { useBridge } from '../../shared/ScreenFrame';
import { useScreenTranslations } from '../../shared/useScreenTranslations';

// @cpt-dod:cpt-template-calendar-demo-dod-calendar-placeholder-content:p1
// @cpt-flow:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1
// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

function useCalendarText() {
  return useScreenTranslations(languageModules, useBridge());
}

/** `/`: the screen's one page, a notice that the calendar demo is in development. */
export function CalendarPlaceholder() {
  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-wait-strings
  const { t, loading } = useCalendarText();
  if (loading) return null;
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-wait-strings
  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-placeholder
  return (
    <Empty data-testid="calendar-page">
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true">
          <CalendarClock />
        </EmptyMedia>
        <EmptyTitle render={createElement('h1')}>{t('placeholder_title')}</EmptyTitle>
        <EmptyDescription>{t('placeholder_body')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-placeholder
}

/** Any other path inside the screen. */
export function CalendarNotFound() {
  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-wait-strings
  const { t, loading } = useCalendarText();
  if (loading) return null;
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-wait-strings
  // @cpt-begin:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-not-found
  return (
    <Empty data-testid="screen-not-found">
      <EmptyHeader>
        <EmptyTitle render={createElement('h1')}>{t('not_found_title')}</EmptyTitle>
        <EmptyDescription>{t('not_found_body')}</EmptyDescription>
      </EmptyHeader>
      <Link render={createElement(RouterLink, { to: '/' })}>{t('not_found_link')}</Link>
    </Empty>
  );
  // @cpt-end:cpt-template-calendar-demo-flow-calendar-placeholder-open-screen:p1:inst-render-not-found
}
