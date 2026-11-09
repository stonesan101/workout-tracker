import {getCompletedSets} from "./exercises.js";

/** Epley estimate. */
export function estimateOneRepMax(weight, reps) {
    return weight * (1 + reps / 30);
}

/**
 * Session stats, reported net of the machine's base weight so they match
 * what gets typed into the weight column.
 */
export function getMachineAdjustedMetrics(exercise) {
    const base = Number(exercise.baseWeight || 0);
    const completedSets = getCompletedSets(exercise);
    if (completedSets.length === 0) return {effort: null, oneRepMax: null, recommendedFiveRep: null};

    const totalVolume = completedSets.reduce((sum, s) => sum + (Number(s.weight) + base) * Number(s.reps), 0);
    const oneRepMax = Math.max(...completedSets.map((s) => estimateOneRepMax(Number(s.weight) + base, Number(s.reps))));

    return {
        effort: (totalVolume / completedSets.length).toFixed(1),
        oneRepMax: oneRepMax > 0 ? oneRepMax - base : null,
        recommendedFiveRep: oneRepMax > 0 ? oneRepMax * 0.86 - base : null,
    };
}
