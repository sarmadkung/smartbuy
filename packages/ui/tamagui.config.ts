import { createTamagui } from 'tamagui'
import { defaultConfig } from '@tamagui/config/v4'

const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    light: { ...defaultConfig.themes.light, brand: '#64C11F', fb: '#1877F2', google: '#EA4335', apple: '#000', border: '#D9D9D9', brandColor: '#6A1B9A' },
    dark:  { ...defaultConfig.themes.dark,  brand: '#64C11F', fb: '#1877F2', google: '#EA4335', apple: '#000', border: '#555555', brandColor: '#6A1B9A' },
  },
  shorthands: { ...defaultConfig.shorthands }, // keep shorthands enabled
})

export type AppConfig = typeof config
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
export default config
