import { Stack } from 'expo-router'
import { TamaguiProvider, config } from '@repo/ui'

export default function RootLayout() {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Stack screenOptions={{ headerShown: false }} />
    </TamaguiProvider>
  )
}
