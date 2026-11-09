import {getCompletedSets} from "./exercises.js";
import {getCurrentPersonalBest} from "./personalBests.js";
import {roundWeight} from "./numbers.js";

/** A 5-rep weight is about 86% of a 1RM. */
export const FIVE_REP_FACTOR = 0.86;

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
        recommendedFiveRep: oneRepMax > 0 ? oneRepMax * FIVE_REP_FACTOR - base : null,
    };
}

/**
 * Estimated 5-rep max from the current PB's e1RM, net of base weight and
 * rounded to a loadable 0.5. Returns a display string, or null with no PB.
 */
export function getPersonalBestFiveRepMax(exercise) {
    const pb = getCurrentPersonalBest(exercise, "e1RM");
    if (!pb) return null;
    const base = Number(exercise.baseWeight || 0);
    return roundWeight(pb.value * FIVE_REP_FACTOR - base);
}
