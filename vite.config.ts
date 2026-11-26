import { writeFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { minimal2023Preset } from '@vite-pwa/assets-generator/config'
import { brand } from './src/config/brand.ts'
import { brandIconSvg } from './src/config/brandIcon.ts'

// Regenerate the placeholder icon from the brand config on every dev/build run.
// The PWA plugin turns it into favicon / Apple touch / manifest PNGs.
const ICON_PATH = 'public/brand-icon.svg'
writeFileSync(ICON_PATH, brandIconSvg())

/** Injects <title>, description and brand CSS variables from src/config/brand.ts. */
function brandHtml(): Plugin {
  const { colors } = brand
  const cssVars = [
    `--brand-primary:${colors.primary}`,
    `--brand-primary-hover:${colors.primaryHover}`,
    `--brand-primary-soft:${colors.primarySoft}`,
    `--brand-on-primary:${colors.onPrimary}`,
  ].join(';')

  return {
    name: 'brand-html',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => ({
        html: html.replace('%APP_NAME%', brand.appName),
        tags: [
          { tag: 'meta', attrs: { name: 'description', content: brand.tagline }, injectTo: 'head' },
          { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: brand.shortName }, injectTo: 'head' },
          { tag: 'style', children: `:root{${cssVars}}`, injectTo: 'head' },
        ],
      }),
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    brandHtml(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        image: ICON_PATH,
        // The source icon is already a full-bleed tile, so no extra padding
        // (the default preset would add a white border on iOS/Android).
        preset: {
          ...minimal2023Preset,
          maskable: { ...minimal2023Preset.maskable, padding: 0 },
          apple: { ...minimal2023Preset.apple, padding: 0 },
        },
        overrideManifestIcons: true,
      },
      manifest: {
        name: brand.appName,
        short_name: brand.shortName,
        description: brand.tagline,
        theme_color: brand.colors.primary,
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
