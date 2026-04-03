import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#bb0100',
          container: '#ff7763',
          fixed: '#bb0100',
        },
        'on-primary': '#ffefed',
        secondary: {
          container: '#ffc2c6',
          DEFAULT: '#bb0100',
        },
        'on-secondary-container': '#852233',
        surface: {
          DEFAULT: '#f6f6f6',
          container: {
            low: '#f0f1f1',
            lowest: '#ffffff',
            high: '#e8e9e9',
            highest: '#dbdddd',
          },
        },
        'on-surface': '#2d2f2f',
        'outline-variant': '#acadad',
        tertiary: '#7b40a2',
      },
      fontFamily: {
        epilogue: ['var(--font-epilogue)', 'sans-serif'],
        'work-sans': ['var(--font-work-sans)', 'sans-serif'],
      },
      spacing: {
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
      borderRadius: {
        full: '9999px',
        lg: '12px',
        md: '12px',
        sm: '8px',
      },
      backdropBlur: {
        glass: '12px',
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'display-md': ['2.8rem', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
        'headline-lg': ['2.2rem', { lineHeight: '1', letterSpacing: '0' }],
        'headline-md': ['1.8rem', { lineHeight: '1.05', letterSpacing: '0.005em' }],
        'title-lg': ['1.4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'title-md': ['1.2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'title-sm': ['1rem', { lineHeight: '1.3', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '0.03em' }],
      },
      boxShadow: {
        ambient: '0 8px 32px rgba(45, 47, 47, 0.04)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #bb0100 0%, #ff7763 100%)',
      },
    },
  },
  plugins: [],
}

export default config
