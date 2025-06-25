/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3B82F6', // Bleu Tailwind par défaut
                    light: '#93C5FD',
                    dark: '#1D4ED8',
                },
                sidebar: {
                    bg: '#f8fafc', // slate-50
                    text: '#334155', // slate-700
                    active: '#1d4ed8', // blue-700
                    hover: '#e2e8f0', // slate-200
                },
            },
            spacing: {
                'sidebar': '16rem', // 64 * 0.25rem = 16rem (256px)
            },
        },
    },
    plugins: [],
}