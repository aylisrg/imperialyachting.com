/**
 * Named partners for /partners. Empty on purpose: a partner is listed only
 * once they have agreed to be named (issue #46: no invented partners). Until then
 * the page leaves the partners block out entirely.
 */
export interface NamedPartner {
  name: string;
  kind: string;
  url?: string;
}

export const NAMED_PARTNERS: readonly NamedPartner[] = [];
