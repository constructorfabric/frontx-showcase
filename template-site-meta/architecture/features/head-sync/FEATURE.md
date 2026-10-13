# Feature: Head Follows the Address

- [x] `p1` - **ID**: `cpt-template-site-meta-featstatus-head-sync`

<!-- toc -->

- [1. Feature Context](#1-feature-context)
  - [1.1 Overview](#11-overview)
  - [1.2 Purpose](#12-purpose)
  - [1.3 Actors](#13-actors)
  - [1.4 References](#14-references)
- [2. Actor Flows (CDSL)](#2-actor-flows-cdsl)
  - [Visit a Page](#visit-a-page)
- [3. Processes / Business Logic (CDSL)](#3-processes--business-logic-cdsl)
  - [Head Tags of a Page](#head-tags-of-a-page)
  - [Apply the Head of a Page](#apply-the-head-of-a-page)
- [4. States (CDSL)](#4-states-cdsl)
  - [No Feature-Owned State Machine](#no-feature-owned-state-machine)
- [5. Definitions of Done](#5-definitions-of-done)
  - [Head Follows the Address](#head-follows-the-address)
  - [Page Head in Place](#page-head-in-place)
- [6. Acceptance Criteria](#6-acceptance-criteria)

<!-- /toc -->

## 1. Feature Context

- [x] `p1` - `cpt-template-site-meta-feature-head-sync`

### 1.1 Overview

The browser runtime of the template: an inline script of the built document that reads the page map from its inert script node, resolves the page the current address shows and applies that page's head, at once and on every change of the realm's navigation history. It writes head nodes and the document title only, never the address.

### 1.2 Purpose

A static host answers every address with the same built document, so the per-page head can only be applied in the browser. head-sync gives a visitor's tab, bookmark and link preview, and every crawler that runs scripts, the page's own title, description, robots directive, canonical link and share tags, before the application boots and after every navigation, while the router stays the only writer of the address.

**Requirements**: `cpt-template-site-meta-fr-head-follows-address`, `cpt-template-site-meta-fr-head-only`, `cpt-template-site-meta-nfr-head-before-boot` (shared with the outputs feature: this feature runs from the inline map with no request of its own; the outputs feature places the script ahead of the module scripts)

**Principles**: `cpt-template-site-meta-principle-head-only`

### 1.3 Actors

| Actor | Role in Feature |
|-------|-----------------|
| `cpt-template-site-meta-actor-visitor` | Opens an address of the site and moves between pages; sees the head of the page shown |
| `cpt-template-site-meta-actor-crawler` | A crawler that runs scripts reads the per-page head head-sync applies |
| `cpt-template-site-meta-actor-frontx-router` | Writes every address change through the realm's navigation history, which head-sync follows |

### 1.4 References

- **PRD**: [PRD.md](../../PRD.md)
- **Design**: [DESIGN.md](../../DESIGN.md), component `cpt-template-site-meta-component-head-sync`, sequence `cpt-template-site-meta-seq-visit-page`
- **Decomposition**: [DECOMPOSITION.md](../../DECOMPOSITION.md)
- **Dependencies**: `cpt-template-site-meta-feature-page-map` (the page lookup and the page map types)
- **Code**: `template-site-meta/src-app/verify_packages/site-meta/src/head-sync.ts`, `template-site-meta/src-app/verify_packages/site-meta/src/head-sync-entry.ts`

## 2. Actor Flows (CDSL)

**Use cases**: `cpt-template-site-meta-usecase-visit-page`

### Visit a Page

- [x] `p1` - **ID**: `cpt-template-site-meta-flow-head-sync-visit-page`

**Actor**: `cpt-template-site-meta-actor-visitor`

**Success Scenarios**:
- The visitor opens a page's address; before the application boots the head is that page's.
- The visitor follows a link or uses Back; the router changes the address and the head becomes the new page's.
- The visitor opens the bare mount address; the head is the home page's while the shell opens the home screen.

**Error Scenarios**:
- The address names no page of the site: the fallback head (site name, home page canonical, not indexable) is applied.
- The document carries no page map node (a document the generator did not process): nothing runs and the static head stays.

**Steps**:
1. [x] - `p1` - The visitor opens an address; the browser runs the inline script, which looks up the page map node by its id - `inst-read-map-node`
2. [x] - `p1` - **IF** the node carries text, parse it as the page map and start head-sync; **ELSE** do nothing - `inst-if-map-present`
3. [x] - `p1` - Resolve the realm's navigation history, the singleton the framework router writes through - `inst-resolve-history`
4. [x] - `p1` - Read the path, query and hash of the history's current location - `inst-read-address`
5. [x] - `p1` - Resolve the page of the current address through the page map and apply its head, once at start - `inst-apply-now`
6. [x] - `p1` - Subscribe to the history so that every address change the router writes applies the new page's head; **RETURN** the release function of the subscription - `inst-follow-history`

## 3. Processes / Business Logic (CDSL)

### Head Tags of a Page

- [x] `p1` - **ID**: `cpt-template-site-meta-algo-head-sync-head-tags`

**Input**: The page map and one page.

**Output**: The head tags of the page in a stable order, shared with the static head block the outputs feature renders.

**Steps**:
1. [x] - `p1` - Take the page's share image, or the site's when the page has none - `inst-share-image`
2. [x] - `p1` - Take the document title as the share title on every page - `inst-share-title`
3. [x] - `p1` - List description, robots (`index, follow` or `noindex, follow`), canonical link, and Open Graph type, site name, title, description, address and locale - `inst-base-tags`
4. [x] - `p1` - **IF** there is a share image, add the Open Graph image, and its alternative text when the site has one - `inst-og-image`
5. [x] - `p1` - Add the Twitter card type, title and description - `inst-twitter-tags`
6. [x] - `p1` - **IF** there is a share image, add the Twitter image, and its alternative text when the site has one - `inst-twitter-image`
7. [x] - `p1` - **RETURN** the tags - `inst-return-tags`

### Apply the Head of a Page

- [x] `p1` - **ID**: `cpt-template-site-meta-algo-head-sync-apply-head`

**Input**: The document, the page map and the page the address shows.

**Output**: The document head equal to the page's head, with no duplicate tags.

**Steps**:
1. [x] - `p1` - Select a tag by its kind and key: a link by `rel`, a meta tag by `name` or `property` - `inst-tag-selector`
2. [x] - `p1` - Set the document title to the page's document title - `inst-set-title`
3. [x] - `p1` - **FOR EACH** head tag of the page - `inst-foreach-tag`
   1. [x] - `p1` - Find the tag already in the head - `inst-find-tag`
   2. [x] - `p1` - **IF** it is absent, create it with its key, mark it as owned by head-sync and append it to the head - `inst-if-absent-create`
   3. [x] - `p1` - Set its value (`href` of a link, `content` of a meta tag) - `inst-set-value`
4. [x] - `p1` - **FOR EACH** share image tag (Open Graph and Twitter image and their alternative texts) the page's tags lack, remove it from the head - `inst-remove-stale-image-tags`

## 4. States (CDSL)

### No Feature-Owned State Machine

Not applicable because head-sync keeps no state of its own: every application of the head is a function of the page map and the current address, and the only thing it holds is the history subscription, released by the function it returns.

## 5. Definitions of Done

### Head Follows the Address

- [x] `p1` - **ID**: `cpt-template-site-meta-dod-head-sync-follow-address`

The system **MUST** start from the inline page map node of the built document with no request of its own, read the address through the realm's navigation history, apply the head of the resolved page at start and on every history change, and never write the address or the history.

**Implements**:
- `cpt-template-site-meta-flow-head-sync-visit-page`

**Constraints**: `cpt-template-site-meta-constraint-single-static-document`

**Touches**:
- Component: `cpt-template-site-meta-component-head-sync`
- Entities: `SiteMetaMap`

### Page Head in Place

- [x] `p1` - **ID**: `cpt-template-site-meta-dod-head-sync-page-head`

The system **MUST** write the document title and the description, robots, canonical, Open Graph and Twitter tags of a page, with the document title as the share title, update the static tags in place, add a missing tag marked as owned, remove a share image tag the page lacks, and expose the tag list so the static head block uses the same one.

**Implements**:
- `cpt-template-site-meta-algo-head-sync-head-tags`
- `cpt-template-site-meta-algo-head-sync-apply-head`

**Touches**:
- Component: `cpt-template-site-meta-component-head-sync`
- Entities: `PageMeta`, `SiteMetaMap`

## 6. Acceptance Criteria

- [x] head-sync sets the title, canonical, robots and Open Graph tags of the current page, then follows a push to another page through the navigation history.
- [x] A page that is not indexable is marked `noindex`, and an address that names no page gets the fallback head.
- [x] At the bare shell root the home page's head is written and the address is left as it is.
- [x] The document title is the Open Graph and Twitter title on the home page and on an inner page.
- [x] The static head is updated in place; no second set of tags is added.
- [x] The bundled script inside the generated document applies the page of the address it is opened at and follows a navigation through the history API the framework router writes with.

**Test scenarios** (all in `template-site-meta/src-app/verify_packages/site-meta/src/`):
- `head-sync.test.ts`: "sets the head of the current page, then follows a push to another page"; "marks a page that is not indexable, and an address that names no page"; "writes the home page head at the bare shell root and never touches the address"; "updates the static head in place instead of adding a second set".
- `bundle.test.ts` (owned by the outputs feature): "applies the page of the address it is opened at"; "follows a navigation through the history API the framework router writes with".
