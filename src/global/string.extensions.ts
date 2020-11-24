
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface String {
  toCamelCase(): string;
  toPascalCase(): string;
  toHyphenCase(): string;
}

String.prototype.toHyphenCase = function () {
  return this.valueOf().toCamelCase().replace(/[A-Z]+/g, (match) => {
    const word = match.toLowerCase();
    const part1 = word.slice(0, word.length - 1);
    const part2 = word.slice(word.length - 1);
    return `${part1}-${part2}`;
  });
};

String.prototype.toCamelCase = function() {
  return this.valueOf().charAt(0).toLowerCase() + this.valueOf().slice(1);
};

String.prototype.toPascalCase = function() {
  return `${this.valueOf()}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w+)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, 'g'), '')
    .replace(new RegExp(/\w/), s => s.toUpperCase());
};