declare const brand: unique symbol;

/** URL/file-safe identifier derived from a component name, e.g. `Button/Primary` -> `button-primary`. */
export type Slug = string & { readonly [brand]: 'Slug' };

export const toSlug = (name: string): Slug =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') as Slug;
