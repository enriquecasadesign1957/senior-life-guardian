import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        paper: "#f6f3ee",
        pine: "#1f6b45",
      },
    },
  },
  plugins: [],
};

export default config;
