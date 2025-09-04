'use client'

import React, { useState } from 'react'
import type { ImageSourcePropType } from 'react-native'
import {
  YStack,
  XStack,
  Text,
  Button,
  Separator,
  Paragraph,
  Theme,
  Image
} from '@repo/ui'

type Props = {
  brandColor?: string
  onSkip?: () => void
  onFacebook?: () => void
  onGoogle?: () => void
  onApple?: () => void
  onEmail?: () => void
  onTerms?: () => void
  onPrivacy?: () => void
  // left here if you later want to pass an asset instead of the built-in logo
  logoSource?: ImageSourcePropType
}

export function HomeScreen({
  brandColor = '#6A1B9A', // purple like your screenshot
  onSkip,
  onFacebook,
  onGoogle,
  onApple,
  onEmail,
  onTerms,
  onPrivacy,
  logoSource
}: Props) {
  // if you still want a splash delay, re-add the timeout logic here
  const [phase] = useState<'login'>('login')

  if (phase === 'login') {
    return (
      <YStack
        flex={1}
        background={brandColor as any}
        p="$6"
      >
        {/* top right: Skip */}
        <XStack justify="flex-end">
          <Button chromeless onPress={onSkip}>
            <Text color="white" fontWeight="700">
              Skip
            </Text>
          </Button>
        </XStack>

        {/* centered Food Monkey logo */}
        <YStack flex={1} items="center" justify="center">
          <FoodMonkeyLogo logoSource={logoSource}/>
        </YStack>

        {/* white bottom sheet */}
        <YStack
          background="$color1"
          borderBlockStartWidth="$6"
          p="$5"
          elevation={8}
        >
          <Text fontSize="$8" fontWeight="800">
            Sign up or log in
          </Text>
          <Paragraph m="$2" color="$color10">
            Sign up to get your discount
          </Paragraph>

          {/* full-width buttons */}
          <YStack m="$4" gap="$3">
            <SocialButton
              label="Continue with Facebook"
              bg="#1877F2"
              color="white"
              onPress={onFacebook}
              left="f"
            />
            <SocialButton
              label="Continue with Google"
              bg="$color1"
              color="$color12"
              borderColor="$color5"
              onPress={onGoogle}
              left="G"
            />
            <SocialButton
              label="Continue with Apple"
              bg="$color12"
              color="$color1"
              onPress={onApple}
              left=""
            />

            <XStack items="center" gap="$3" m="$2">
              <Separator flex={1} />
              <Text color="$color10">or</Text>
              <Separator flex={1} />
            </XStack>

            <SocialButton
              label="Continue with email"
              bg={brandColor}
              color="$color1"
              onPress={onEmail}
            />
          </YStack>

          <Paragraph m="$3" text="center" color="$color10" fontSize="$2">
            By signing up you agree to our{' '}
            <Text color={brandColor as any} onPress={onTerms}>
              Terms and Conditions
            </Text>
            {' '}and{' '}
            <Text color={brandColor as any} onPress={onPrivacy}>
              Privacy Policy
            </Text>
            .
          </Paragraph>
        </YStack>
      </YStack>
    )
  }

  // fallback (not used right now)
  return (
    <Theme name="light">
      <YStack flex={1} items="center" justify="center">
        <Text>Loading…</Text>
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
    <YStack items="center" justify="center" gap="$3">
      <YStack
        width={140}
        height={140}
        borderBottomEndRadius={9999}
        background="$color1"
        items="center"
        justify="center"
        elevation={6}
      >
       {logoSource ? (
          <Image
            // RN expects either require(...) or {uri: string} – both are valid ImageSourcePropType
            source={logoSource as any}
            width="100%"
            height="100%"
            resizeMode="contain"
          />
        ) : (
          <Text fontSize={Math.floor(size * 0.5)}>🐵</Text>
        )}
      </YStack>

      <Text fontWeight="900" fontSize="$9" color="$color1" letterSpacing={1}>
        FOOD
        <Text fontWeight="900" fontSize="$9" color="$color1"> </Text>
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
  bg: string | any
  color: string | any
  borderColor?: string | any
  left?: string
}

/** Full-width social button */
function SocialButton({ label, onPress, bg, color, borderColor, left }: SBProps) {
  return (
    <Button
      onPress={onPress}
      width="100%"                     // fill the sheet
      height={50}
      background={bg as any}
      borderColor={borderColor as any}
      borderWidth={borderColor ? 1 : 0}
      borderBottomEndRadius="$6"
      pressStyle={{ opacity: 0.9 }}
    >
      <XStack items="center" justify="center" gap="$3" width="100%">
        {left ? <Text color={color as any} fontWeight="800">{left}</Text> : null}
        <Text color={color as any} fontWeight="700">
          {label}
        </Text>
      </XStack>
    </Button>
  )
}
