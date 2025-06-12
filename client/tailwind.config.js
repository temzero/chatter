/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "data-theme",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwind-scrollbar-hide"),
    // require("daisyui")({
    //   base: false, // Disables base styles (buttons, inputs, etc.)
    //   utils: false, // Disables utility classes (like .btn)
    //   prefix: "daisy-",
    // }),
  ],
};
