import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import {UserProvider, useUser} from '../contexts/UserContext';
import {Redirect} from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppRouter />

          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

function AppRouter() {
  const user = useUser(); // 로그인 상태
  console.log('user:'+JSON.stringify(user));
  if (user === undefined) {
    // UserContext 로딩 중이면 아무 화면도 렌더하지 않음
    return null;
  }

  if (!user.isAuthenticated) {
    // 로그인 안 되어 있으면 /login
    console.log('로그인 안됨')
    return <Redirect href="/(auth)/login" />;
  }
  else {
    console.log('로그인 됨')
    return <Redirect href="/(admin)" />;
  }
}

