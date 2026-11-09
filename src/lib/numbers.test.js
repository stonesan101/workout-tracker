import {describe, expect, it} from "vitest";
import {roundWeight, sanitizeDecimalInput, sanitizeIntegerInput} from "./numbers.js";

describe("sanitizeDecimalInput", () => {
    it("keeps a trailing decimal point so 2.5 can be typed one key at a time", () => {
        expect(sanitizeDecimalInput("2")).toBe("2");
        expect(sanitizeDecimalInput("2.")).toBe("2.");
        expect(sanitizeDecimalInput("2.5")).toBe("2.5");
    });

    it("treats a comma as a decimal point", () => {
        expect(sanitizeDecimalInput("2,5")).toBe("2.5");
    });

    it("drops letters, signs and extra decimal points", () => {
        expect(sanitizeDecimalInput("-12a.5.5")).toBe("12.55");
        expect(sanitizeDecimalInput("")).toBe("");
    });
});

describe("roundWeight", () => {
    it("rounds to the nearest step and trims a trailing .0", () => {
        expect(roundWeight("2.5")).toBe("2.5");
        expect(roundWeight("2.3")).toBe("2.5");
        expect(roundWeight("2.2")).toBe("2");
        expect(roundWeight("2.")).toBe("2");
        expect(roundWeight("225")).toBe("225");
    });

    it("leaves an empty value empty", () => {
        expect(roundWeight("")).toBe("");
        expect(roundWeight(".")).toBe("");
    });

    it("accepts a custom step", () => {
        expect(roundWeight("3.3", 1)).toBe("3");
    });
});

describe("sanitizeIntegerInput", () => {
    it("keeps digits only", () => {
        expect(sanitizeIntegerInput("1.2a3")).toBe("123");
        expect(sanitizeIntegerInput("")).toBe("");
    });
});
