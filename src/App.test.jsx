import {describe, expect, it} from "vitest";
import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import {storageKey} from "./lib/storage.js";

async function setup() {
    const user = userEvent.setup();
    render(<App/>);
    await user.click(screen.getByRole("button", {name: /^Chest/}));
    return user;
}

async function addExercise(user, name) {
    await user.type(screen.getByPlaceholderText(/add chest exercise/i), `${name}{Enter}`);
}

async function logSet(user, setNumber, weight, reps) {
    await user.type(screen.getByLabelText(`Set ${setNumber} weight`), weight);
    await user.type(screen.getByLabelText(`Set ${setNumber} reps`), reps);
}

describe("deleting an exercise", () => {
    it("asks first, with Cancel focused, and keeps the exercise on Cancel", async () => {
        const user = await setup();
        await addExercise(user, "bench press");

        await user.click(screen.getByRole("button", {name: "Delete Bench Press"}));
        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toHaveTextContent(/Delete Bench Press\?/);
        expect(within(dialog).getByRole("button", {name: "Cancel"})).toHaveFocus();

        await user.keyboard("{Enter}"); // Enter on the focused Cancel button
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        expect(screen.getByText("Bench Press")).toBeInTheDocument();
    });

    it("Escape also cancels", async () => {
        const user = await setup();
        await addExercise(user, "fly");
        await user.click(screen.getByRole("button", {name: "Delete Fly"}));
        await user.keyboard("{Escape}");
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        expect(screen.getByText("Fly")).toBeInTheDocument();
    });

    it("removes it on Delete, and Undo brings it back", async () => {
        const user = await setup();
        await addExercise(user, "dips");

        await user.click(screen.getByRole("button", {name: "Delete Dips"}));
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", {name: "Delete"}));
        expect(screen.queryByText("Dips")).not.toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem(storageKey)).Chest.exercises).toHaveLength(0);

        await user.click(screen.getByRole("button", {name: "Undo"}));
        expect(screen.getByText("Dips")).toBeInTheDocument();
    });
});

describe("expanding exercises", () => {
    it("keeps only one exercise open at a time and marks it as current", async () => {
        const user = await setup();
        await addExercise(user, "bench");
        await addExercise(user, "fly");

        // The newly added exercise opens and the previous one closes.
        expect(screen.getByRole("button", {name: "Collapse Fly"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Expand Bench"})).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "Expand Bench"}));
        expect(screen.getByRole("button", {name: "Collapse Bench"})).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Expand Fly"})).toBeInTheDocument();
        expect(screen.getByRole("region", {name: "Chest: Bench"})).toHaveAttribute("aria-current", "true");

        await user.click(screen.getByRole("button", {name: "Collapse Bench"}));
        expect(screen.queryByRole("button", {name: /^Collapse/})).not.toBeInTheDocument();
    });

    it("shows the PB on a collapsed exercise so you can tell them apart", async () => {
        const user = await setup();
        await addExercise(user, "bench");
        await user.click(screen.getByRole("button", {name: "+ Add set"}));
        await logSet(user, 1, "100", "5");
        await user.click(screen.getByRole("button", {name: "Finished"}));
        await user.click(screen.getByRole("button", {name: "Collapse Bench"}));
        expect(screen.getByText(/PB 5 @ 100/)).toBeInTheDocument();
    });
});

describe("weight entry", () => {
    it("accepts decimals typed one key at a time and rounds to 0.5 on blur", async () => {
        const user = await setup();
        await addExercise(user, "curl");
        await user.click(screen.getByRole("button", {name: "+ Add set"}));

        const weight = screen.getByLabelText("Set 1 weight");
        await user.type(weight, "2.5");
        expect(weight).toHaveValue("2.5");

        await user.clear(weight);
        await user.type(weight, "12.3");
        await user.tab();
        expect(weight).toHaveValue("12.5");
    });
});

describe("finishing an exercise", () => {
    it("saves the session, shows PB feedback and clears the sets", async () => {
        const user = await setup();
        await addExercise(user, "bench");
        await user.click(screen.getByRole("button", {name: "+ Add set"}));
        await logSet(user, 1, "100", "5");

        await user.click(screen.getByRole("button", {name: "Finished"}));
        expect(screen.getByRole("status")).toHaveTextContent(/New PB/);
        expect(screen.getByLabelText("Set 1 weight")).toHaveValue("");
        expect(screen.getByLabelText("Set 1 weight")).toHaveAttribute("placeholder", "100");

        await logSet(user, 1, "90", "5");
        await user.click(screen.getByRole("button", {name: "Finished"}));
        expect(screen.getByRole("status")).toHaveTextContent(/Session saved/);

        const saved = JSON.parse(localStorage.getItem(storageKey)).Chest.exercises[0];
        expect(saved.sessions).toHaveLength(2);
        expect(saved.personalBests).toHaveLength(1);
    });
});

describe("history", () => {
    async function finishTwoSessions(user) {
        await addExercise(user, "bench");
        await user.click(screen.getByRole("button", {name: "+ Add set"}));
        await logSet(user, 1, "100", "5");
        await user.click(screen.getByRole("button", {name: "Finished"}));
        await logSet(user, 1, "2250", "5"); // a typo PB
        await user.click(screen.getByRole("button", {name: "Finished"}));
    }

    it("deletes a saved session after confirming", async () => {
        const user = await setup();
        await finishTwoSessions(user);

        await user.click(screen.getByRole("button", {name: "History"}));
        const history = screen.getByRole("dialog", {name: /Bench history/});
        expect(within(history).getAllByRole("listitem")).toHaveLength(2);

        await user.click(within(history).getAllByRole("button", {name: /^Delete session/})[0]);
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", {name: "Delete"}));
        expect(within(history).getAllByRole("listitem")).toHaveLength(1);
    });

    it("deletes a wrong PB after confirming, and the current PB falls back", async () => {
        const user = await setup();
        await finishTwoSessions(user);
        expect(screen.getByText(/PB: 5 @ 2250/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", {name: "History"}));
        const history = screen.getByRole("dialog", {name: /Bench history/});
        await user.click(within(history).getByRole("tab", {name: "PBs"}));
        await user.click(within(history).getByRole("button", {name: /^Delete PB 5 @ 2250/}));
        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", {name: "Delete"}));

        await user.keyboard("{Escape}");
        expect(screen.getByText(/PB: 5 @ 100/)).toBeInTheDocument();
    });
});
