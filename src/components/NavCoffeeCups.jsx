/** Three distinct coffee-cup marks for project nav items. */

function cupProps(size, rest) {
    return {
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": true,
        ...rest,
    };
}

/** Project 1 — classic ceramic mug with C-handle */
export function CoffeeCupMug({ size = 17, ...rest }) {
    return (
        <svg {...cupProps(size, rest)}>
            <path d="M5.5 8.5h9.5v7.2c0 1.4-1.1 2.5-2.5 2.5H8c-1.4 0-2.5-1.1-2.5-2.5V8.5z" />
            <path d="M15 10.2h1.6c1.2 0 2.2 1 2.2 2.2v0.8c0 1.2-1 2.2-2.2 2.2H15" />
            <path d="M7 8.5c0-.9.5-1.7 1.2-2.1.4-.2.9-.2 1.3 0 .4.2.7.5.9.9" />
            <path d="M10.2 6.2c.2-.5.6-.9 1.1-1.1" />
        </svg>
    );
}

/** Project 2 — tall takeaway cup with lid */
export function CoffeeCupTakeaway({ size = 17, ...rest }) {
    return (
        <svg {...cupProps(size, rest)}>
            <path d="M7.2 9.2h9.6l-1.1 10.1c-.1.9-.9 1.5-1.8 1.5H10.1c-.9 0-1.7-.6-1.8-1.5L7.2 9.2z" />
            <path d="M6.2 9.2h11.6" />
            <path d="M7.5 7.2h9l.5 2H7l.5-2z" />
            <path d="M10.5 5.5h3v1.7h-3z" />
            <path d="M9.5 14.2h5" />
        </svg>
    );
}

/** Project 3 — wide cafe cup on a saucer */
export function CoffeeCupCafe({ size = 17, ...rest }) {
    return (
        <svg {...cupProps(size, rest)}>
            <path d="M5 9.5h10.5v5.2c0 1.5-1.2 2.7-2.7 2.7H7.7C6.2 17.4 5 16.2 5 14.7V9.5z" />
            <path d="M15.5 11h1.8c1.1 0 2 .9 2 2s-.9 2-2 2h-1.8" />
            <path d="M4.2 19.2h12.6c.7 0 1.2-.5 1.2-1.1 0-.4-.2-.7-.5-.9H3.5c-.3.2-.5.5-.5.9 0 .6.5 1.1 1.2 1.1z" />
            <path d="M8.2 7.8c.3-.7.9-1.2 1.6-1.4" />
            <path d="M11.2 6.2c.2-.4.6-.7 1.1-.8" />
        </svg>
    );
}

export const projectNavCups = {
    "project-1": CoffeeCupMug,
    "project-2": CoffeeCupTakeaway,
    "project-3": CoffeeCupCafe,
};
