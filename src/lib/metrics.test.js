import {describe, expect, it} from "vitest";
import {getMachineAdjustedMetrics, getPersonalBestFiveRepMax} from "./metrics.js";

describe("getMachineAdjustedMetrics", () => {
    it("is empty with no completed sets", () => {
        expect(getMachineAdjustedMetrics({sets: []})).toEqual({effort: null, oneRepMax: null, recommendedFiveRep: null});
    });

    it("reports average volume, 1RM and a five-rep target net of base weight", () => {
        const metrics = getMachineAdjustedMetrics({baseWeight: 0, sets: [{weight: "100", reps: "5"}, {weight: "90", reps: "10"}]});
        expect(metrics.effort).toBe("700.0");
        expect(metrics.oneRepMax).toBeCloseTo(120);
        expect(metrics.recommendedFiveRep).toBeCloseTo(120 * 0.86);
    });
});

describe("getPersonalBestFiveRepMax", () => {
    function withPB(value, baseWeight = "") {
        return {baseWeight, personalBests: [{id: "a", type: "e1RM", value, achievedAt: "2026-10-01", source: {bestSet: {weight: "195", reps: "3"}}}]};
    }

    it("estimates the 5-rep weight from the PB's e1RM, rounded to 0.5", () => {
        expect(getPersonalBestFiveRepMax(withPB(214.5))).toBe("184.5"); // 214.5 × 0.86 = 184.47
    });

    it("reports it net of the machine's base weight", () => {
        expect(getPersonalBestFiveRepMax(withPB(214.5, "20"))).toBe("164.5");
    });

    it("is null with no PB", () => {
        expect(getPersonalBestFiveRepMax({personalBests: []})).toBeNull();
    });
});
