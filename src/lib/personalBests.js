import {createId} from "./ids.js";
import {getCompletedSets} from "./exercises.js";

export function createPersonalBest({type, value, achievedAt, source}) {
    return {id: createId(), type, value, achievedAt, source};
}

export function getPersonalBestWeight(entry) {
    return Number(entry?.source?.bestSet?.weight ?? 0);
}

// e1RM values are floats, so the same set can come out a hair different.
const E1RM_TOLERANCE = 1e-6;

/** Heavier weight wins; e1RM breaks a tie. Equal is not better. */
export function isPBBetter(a, b) {
    if (a.weight !== b.weight) return a.weight > b.weight;
    return a.value - b.value > E1RM_TOLERANCE;
}

export function getPersonalBestHistory(exercise, type) {
    const history = Array.isArray(exercise.personalBests) ? exercise.personalBests : [];
    return type ? history.filter((entry) => entry.type === type) : history;
}

export function getCurrentPersonalBest(exercise, type) {
    const history = getPersonalBestHistory(exercise, type);
    if (history.length === 0) return null;
    return history.reduce((best, entry) => {
        const entryCandidate = {weight: getPersonalBestWeight(entry), value: entry.value};
        const bestCandidate = {weight: getPersonalBestWeight(best), value: best.value};
        return isPBBetter(entryCandidate, bestCandidate) ? entry : best;
    }, history[0]);
}

export function appendPersonalBest(exercise, candidate) {
    return {
        ...exercise,
        personalBests: [...getPersonalBestHistory(exercise), createPersonalBest(candidate)],
    };
}

export function removePersonalBest(exercise, personalBestId) {
    return {
        ...exercise,
        personalBests: getPersonalBestHistory(exercise).filter((entry) => entry.id !== personalBestId),
    };
}

/** The set that counts toward a PB: heaviest (with base weight), e1RM as tiebreak. */
export function getBestSetForPB(exercise) {
    const base = Number(exercise.baseWeight || 0);
    return getCompletedSets(exercise).reduce((best, current) => {
        const effectiveWeight = Number(current.weight) + base;
        const oneRepMax = effectiveWeight * (1 + Number(current.reps) / 30);
        const candidate = {...current, effectiveWeight, oneRepMax};
        if (!best) return candidate;
        if (candidate.effectiveWeight !== best.effectiveWeight) {
            return candidate.effectiveWeight > best.effectiveWeight ? candidate : best;
        }
        return candidate.oneRepMax > best.oneRepMax ? candidate : best;
    }, null);
}
