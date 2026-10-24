const NUMBERS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

export function routeCountTitle(n: number): string {
  const word = NUMBERS[n] ?? String(n);
  return `${word} ${n === 1 ? "route" : "routes"}.`;
}
