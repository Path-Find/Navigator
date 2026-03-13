/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
            animation: {
                blob: "blob 7s infinite",
                "gradient-x": "gradient-x 15s ease infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
                "gradient-x": {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
                "scan-line": {
                    "0%": { transform: "translateY(-100%)", opacity: "0" },
                    "50%": { opacity: "0.5" },
                    "100%": { transform: "translateY(100%)", opacity: "0" },
                },
                "float-y": {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "card-shimmer": {
                    "0%": { transform: "translateX(-100%) skewX(-15deg)" },
                    "100%": { transform: "translateX(200%) skewX(-15deg)" },
                },
                "pulse-glow": {
                    "0%, 100%": { opacity: "0.5", scale: "1" },
                    "50%": { opacity: "1", scale: "1.05" },
                }
            },
        },
    },
    plugins: [],
}
