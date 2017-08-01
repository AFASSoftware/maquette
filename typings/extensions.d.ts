declare interface Element {
  outerHTML: string;
}

declare namespace NodeJS {
  interface Global {
    requestAnimationFrame: any;
    cancelAnimationFrame: any;
  }
}