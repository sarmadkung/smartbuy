import { HomeScreen } from '@repo/screens'
import { useRouter } from 'expo-router'

export default function Index() {
  const router = useRouter()

  return (
    <HomeScreen
      onSkip={() => {
        console.log('Skip button pressed - navigating to dashboard')
        try {
          console.log('Router object:', router)
          router.push('./dashboard')
          console.log('Navigation command executed')
        } catch (error) {
          console.error('Router error:', error)
        }
      }}
      onFacebook={() => {
        console.log('Facebook login')
      }}
      onGoogle={() => {
        console.log('Google login')
      }}
      onApple={() => {
        console.log('Apple login')
      }}
      onEmail={() => {
        console.log('Email login')
      }}
      onPhoneNumber={() => {
        console.log('Phone number login')
      }}
      onTerms={() => {
        console.log('Terms pressed')
      }}
      onPrivacy={() => {
        console.log('Privacy pressed')
      }}
    />
  )
}
