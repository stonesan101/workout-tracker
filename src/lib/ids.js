let fallbackCounter = 0;

/** Unique id for exercises, sets, PBs and sessions. */
export function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    fallbackCounter += 1;
    return `id-${Date.now().toString(36)}-${fallbackCounter}-${Math.random().toString(36).slice(2, 8)}`;
}
