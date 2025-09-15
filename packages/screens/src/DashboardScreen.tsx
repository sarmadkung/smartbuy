'use client'
import { YStack, XStack, Text, Button, Card, Paragraph } from '@repo/ui'

type Props = {
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
}

export function DashboardScreen({
  onLogout,
  onProfile,
  onSettings,
}: Props) {
  return (
    <YStack flex={1} background="$bg" padding="$4">
      {/* Header */}
      <XStack width="100%" justifyContent="space-between" alignItems="center" marginBottom="$4">
        <Text fontSize="$6" fontWeight="800" color="$color">
          Dashboard
        </Text>
        <XStack gap="$2">
          <Button
            onPress={onProfile}
            backgroundColor="transparent"
            paddingHorizontal="$2"
            paddingVertical="$1"
            pressStyle={{ opacity: 0.6 }}
          >
            <Text color="$color" fontSize="$3">Profile</Text>
          </Button>
          <Button
            onPress={onLogout}
            backgroundColor="transparent"
            paddingHorizontal="$2"
            paddingVertical="$1"
            pressStyle={{ opacity: 0.6 }}
          >
            <Text color="$color" fontSize="$3">Logout</Text>
          </Button>
        </XStack>
      </XStack>

      {/* Welcome Card */}
      <Card backgroundColor="$color1" borderRadius="$4" padding="$4" marginBottom="$4" elevation={2}>
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$2">
          Welcome back! 👋
        </Text>
        <Paragraph color="$color10">
          You're successfully logged in to your SmartBuy account.
        </Paragraph>
      </Card>

      {/* Quick Actions */}
      <YStack gap="$3" marginBottom="$4">
        <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$2">
          Quick Actions
        </Text>
        
        <Card backgroundColor="$color1" borderRadius="$4" padding="$3" elevation={1}>
          <XStack alignItems="center" justifyContent="space-between">
            <YStack>
              <Text fontSize="$4" fontWeight="600" color="$color">
                Browse Products
              </Text>
              <Paragraph color="$color10" fontSize="$3">
                Discover amazing deals
              </Paragraph>
            </YStack>
            <Text fontSize="$4">🛍️</Text>
          </XStack>
        </Card>

        <Card backgroundColor="$color1" borderRadius="$4" padding="$3" elevation={1}>
          <XStack alignItems="center" justifyContent="space-between">
            <YStack>
              <Text fontSize="$4" fontWeight="600" color="$color">
                My Orders
              </Text>
              <Paragraph color="$color10" fontSize="$3">
                Track your purchases
              </Paragraph>
            </YStack>
            <Text fontSize="$4">📦</Text>
          </XStack>
        </Card>

        <Card backgroundColor="$color1" borderRadius="$4" padding="$3" elevation={1}>
          <XStack alignItems="center" justifyContent="space-between">
            <YStack>
              <Text fontSize="$4" fontWeight="600" color="$color">
                Settings
              </Text>
              <Paragraph color="$color10" fontSize="$3">
                Manage your account
              </Paragraph>
            </YStack>
            <Text fontSize="$4">⚙️</Text>
          </XStack>
        </Card>
      </YStack>

      {/* Stats */}
      <YStack gap="$3">
        <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$2">
          Your Stats
        </Text>
        
        <XStack gap="$3">
          <Card backgroundColor="$color1" borderRadius="$4" padding="$3" flex={1} elevation={1}>
            <YStack alignItems="center">
              <Text fontSize="$6" fontWeight="800" color="$brand">0</Text>
              <Paragraph color="$color10" fontSize="$2" textAlign="center">
                Orders
              </Paragraph>
            </YStack>
          </Card>
          
          <Card backgroundColor="$color1" borderRadius="$4" padding="$3" flex={1} elevation={1}>
            <YStack alignItems="center">
              <Text fontSize="$6" fontWeight="800" color="$brand">$0</Text>
              <Paragraph color="$color10" fontSize="$2" textAlign="center">
                Saved
              </Paragraph>
            </YStack>
          </Card>
        </XStack>
      </YStack>
    </YStack>
  )
}
