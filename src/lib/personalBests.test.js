import {describe, expect, it} from "vitest";
import {
    appendPersonalBest,
    getBestSetForPB,
    getCurrentPersonalBest,
    getPersonalBestHistory,
    isPBBetter,
    removePersonalBest,
} from "./personalBests.js";

function pb(weight, reps, value, achievedAt = "2026-10-01T00:00:00.000Z") {
    return {type: "e1RM", value, achievedAt, source: {sets: [], bestSet: {weight, reps}}};
}

describe("isPBBetter", () => {
    it("prefers heavier weight, then higher e1RM", () => {
        expect(isPBBetter({weight: 100, value: 1}, {weight: 95, value: 999})).toBe(true);
        expect(isPBBetter({weight: 100, value: 120}, {weight: 100, value: 110})).toBe(true);
        expect(isPBBetter({weight: 100, value: 110}, {weight: 100, value: 120})).toBe(false);
    });

    it("does not count the same set again as a new PB (floating-point noise)", () => {
        const sameSet = 195 * (1 + 3 / 30);
        expect(isPBBetter({weight: 195, value: sameSet}, {weight: 195, value: 214.5})).toBe(false);
        expect(isPBBetter({weight: 195, value: 214.5}, {weight: 195, value: sameSet})).toBe(false);
    });
});

describe("appendPersonalBest / getCurrentPersonalBest", () => {
    it("gives each PB an id and picks the best one", () => {
        let ex = {personalBests: []};
        ex = appendPersonalBest(ex, pb("100", "5", 116.7));
        ex = appendPersonalBest(ex, pb("110", "3", 121));
        expect(ex.personalBests.every((entry) => entry.id)).toBe(true);
        expect(getCurrentPersonalBest(ex, "e1RM").source.bestSet.weight).toBe("110");
    });

    it("returns null when there is no history", () => {
        expect(getCurrentPersonalBest({personalBests: []}, "e1RM")).toBeNull();
        expect(getPersonalBestHistory({})).toEqual([]);
    });
});

describe("removePersonalBest", () => {
    it("removes one PB by id and the current PB falls back to the next best", () => {
        let ex = {personalBests: []};
        ex = appendPersonalBest(ex, pb("100", "5", 116.7));
        ex = appendPersonalBest(ex, pb("2250", "5", 2625)); // the typo
        const typo = getCurrentPersonalBest(ex, "e1RM");
        expect(typo.source.bestSet.weight).toBe("2250");

        const fixed = removePersonalBest(ex, typo.id);
        expect(fixed.personalBests).toHaveLength(1);
        expect(getCurrentPersonalBest(fixed, "e1RM").source.bestSet.weight).toBe("100");
    });
});

describe("getBestSetForPB", () => {
    it("picks the heaviest completed set including the base weight", () => {
        const ex = {baseWeight: 20, sets: [{weight: "100", reps: "10"}, {weight: "110", reps: "2"}, {weight: "", reps: "8"}]};
        const best = getBestSetForPB(ex);
        expect(best).toMatchObject({weight: "110", reps: "2", effectiveWeight: 130});
        expect(best.oneRepMax).toBeCloseTo(130 * (1 + 2 / 30));
    });

    it("returns null with no completed sets", () => {
        expect(getBestSetForPB({sets: [{weight: "", reps: ""}]})).toBeNull();
    });
});
