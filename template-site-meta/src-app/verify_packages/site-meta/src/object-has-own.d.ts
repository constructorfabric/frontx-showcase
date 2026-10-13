// `Object.hasOwn` (ES2022) for a compilation whose lib stops short of it: the shell's application type-check (`tsconfig.app.json`, lib ES2020) covers everything under `src-app/`, this package included. The package's own tsconfig has it from its ES2023 lib; the declarations merge.
interface ObjectConstructor {
  hasOwn(o: object, v: PropertyKey): boolean;
}
