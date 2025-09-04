import 'react-native-reanimated'
import { UIProvider, config } from '@repo/ui'
import { HomeScreen } from '@repo/screens'
import { SafeAreaView } from 'react-native';
export default function App() {
  const logo = require('./assets/monkey.png') 
  return (
    <UIProvider >
      <SafeAreaView style={{ flex: 1 }}>
      <HomeScreen
        brandColor="#6A1B9A"
        onSkip={() => console.log('skip')}
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