'use client'
import { useState } from 'react'
import type { ImageSourcePropType } from 'react-native'
import { YStack, XStack, Text, Button, Separator, Paragraph, Theme, Image } from '@repo/ui'

type Props = {
  brandColor?: string
  onSkip?: () => void
  onFacebook?: () => void
  onGoogle?: () => void
  onApple?: () => void
  onEmail?: () => void
  onPhoneNumber?: () => void
  onTerms?: () => void
  onPrivacy?: () => void
  logoSource?: ImageSourcePropType
}

export function HomeScreen({
  brandColor,
  onSkip,
  onFacebook,
  onGoogle,
  onApple,
  onEmail,
  onPhoneNumber,
  onTerms,
  onPrivacy,
  logoSource,
}: Props) {
  const [phase] = useState<'login'>('login')

  if (phase === 'login') {
    return (
      <YStack flex={1} background="$bg" padding={10}>
        <YStack flex={1} alignItems="center" justify="center" backgroundColor={brandColor ? (brandColor as any) : '$brand'} borderRadius="$6" padding="$6" marginBottom="$4">
          <FoodMonkeyLogo logoSource={logoSource} />
        </YStack>

        <YStack backgroundColor="$color1" borderRadius="$6" padding="$5" elevation={8}>
          <Text fontSize="$8" fontWeight="800" color="$color">
            Sign up or log in
          </Text>
          <Paragraph marginTop="$2" color="$color10">
            Sign up to get your discount
          </Paragraph>

          <YStack marginTop="$4" gap="$3">
            <SocialButton label="Continue with Facebook" background="$fb" textColor="$color1" onPress={onFacebook} left="f" />
            <SocialButton label="Continue with Google" background="$color1" textColor="$color12" borderColor="$border" onPress={onGoogle} left="G" />
            <SocialButton label="Continue with Apple" background="$apple" textColor="$color1" onPress={onApple} left="" />

            <XStack alignItems="center" gap="$3" marginVertical="$2">
              <Separator flex={1} />
              <Text color="$color10">or</Text>
              <Separator flex={1} />
            </XStack>

            <SocialButton label="Continue with email" background={brandColor ? (brandColor as any) : '$brand'} textColor="$color1" onPress={onEmail} />
            <SocialButton label="Continue with phone number" background={brandColor ? (brandColor as any) : '$brand'} textColor="$color1" onPress={onPhoneNumber} />
          </YStack>

          <Paragraph marginTop="$3" textAlign="center" color="$color10" fontSize="$2">
            By signing up you agree to our{' '}
            <Text color={brandColor ? (brandColor as any) : '$brand'} onPress={onTerms}>
              Terms and Conditions
            </Text>
            {' '}and{' '}
            <Text color={brandColor ? (brandColor as any) : '$brand'} onPress={onPrivacy}>
              Privacy Policy
            </Text>
            .
          </Paragraph>
        </YStack>
      </YStack>
    )
  }

  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text color="$color">Loading…</Text>
      </YStack>
    </Theme>
  )
}

type LogoProps = {
  logoSource?: ImageSourcePropType
  size?: number
}

function FoodMonkeyLogo({ logoSource, size = 140 }: LogoProps) {
  return (
    <YStack alignItems="center" justifyContent="center" gap="$3">
      <YStack width={size} height={size} borderRadius={9999} backgroundColor="$color1" alignItems="center" justifyContent="center" elevation={6} overflow="hidden">
        {logoSource ? (
          <Image source={logoSource as any} width="100%" height="100%" resizeMode="contain" />
        ) : (
          <Text fontSize={Math.floor(size * 0.5)} color="$color12">🐵</Text>
        )}
      </YStack>

      <Text fontWeight="900" fontSize="$9" color="$color1" letterSpacing={1}>
        FOOD
        <Text fontWeight="900" fontSize="$9" color="$color1">
          MONKEY
        </Text>
      </Text>
    </YStack>
  )
}

type SBProps = {
  label: string
  onPress?: () => void
  background: string | any
  textColor: string | any
  borderColor?: string | any
  left?: string
}

function SocialButton({ label, onPress, background, textColor, borderColor, left }: SBProps) {
  return (
    <Button
      onPress={onPress}
      width="100%"
      height={50}
      backgroundColor={background as any}
      borderColor={borderColor as any}
      borderWidth={borderColor ? 1 : 0}
      borderRadius="$6"
      pressStyle={{ opacity: 0.9 }}
    >
      <XStack alignItems="center" justifyContent="center" gap="$3" width="100%">
        {left ? <Text color={textColor as any} fontWeight="800">{left}</Text> : null}
        <Text color={textColor as any} fontWeight="700">
          {label}
        </Text>
      </XStack>
    </Button>
  )
}