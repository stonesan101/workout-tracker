import {describe, expect, it} from "vitest";
import {createExercise} from "./exercises.js";
import {finishExercise, getSessionHistory, getLastSession, removeSession} from "./sessions.js";
import {getCurrentPersonalBest} from "./personalBests.js";

const day1 = new Date("2026-11-01T10:00:00.000Z");
const day2 = new Date("2026-11-03T10:00:00.000Z");

function withSets(ex, sets) {
    return {...ex, sets: sets.map(([weight, reps], i) => ({id: `s${i}`, weight, reps}))};
}

describe("finishExercise", () => {
    it("saves the whole session, records a first PB and clears the sets", () => {
        const ex = withSets(createExercise("Bench"), [["100", "5"], ["105", "3"], ["", ""]]);
        const {exercise, result} = finishExercise(ex, day1);

        expect(result.saved).toBe(true);
        expect(result.isNewPB).toBe(true);
        expect(exercise.sessions).toHaveLength(1);
        expect(exercise.sessions[0]).toMatchObject({
            finishedAt: day1.toISOString(),
            sets: [{weight: "100", reps: "5"}, {weight: "105", reps: "3"}],
            bestSet: {weight: "105", reps: "3"},
            isPB: true,
        });
        expect(exercise.sessions[0].id).toBeTruthy();
        expect(getCurrentPersonalBest(exercise, "e1RM").source.bestSet.weight).toBe("105");

        // Sets are cleared, keeping the same number of empty rows ready for next time.
        expect(exercise.sets).toHaveLength(2);
        expect(exercise.sets.every((s) => s.weight === "" && s.reps === "")).toBe(true);
    });

    it("saves a session that isn't a PB without adding a PB", () => {
        let ex = withSets(createExercise("Bench"), [["100", "5"]]);
        ex = finishExercise(ex, day1).exercise;
        ex = withSets(ex, [["90", "8"]]);
        const {exercise, result} = finishExercise(ex, day2);

        expect(result).toMatchObject({saved: true, isNewPB: false});
        expect(exercise.sessions).toHaveLength(2);
        expect(exercise.personalBests).toHaveLength(1);
    });

    it("does nothing when no set is complete", () => {
        const ex = withSets(createExercise("Bench"), [["100", ""]]);
        const {exercise, result} = finishExercise(ex, day1);
        expect(result.saved).toBe(false);
        expect(exercise).toBe(ex);
    });
});

describe("session history", () => {
    it("lists newest first and finds the last session", () => {
        let ex = withSets(createExercise("Bench"), [["100", "5"]]);
        ex = finishExercise(ex, day1).exercise;
        ex = withSets(ex, [["90", "8"]]);
        ex = finishExercise(ex, day2).exercise;

        expect(getSessionHistory(ex).map((s) => s.finishedAt)).toEqual([day2.toISOString(), day1.toISOString()]);
        expect(getLastSession(ex).finishedAt).toBe(day2.toISOString());
    });

    it("removes a session by id", () => {
        let ex = withSets(createExercise("Bench"), [["100", "5"]]);
        ex = finishExercise(ex, day1).exercise;
        const [session] = ex.sessions;
        expect(removeSession(ex, session.id).sessions).toEqual([]);
        expect(getLastSession(removeSession(ex, session.id))).toBeNull();
    });
});
