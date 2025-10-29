import { type Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(0, 0%, 90%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(0, 0%, 10%)',
        primary: 'hsl(220, 90%, 56%)',
        // add more if your components use them
      },
    },
  },
  plugins: [],
};

export default config;
