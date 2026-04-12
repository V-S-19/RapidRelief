// postcss.config.mjs (recommended for ESM)
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // autoprefixer is usually not needed anymore with Tailwind v4
  },
};

export default config;