export default {
  expo: {
    name: 'Pyklr',
    slug: 'pyklr',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/logos/pyklr-app-icon.png',
    scheme: 'pyklr',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    splash: {
      image: './assets/logos/pyklr-app-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#4493CC'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'app.pyklr.ios',
      associatedDomains: [
        'applinks:pyklr.app'
      ],
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'PYKLR uses your location to show nearby pickleball courts and players.',
        NSCameraUsageDescription: 'PYKLR uses the camera to take photos for your profile and to add new courts.',
        NSPhotoLibraryUsageDescription: 'PYKLR uses your photo library to add a profile picture and court photos.',
        NSContactsUsageDescription: 'PYKLR uses your contacts to help you invite friends to play.',
        ITSAppUsesNonExemptEncryption: false,
        SKAdNetworkItems: [
          {
            SKAdNetworkIdentifier: 'v9wttpbfk9.skadnetwork'
          },
          {
            SKAdNetworkIdentifier: 'n38lu8286q.skadnetwork'
          }
        ]
      },
      config: {
        usesNonExemptEncryption: false
      },
      runtimeVersion: '1.0.0'
    },
    android: {
      package: 'app.pyklr.android',
      adaptiveIcon: {
        foregroundImage: './assets/logos/pyklr-app-icon-rounded.png',
        backgroundColor: '#4493CC'
      },
      permissions: [
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECORD_AUDIO',
        'android.permission.INTERNET'
      ],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'pyklr.app'
            }
          ],
          category: [
            'BROWSABLE',
            'DEFAULT'
          ]
        }
      ],
      runtimeVersion: {
        policy: 'appVersion'
      }
    },
    web: {
      bundler: 'metro',
      favicon: './assets/logos/pyklr-mark.png'
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-secure-store',
      'expo-apple-authentication',
      [
        'expo-image-picker',
        {
          photosPermission: 'PYKLR needs access to your photos so you can add a profile picture and submit court photos.',
          cameraPermission: 'PYKLR needs camera access so you can take a profile picture or photograph a court.'
        }
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'PYKLR uses your location to find nearby pickleball courts and players.'
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/logos/pyklr-app-icon-rounded.png',
          color: '#67BF69'
        }
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.860179123284-k5k7o8hmbvukvee5ok3jn0r049e7p9uj'
        }
      ],
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: 'b9fafd08-47ca-4058-bf43-91b826b14961'
      }
    },
    owner: 'merricklee',
    updates: {
      url: 'https://u.expo.dev/b9fafd08-47ca-4058-bf43-91b826b14961'
    }
  }
};
