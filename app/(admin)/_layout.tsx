import {Stack, useSegments, router} from 'expo-router';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import AdminFooter from '../../components/AdminFooter';

export default function AdminLayout() {
    const segments = useSegments();
    const lastSegment = segments[segments.length - 1];
    const hideFooter = lastSegment === '(admin)';
    const handleHomePress = () => {
        router.back()
    };

    return (
        <View style={styles.root}>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{title: '홈', headerShown: true}}
                />
                <Stack.Screen
                    name="dashboard"
                    options={{title: '매장현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="users"
                    options={{title: '사용자 관리', headerShown: true}}
                />
                <Stack.Screen
                    name="settings"
                    options={{title: '설정', headerShown: true}}
                />
                <Stack.Screen
                    name="vendorList"
                    options={{title: '거래처 목록', headerShown: true}}
                />
                <Stack.Screen
                    name="kioskSoldOut"
                    options={{title: '키오스크품절관리(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="purchaseDailyReport"
                    options={{title: '일자별 매입현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="purchaseDailyReportG"
                    options={{title: '일자별 매입현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="purchaseDailyReportOp"
                    options={{title: '일자별 매입현황(통합)', headerShown: true}}
                />
                <Stack.Screen
                    name="purchaseProductReport"
                    options={{title: '상품별 매입현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSales"
                    options={{title: '실시간 매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesG"
                    options={{title: '실시간 매출현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesG2"
                    options={{title: '실시간 매출현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesOp"
                    options={{title: '실시간 매출현황(통합)', headerShown: true}}
                />
                <Stack.Screen
                    name="salesReportByPeriod"
                    options={{title: '기간별 매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="salesReportByPeriodG"
                    options={{title: '기간별 매출현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="salesReportByPeriodOp"
                    options={{title: '기간별 매출현황(통합)', headerShown: true}}
                />
                <Stack.Screen
                    name="saleReportByTimezone"
                    options={{title: '시간대별 매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="saleReportByTimezoneG"
                    options={{title: '시간대별 매출현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="monthlySalesReport"
                    options={{title: '월 매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesBySalesOrg"
                    options={{title: '시설별 실시간 매출(통합)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesBySalesOrgG"
                    options={{title: '시설별 실시간 매출(통합)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesByCorner"
                    options={{title: '실시간 매장매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeSalesByCornerOp"
                    options={{title: '실시간 매장매출현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="cornerStockReport"
                    options={{title: '매장 재고현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="cornerStockReportG"
                    options={{title: '재고현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="realtimeStockReport"
                    options={{title: '실시간 재고현황(주)', headerShown: true}}
                />
                <Stack.Screen
                    name="warehouseStockReport"
                    options={{title: '창고 재고현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="cornerWhStockReport"
                    options={{title: '매장 창고 재고현황(휴)', headerShown: true}}
                />
                <Stack.Screen
                    name="tlgReportByPeriod"
                    options={{title: '기간별 TLG 현황', headerShown: true}}
                />
            </Stack>
            {!hideFooter && (
                <View style={styles.footerWrap}>
                    <AdminFooter onHome={handleHomePress}/>
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
