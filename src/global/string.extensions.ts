
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface String {
  toCamelCase(): string;
  toPascalCase(): string;
  toHyphenCase(): string;
}

String.prototype.toHyphenCase = function () {
  return this.valueOf().toCamelCase().replace(/[A-Z]/g, (match) => '-' + match.toLowerCase());
};

String.prototype.toCamelCase = function() {
  return this.valueOf().charAt(0).toLowerCase() + this.valueOf().slice(1);
};

String.prototype.toPascalCase = function() {
  return this.valueOf().charAt(0).toUpperCase() + this.valueOf().slice(1);
};