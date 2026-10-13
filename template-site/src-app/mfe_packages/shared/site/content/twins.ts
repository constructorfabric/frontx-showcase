// @cpt-algo:cpt-template-site-algo-content-model-twin-paths:p1
// @cpt-dod:cpt-template-site-dod-content-model-twin-links:p2
/**
 * Where the plain-text twin of an outline page is published: `/<screen token>/<route>.md`, and `/<screen token>/index.md` for the screen root. The repository's metadata tooling writes the files at the same paths. The path is from the site root; a link writes it relative to the shell's document with `documentHref`.
 * @param screen - the screen's route token
 * @param route - the page's route inside the screen
 */
export function twinPath(screen: string, route: string): string {
  // @cpt-begin:cpt-template-site-algo-content-model-twin-paths:p1:inst-page-twin
  return route === '/' ? `/${screen}/index.md` : `/${screen}${route}.md`;
  // @cpt-end:cpt-template-site-algo-content-model-twin-paths:p1:inst-page-twin
}

/**
 * Where the plain-text copy of an agent task on an outline page is published: next to the page's twin, named after the task (`/docs/first-change/agent-task.md`). The metadata tooling writes the file at the same path.
 * @param screen - the screen's route token
 * @param route - the page's route inside the screen
 * @param id - the task block's id
 */
export function taskTwinPath(screen: string, route: string, id: string): string {
  // @cpt-begin:cpt-template-site-algo-content-model-twin-paths:p1:inst-task-twin-path
  return route === '/' ? `/${screen}/${id}.md` : `/${screen}${route}/${id}.md`;
  // @cpt-end:cpt-template-site-algo-content-model-twin-paths:p1:inst-task-twin-path
}

/**
 * A site-root path of a plain-text file (`/docs/index.md`) as a link relative to the shell's document (`./docs/index.md`). The site is served from whatever folder it was deployed to, and its document always sits in that folder, so a document-relative link reaches the same file at any mount point; a link inside a screen's shadow root resolves against the shell's document too, its node document.
 * @param sitePath - a path from the site root, starting with `/`
 */
export function documentHref(sitePath: string): string {
  // @cpt-begin:cpt-template-site-algo-content-model-twin-paths:p1:inst-document-relative
  if (!sitePath.startsWith('/')) throw new Error(`not a site-root path: ${sitePath}`);
  return `.${sitePath}`;
  // @cpt-end:cpt-template-site-algo-content-model-twin-paths:p1:inst-document-relative
}
