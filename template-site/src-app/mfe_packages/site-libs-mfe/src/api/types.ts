/** One FrontX package the site is built with. */
export interface Library {
  package: string;
  version: string;
  description: string;
  /** The package's source at the commit its version was published from. */
  sourceUrl: string;
  sourceCommit: string;
}

/** A workspace package that arrives with template-shell. */
export interface ShellPackage {
  package: string;
  version: string;
  description: string;
}

/** The data the libs pages fill their texts from (`src/data/libraries.generated.json`): the library list, the shell's workspace packages and the variables the technical summaries use. */
export interface GetLibrariesResponse {
  vars: Record<string, string>;
  libraries: Library[];
  shellPackages: ShellPackage[];
}
