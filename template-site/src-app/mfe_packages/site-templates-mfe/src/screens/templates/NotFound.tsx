import { Link } from '@gears-frontx/routing-tanstack';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { useBridge } from '../../shared/ScreenFrame';
import { PageNotFound } from '@site-shared/content/PageStates';
import { Link as TextLink } from '@gears-frontx/kit-candidates';

// Hoisted to module level: a new map per render would reload the translations on every render.
const languageModules = import.meta.glob('./i18n/*.json') as Record<string, () => Promise<{ default: Record<string, string> }>>;

/** Rendered for a path inside the templates screen that names no page; it links back to the screen's root inside the screen. */
// @cpt-flow:cpt-template-site-flow-templates-screen-unknown-path:p2
// @cpt-dod:cpt-template-site-dod-templates-screen-registration:p1
export function NotFound() {
  // @cpt-begin:cpt-template-site-flow-templates-screen-unknown-path:p2:inst-load-strings
  const { t, loading } = useScreenTranslations(languageModules, useBridge());
  if (loading) return null;
  // @cpt-end:cpt-template-site-flow-templates-screen-unknown-path:p2:inst-load-strings
  // @cpt-begin:cpt-template-site-flow-templates-screen-unknown-path:p2:inst-return-not-found
  return (
    <PageNotFound
      title={t('not_found_title')}
      text={t('not_found_body')}
      link={
        <TextLink render={<Link to="/" />}>{t('not_found_link')}</TextLink>
      }
    />
  );
  // @cpt-end:cpt-template-site-flow-templates-screen-unknown-path:p2:inst-return-not-found
}
