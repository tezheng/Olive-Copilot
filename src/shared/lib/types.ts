/**
 * Determines if a given value is an object.
 *
 * This function checks if the value is an object:
 * - The value is not `null`.
 * - The `typeof` the value is 'object'.
 *
 * Note that this function will return `true` for arrays and functions as well,
 * as they are also objects in JavaScript.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is an object (including arrays and functions),
 *          otherwise `false`.
 *
 * @example
 * ```typescript
 * isObject(null);        // false
 * isObject({});          // true
 * isObject([]);          // true
 * isObject(() => {});    // true
 * isObject(42);          // false
 * isObject('text');      // false
 * isObject(new Date());  // true
 * ```
 */
export function isObject(value: unknown): boolean {
  return value !== null && typeof value === "object";
}
