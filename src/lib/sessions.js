import {createId} from "./ids.js";
import {createSet, getCompletedSets} from "./exercises.js";
import {
    appendPersonalBest,
    getBestSetForPB,
    getCurrentPersonalBest,
    getPersonalBestWeight,
    isPBBetter,
} from "./personalBests.js";

export function getSessionHistory(exercise) {
    const sessions = Array.isArray(exercise.sessions) ? exercise.sessions : [];
    return sessions.slice().sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
}

export function getLastSession(exercise) {
    return getSessionHistory(exercise)[0] ?? null;
}

export function removeSession(exercise, sessionId) {
    return {...exercise, sessions: (exercise.sessions || []).filter((s) => s.id !== sessionId)};
}

/**
 * Finish an exercise for today: save every completed set as a session,
 * record a PB if the best set beats the current one, and clear the sets
 * (keeping the same number of empty rows ready for next time).
 *
 * Returns the updated exercise and a summary for on-screen feedback.
 */
export function finishExercise(exercise, now = new Date()) {
    const bestSet = getBestSetForPB(exercise);
    if (!bestSet) return {exercise, result: {saved: false, isNewPB: false}};

    const completedSets = getCompletedSets(exercise).map(({weight, reps}) => ({weight, reps}));
    const finishedAt = now.toISOString();

    const previousPB = getCurrentPersonalBest(exercise, "e1RM");
    const candidate = {weight: Number(bestSet.weight), value: bestSet.oneRepMax};
    const isNewPB = !previousPB || isPBBetter(candidate, {
        weight: getPersonalBestWeight(previousPB),
        value: previousPB.value,
    });

    let next = exercise;
    if (isNewPB) {
        next = appendPersonalBest(next, {
            type: "e1RM",
            value: bestSet.oneRepMax,
            achievedAt: finishedAt,
            source: {sets: completedSets, bestSet: {weight: bestSet.weight, reps: bestSet.reps}},
        });
    }

    const session = {
        id: createId(),
        finishedAt,
        baseWeight: exercise.baseWeight,
        sets: completedSets,
        bestSet: {weight: bestSet.weight, reps: bestSet.reps},
        e1RM: bestSet.oneRepMax,
        isPB: isNewPB,
    };

    next = {
        ...next,
        sessions: [...(next.sessions || []), session],
        sets: completedSets.map(() => createSet()),
    };

    return {exercise: next, result: {saved: true, isNewPB, session, previousPB}};
}
