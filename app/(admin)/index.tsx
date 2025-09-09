import { router, Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DEP_G, DEP_OP, DEP_R } from '../../constants/RoleTypes';
import { useUser } from '../../contexts/UserContext';

type MenuChild = { title: string; icon: string; route: Href; roleType: string };
type MenuGroup = { key: string; title: string; icon: string; children: MenuChild[] };
// DEP_OP: 운영업체, DEP_R: 휴게소, DEP_G: 주유소
export default function AdminHomeScreen() {
  const { user } = useUser();
  console.log('user:'+JSON.stringify(user))

  const menuGroups = useMemo((): MenuGroup[] => [
    {
      key: 'master',
      title: '마스터',
      icon: '📁',
      children: [
        { title: '사용자 정보수정', icon: '👤', route: '/(admin)/users', roleType: 'all_except_001' },
        { title: '매장현황(휴)', icon: '🏬', route: '/(admin)/dashboard', roleType: DEP_R },
        { title: '거래처현황(휴)', icon: '🏬', route: '/(admin)/vendorList', roleType: DEP_R },
        { title: '거래처현황(주)', icon: '🏬', route: '/(admin)/vendorList', roleType: DEP_G },
        { title: '키오스크품절관리(휴)', icon: '🛑', route: '/(admin)/kioskSoldOut', roleType: DEP_R },
      ],
    },
    {
      key: 'purchase',
      title: '매입',
      icon: '🧾',
      children: [
                { title: '일자별 매입현황(휴)', icon: '📝', route: '/(admin)/purchaseDailyReport', roleType: DEP_R },
        { title: '일자별 매입현황(통합)', icon: '📝', route: '/(admin)/purchaseDailyReport', roleType: DEP_OP },
        { title: '일자별 매입현황(주)', icon: '📝', route: '/(admin)/purchaseDailyReport', roleType: DEP_G },
        { title: '상품별 매입현황(휴)',  icon: '📄', route: '/(admin)/purchaseProductReport' as Href, roleType: DEP_R },
      ],
    },
    {
      key: 'sales',
      title: '매출',
      icon: '💸',
      children: [
        { title: '실시간 매장매출현황(휴)', icon: '⚡️', route: '/(admin)/realtimeSales' as Href, roleType: DEP_OP },
        { title: '실시간 매출현황(휴)', icon: '⚡️', route: '/(admin)/realtimeSales' as Href, roleType: DEP_R },
        { title: '실시간 매출현황(주)', icon: '⚡️', route: '/(admin)/realtimeSales' as Href, roleType: DEP_OP },
        { title: '실시간 매출현황(주)', icon: '⚡️', route: '/(admin)/realtimeSales' as Href, roleType: DEP_G },
        { title: '실시간 매출현황(통합)', icon: '⚡️', route: '/(admin)/realtimeSales' as Href, roleType: DEP_OP },
        { title: '시간대별 매출현황(휴)', icon: '⏱️', route: '/(admin)/saleReportByTimezone', roleType: DEP_R },
        { title: '시간대별 매출현황(주)', icon: '⏱️', route: '/(admin)/dashboard', roleType: DEP_G},
        { title: '기간별 매출현황(휴)', icon: '🗓️', route: '/(admin)/salesReportByPeriod', roleType: DEP_R },
        { title: '기간별 매출현황(주)', icon: '🗓️', route: '/(admin)/dashboard', roleType: DEP_G },
        { title: '기간별 매출현황(통합)', icon: '🗓️', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: '시간대별 매출현황(통합)', icon: '🗓️', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: '기간별모바일주문현황(휴)', icon: '🗓️', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: '실시간 매출현황(통합비율)', icon: '🗓️', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: '월 매출현황(휴)', icon: '📅', route: '/(admin)/monthlySalesReport', roleType: DEP_R },
        { title: '시설별 실시간 매출(통합)', icon: '🏗️', route: '/(admin)/dashboard', roleType: DEP_G },
        { title: '시설별 실시간 매출(통합)', icon: '🏗️', route: '/(admin)/realtimeSalesBySalesOrg', roleType: DEP_R },
        { title: '실시간 매장매출현황(휴)', icon: '🏪', route: '/(admin)/realtimeSalesByCorner', roleType: DEP_R },
      ],
    },
    {
      key: 'stock',
      title: '재고',
      icon: '📦',
      children: [
        { title: '재고현황(통합)', icon: '📝', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: '재고현황(주)', icon: '📝', route: '/(admin)/dashboard', roleType: DEP_G },
        { title: '실시간 재고현황(주)', icon: '📝', route: '/(admin)/dashboard', roleType: DEP_G },
        { title: '매장 재고현황(휴)', icon: '📝', route: '/(admin)/cornerStockReport', roleType: DEP_R },
        { title: '창고 재고현황(휴)',  icon: '📊', route: '/(admin)/warehouseStockReport', roleType: DEP_R },
        { title: '매장 창고 재고현황(휴)',  icon: '📊', route: '/(admin)/dashboard', roleType: DEP_R },
      ],
    },
    {
      key: 'tlg',
      title: 'TLG',
      icon: '📦',
      children: [
        { title: 'TLG현황(통합)', icon: '📝', route: '/(admin)/dashboard', roleType: DEP_OP },
        { title: 'TLG현황(통합)', icon: '📝', route: '/(admin)/dashboard', roleType: DEP_G },
      ],
    },
    ], []);

  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // 사용자의 roleType에 따라 메뉴를 필터링
  const filteredMenuGroups = useMemo(() => {
    if (!user) return [];

    return menuGroups.map(group => ({
      ...group,
      children: group.children.filter(item => {
        // roleType이 비어있으면 모든 사용자에게 표시
        if (item.roleType === '') return true;
        // all_except_001인 경우 001이 아닌 모든 사용자에게 표시
        if (item.roleType === 'all_except_001') return user.roleType !== DEP_OP;
        // 사용자의 roleType과 일치하는 메뉴만 표시
        return item.roleType === user.roleType;
      })
    })).filter(group => group.children.length > 0); // 자식 메뉴가 없는 그룹은 제거
  }, [user, menuGroups]);

  const toggleGroup = (key: string) => {
    setExpandedGroup(prev => (prev === key ? null : key));
  };

  const { logout } = useUser();

  const handleLogout = () => {
    // 여기에 로그아웃 로직을 구현하세요
    console.log('로그아웃');
    logout();
    router.replace('/(auth)/login');
  };

  const handleMenuPress = (route: Href) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>관리자님, 환영합니다!</Text>
          <Text style={styles.subtitle}>관리자 패널에 오신 것을 환영합니다</Text>
        </View>

        <View style={styles.menuContainer}>
          {filteredMenuGroups.map(group => (
            <View key={group.key} style={styles.groupContainer}>
              <TouchableOpacity style={styles.groupHeader} onPress={() => toggleGroup(group.key)}>
                <View style={styles.menuIcon}>
                  <Text style={styles.iconText}>{group.icon}</Text>
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{group.title}</Text>
                </View>
                <Text style={styles.groupArrow}>{expandedGroup === group.key ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {expandedGroup === group.key && (
                <View style={styles.childList}>
                  {group.children.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.childItem}
                      onPress={() => handleMenuPress(item.route)}
                    >
                      <View style={styles.childIcon}>
                        <Text style={styles.childIconText}>{item.icon}</Text>
                      </View>
                      <View style={styles.childContent}>
                        <Text style={styles.childTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>


        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>

      </ScrollView>
      <View style={styles.footerContainer}>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => console.log('이용약관')}>
              <Text style={styles.footerLinkText}>이용약관/개인정보처리방침</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.copyrightText}>
            COPYRIGHT 2025 Secta9ine. ALL RIGHTS RESERVED.
          </Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  menuContainer: {
    marginBottom: 32,
  },
  groupContainer: {
    marginBottom: 0,
  },
  groupHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupArrow: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  childList: {
    marginLeft: 66,
  },
  childItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  childIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  childIconText: {
    fontSize: 18,
  },
  childContent: {
    flex: 1,
  },
  childTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  childDescription: {
    fontSize: 13,
    color: '#666',
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f8f8f8', // 배경색 지정
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0', // 상단 경계선 지정
    marginTop: 20, // 상단 마진으로 메뉴 그룹과 분리
  },
  footerLinks: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  footerLinkText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
  footerSeparator: {
    fontSize: 12,
    color: '#666',
  },
  copyrightText: {
    fontSize: 10,
    color: '#999',
  },
});
