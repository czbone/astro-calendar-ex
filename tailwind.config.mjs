import flowbitePlugin from 'flowbite/plugin'
import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './node_modules/flowbite/**/*.js',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}'
  ],
  theme: {
    extend: {
      fontFamily: {
        // デフォルトフォント変更
        sans: [
          'ヒラギノ角ゴ Pro W3',
          'Hiragino Kaku Gothic Pro',
          'メイリオ',
          'Meiryo',
          '游ゴシック',
          'Yu Gothic',
          'ＭＳ Ｐゴシック',
          'MS PGothic',
          'sans-serif'
        ]
      },
      // Flowbiteのプラグインをインポートするとカラーパレットが変更されるのでTailwindのデフォルトカラーに戻す
      colors: {
        primary: colors.indigo,
        secondary: colors.yellow,
        error: colors.red,
        warning: colors.yellow,
        info: colors.blue,
        success: colors.green,
        red: colors.red,
        blue: colors.blue,
        green: colors.green,
        pink: colors.pink
      }
    }
  },
  plugins: [flowbitePlugin]
}
