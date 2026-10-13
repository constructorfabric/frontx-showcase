import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface CatalogueSearch {
  /** The search as typed. */
  search: string;
  setSearch: (search: string) => void;
  /** The trimmed, lower-cased search; empty when nothing is searched. */
  query: string;
}

const CatalogueSearchContext = createContext<CatalogueSearch | null>(null);

/** One search for the whole screen: the navigation's field and the index's field show and change the same text. */
// @cpt-flow:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1
export function CatalogueSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  // @cpt-begin:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-filter-components
  const value = useMemo(() => ({ search, setSearch, query: search.trim().toLowerCase() }), [search]);
  // @cpt-end:cpt-template-catalogue-flow-catalogue-screen-browse-index:p1:inst-filter-components
  return <CatalogueSearchContext.Provider value={value}>{children}</CatalogueSearchContext.Provider>;
}

/** The screen's search, for components inside `CatalogueSearchProvider`. */
export function useCatalogueSearch(): CatalogueSearch {
  const search = useContext(CatalogueSearchContext);
  if (!search) throw new Error('useCatalogueSearch must be used inside CatalogueSearchProvider');
  return search;
}
