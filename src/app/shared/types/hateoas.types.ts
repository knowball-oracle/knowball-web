export interface HateoasLinks {
  self: { href: string };
  [rel: string]: { href: string };
}

export type HateoasEntity<T> = T & {
  _links?: HateoasLinks;
};

export interface HateoasCollection<T> {
  _embedded: { [key: string]: HateoasEntity<T>[] };
  _links?: HateoasLinks;
}
