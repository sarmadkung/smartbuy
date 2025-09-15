import { DashboardScreen } from '@repo/screens'

export default function Dashboard() {
  console.log('Dashboard component loaded')
  return (
    <DashboardScreen
      onLogout={() => {
        // Handle logout - could navigate back to home or clear auth state
        console.log('Logout pressed')
      }}
      onProfile={() => {
        // Handle profile navigation
        console.log('Profile pressed')
      }}
      onSettings={() => {
        // Handle settings navigation
        console.log('Settings pressed')
      }}
    />
  )
}
