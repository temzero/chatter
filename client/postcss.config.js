export default {
  plugins: {
    "@tailwindcss/postcss": {}, // ← New package required
    autoprefixer: {
      overrideBrowserslist: ["last 2 versions", "> 1%", "not dead"],
      // This ensures it doesn't remove non-prefixed properties
      // flexbox: "no-2009",
      // grid: "autoplace",
    },
  },
};
