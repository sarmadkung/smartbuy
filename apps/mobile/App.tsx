import 'react-native-reanimated'
import { UIProvider, config } from '@repo/ui'
import { HomeScreen, DashboardScreen } from '@repo/screens'
import { SafeAreaView } from 'react-native';
import { useState } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'dashboard'>('home')
  const logo = require('./assets/monkey.png') 
  
  if (currentScreen === 'dashboard') {
    return (
      <UIProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <DashboardScreen
            onLogout={() => {
              console.log('Logout pressed')
              setCurrentScreen('home')
            }}
            onProfile={() => {
              console.log('Profile pressed')
            }}
            onSettings={() => {
              console.log('Settings pressed')
            }}
          />
        </SafeAreaView>
      </UIProvider>
    )
  }
  
  return (
    <UIProvider >
      <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen
        brandColor="#6A1B9A"
        onSkip={() => {
          console.log('Skip button pressed - navigating to dashboard')
          setCurrentScreen('dashboard')
        }}
        onFacebook={() => console.log('fb')}
        onGoogle={() => console.log('google')}
        onApple={() => console.log('apple')}
        onEmail={() => console.log('email')}
        logoSource={logo}
      />
      </SafeAreaView>
    </UIProvider>
  )
}