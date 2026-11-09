export const WEIGHT_STEP = 0.5;

/**
 * Clean up a weight while it is being typed. Keeps a trailing "." so "2.5"
 * can be entered one key at a time; rounding happens later, on blur.
 */
export function sanitizeDecimalInput(raw) {
    const cleaned = String(raw ?? "").replace(/,/g, ".").replace(/[^\d.]/g, "");
    const [whole, ...rest] = cleaned.split(".");
    return rest.length === 0 ? whole : `${whole}.${rest.join("")}`;
}

/** Digits only, for reps. */
export function sanitizeIntegerInput(raw) {
    return String(raw ?? "").replace(/\D/g, "");
}

/** Round a finished weight to the nearest step, e.g. "2.3" -> "2.5". */
export function roundWeight(value, step = WEIGHT_STEP) {
    const number = Number.parseFloat(value);
    if (Number.isNaN(number)) return "";
    const rounded = Math.max(0, Math.round(number / step) * step);
    return String(Number(rounded.toFixed(2)));
}
