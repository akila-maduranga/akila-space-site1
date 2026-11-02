/**
 * Vanta.js ships as untyped UMD bundles — this makes the NET effect
 * importable from TypeScript. Other effects follow the same shape:
 * import("vanta/dist/vanta.globe.min"), …waves.min, …rings.min, …dots.min
 */
declare module "vanta/dist/vanta.net.min" {
  interface VantaEffectInstance {
    destroy(): void;
  }

  interface VantaConstructorOptions {
    /** host element the effect renders into */
    el: HTMLElement;
    /** three.js namespace — passed in explicitly so no globals are needed */
    THREE: unknown;
    [key: string]: unknown;
  }

  const NET: (options: VantaConstructorOptions) => VantaEffectInstance;
  export default NET;
}
