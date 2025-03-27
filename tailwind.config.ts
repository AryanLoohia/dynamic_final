module.exports = {
    darkMode: "class",
    content: ["./app/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          poppins: ["var(--font-poppins)", "sans-serif"],
          merriweather: ["Merriweather", "serif"],
          geist: ["var(--font-geist-sans)", "sans-serif"],
          geistMono: ["var(--font-geist-mono)", "monospace"],
        },
      },
    },
    plugins: [],
  };
  