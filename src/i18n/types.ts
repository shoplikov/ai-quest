// Shared types for the interface dictionaries.

/** Plural forms keyed by Intl.PluralRules categories. English needs one/other,
 *  Russian needs one/few/many/other. */
export type PluralForms = {
  one: string;
  other: string;
  few?: string;
  many?: string;
  two?: string;
  zero?: string;
};

/** Turns literal string types into `string`, so the second language can have
 *  different text but must have exactly the same keys. */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { -readonly [K in keyof T]: Widen<T[K]> };

/** Every dotted path to a string leaf, e.g. "nav.map". */
export type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : T[K] extends PluralForms
        ? never
        : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
