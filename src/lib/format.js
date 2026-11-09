export function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {month: "short", day: "numeric", year: "numeric"});
}

export function formatSet(set) {
    return `${set.reps} @ ${set.weight}`;
}

export function pluralize(count, word) {
    return `${count} ${word}${count === 1 ? "" : "s"}`;
}
