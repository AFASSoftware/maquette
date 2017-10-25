/* tslint:disable:no-namespace */

declare interface Element {
  outerHTML: string;
}

interface RequestIdleCallback {
  didTimeout: boolean;
  timeRemaining(): number;
}

interface RequestIdleOptions {
  timeout: number;
}

declare interface Window {
  requestIdleCallback(callback: (deadline: RequestIdleCallback) => any, options?: RequestIdleOptions): number;
}

declare namespace NodeJS {
  interface Global {
    requestAnimationFrame: any;
    cancelAnimationFrame: any;
    window?: Window;
  }
}
