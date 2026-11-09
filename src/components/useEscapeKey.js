import {useEffect, useRef} from "react";

// Only the most recently opened modal reacts to Escape, so closing a
// confirm dialog doesn't also close the history window underneath it.
const stack = [];

function onKeyDown(event) {
    if (event.key !== "Escape" || stack.length === 0) return;
    event.preventDefault();
    stack[stack.length - 1].current();
}

export function useEscapeKey(onEscape) {
    const handler = useRef(onEscape);
    useEffect(() => {
        handler.current = onEscape;
    });

    useEffect(() => {
        if (stack.length === 0) document.addEventListener("keydown", onKeyDown);
        stack.push(handler);
        return () => {
            stack.splice(stack.indexOf(handler), 1);
            if (stack.length === 0) document.removeEventListener("keydown", onKeyDown);
        };
    }, []);
}
