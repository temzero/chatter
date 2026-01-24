export default {
  plugins: {
    "@tailwindcss/postcss": {}, // ← New package required
    autoprefixer: {
      overrideBrowserslist: ["last 2 versions", "> 1%", "not dead"],
    },
  },
};
