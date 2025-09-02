import { Stack, useSegments } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import AdminFooter from '../../components/AdminFooter';

export default function AdminLayout() {
  const segments = useSegments();
  const lastSegment = segments[segments.length - 1];
  const hideFooter = lastSegment === '(admin)';

  return (
    <View style={styles.root}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: '홈', headerShown: true }}
        />
        <Stack.Screen
          name="dashboard"
          options={{ title: '매장현황(휴)', headerShown: true }}
        />
        <Stack.Screen
          name="users"
          options={{ title: '사용자 관리', headerShown: true }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: '설정', headerShown: true }}
        />
        <Stack.Screen
          name="vendorList"
          options={{ title: '거래처 목록', headerShown: true }}
        />
        <Stack.Screen
          name="kioskSoldOut"
          options={{ title: '키오스크품절관리(휴)', headerShown: true }}
        />
        <Stack.Screen
          name="purchaseDailyReport"
          options={{ title: '일자별 매입현황(휴)', headerShown: true }}
        />
        <Stack.Screen
          name="purchaseProductReport"
          options={{ title: '상품별 매입현황(휴)', headerShown: true }}
        />
        <Stack.Screen
          name="realtimeSales"
          options={{ title: '실시간 매출현황(휴)', headerShown: true }}
        />
        <Stack.Screen
            name="saleReportByPeriod"
            options={{ title: '기간별 매출현황(휴)', headerShown: true }}
        />
      </Stack>
      {!hideFooter && (
        <View style={styles.footerWrap}>
          <AdminFooter />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
