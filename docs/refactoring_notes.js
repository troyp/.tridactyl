// ───────────────────────────────────────────────────────────────────────────────
// ╭──────────────────────────────────────────────────────────╮
// │ opts object vs parameter destructuring + default values  │
// ╰──────────────────────────────────────────────────────────╯

/* Example:
 * >> function f(a, { opt1: "o1", opt2: "o2", }={}) { return [a, opt1, opt2]; }
 * differences:
 *   * Default values are applied only if undefined (whereas parseOpts() has falsy and nullish defaults).
 *     - if falsy and nullish defaults are required they can be handled manually:
 *       >> opt1 ||= "defaultopt1";
 *       >> opt2 ??= "defaultopt2";
 *   * The options object itself has to be extracted from the `arguments` object, and only contains actual
 *     passed arguments, not defaults
 *     - this may be desirable, if not any other options must be included manually
 *
 *
 *
 *
 *
 *
 *
 */
