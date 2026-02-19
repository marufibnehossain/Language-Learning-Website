import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          strong: 'var(--primary-strong)',
          soft: 'var(--primary-soft)',
        },
        info: 'var(--info)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        purple: 'var(--purple)',
        panel: 'var(--panel)',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        soft: '0 2px 8px var(--shadow)',
      },
    },
  },
  plugins: [],
}
export default config
