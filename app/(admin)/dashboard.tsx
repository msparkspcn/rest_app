import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type StoreRow = {
  no: number;
  name: string;
  code: string;
  posGroup: string;
  useYn: 'Y' | 'N';
};

type OperateFilter = '전체' | '운영' | '폐점';

export default function DashboardScreen() {
  const [operateFilter, setOperateFilter] = useState<OperateFilter>('전체');
  const [submittedFilter, setSubmittedFilter] = useState<OperateFilter>('전체');
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);

  // 테스트 데이터 생성
  const baseData: StoreRow[] = useMemo(() => {
    const rows: StoreRow[] = [];
    for (let i = 1; i <= 40; i += 1) {
      rows.push({
        no: i,
        name: `매장 ${i.toString().padStart(2, '0')}`,
        code: `S${(1000 + i).toString()}`,
        posGroup: `그룹 ${((i % 5) + 1).toString()}`,
        useYn: i % 3 === 0 ? 'N' : 'Y',
      });
    }
    return rows;
  }, []);

  const filteredData = useMemo(() => {
    if (submittedFilter === '전체') return baseData;
    if (submittedFilter === '운영') return baseData.filter(r => r.useYn === 'Y');
    return baseData.filter(r => r.useYn === 'N');
  }, [baseData, submittedFilter]);

  const onSearch = () => {
    setSubmittedFilter(operateFilter);
  };

  // 전역 푸터 사용으로 지역 초기화 핸들러는 현재 미사용입니다.

  const openDetail = (store: StoreRow) => {
    setSelectedStore(store);
    setIsDetailVisible(true);
  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, styles.colNo]}>No</Text>
      <Text style={[styles.headerCell, styles.colName]}>매장명</Text>
      <Text style={[styles.headerCell, styles.colCode]}>코드</Text>
      <Text style={[styles.headerCell, styles.colPosGroup]}>포스그룹</Text>
      <Text style={[styles.headerCell, styles.colUseYn]}>사용여부</Text>
    </View>
  );

  const renderItem = ({ item }: { item: StoreRow }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, styles.colNo]}>{item.no}</Text>
      <Pressable style={styles.storeNamePressable} onPress={() => openDetail(item)}>
        <Text style={[styles.cell, styles.colName, styles.linkText]}>{item.name}</Text>
      </Pressable>
      <Text style={[styles.cell, styles.colCode]}>{item.code}</Text>
      <Text style={[styles.cell, styles.colPosGroup]}>{item.posGroup}</Text>
      <Text style={[styles.cell, styles.colUseYn]}>{item.useYn === 'Y' ? '운영' : '폐점'}</Text>
    </View>
  );

  type ProductRow = { no: number; productCode: string; productName: string };
  const productData: ProductRow[] = useMemo(
    () => Array.from({ length: 205 }).map((_, index) => ({
      no: index + 1,
      productCode: `P${1001 + index}`,
      productName: `상품 ${index + 1}`,
    })),
    []
  );

  const renderProductHeader = () => (
    <View style={styles.modalTableHeaderRow}>
      <Text style={[styles.modalHeaderCell, styles.modalColNo]}>No</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColCode]}>상품코드</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColName]}>상품명</Text>
    </View>
  );

  const renderProductItem = ({ item }: { item: ProductRow }) => (
    <View style={styles.modalTableRow}>
      <Text style={[styles.modalCell, styles.modalColNo]}>{item.no}</Text>
      <Text style={[styles.modalCell, styles.modalColCode]}>{item.productCode}</Text>
      <Text style={[styles.modalCell, styles.modalColName]}>{item.productName}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 상단 필터 영역 */}
      <View style={styles.topBar}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>운영여부</Text>
          <View style={styles.segmented}>
            {(['전체', '운영', '폐점'] as OperateFilter[]).map(option => (
              <Pressable
                key={option}
                onPress={() => setOperateFilter(option)}
                style={[styles.segmentItem, operateFilter === option && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, operateFilter === option && styles.segmentTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.searchButton} onPress={onSearch}>
            <Text style={styles.searchButtonText}>조회</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.sectionDivider} />

      {/* 그리드 영역 */}
      <View style={styles.tableContainer}>
        {renderHeader()}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.no)}
          renderItem={renderItem}
          style={styles.tableList}
          contentContainerStyle={styles.tableListContent}
          showsVerticalScrollIndicator
        />
      </View>

      <View style={styles.sectionDivider} />

      {/* 전역 레이아웃의 푸터를 사용합니다. */}
      
      {/* 상세 모달 */}
      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>매장 취급상품</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={20} color="#333" />
              </Pressable>
            </View>

            {renderProductHeader()}
            {selectedStore && (
              <Text style={styles.modalStoreName}>{selectedStore.name}</Text>
            )}

            <FlatList
              data={productData}
              keyExtractor={(item) => String(item.no)}
              renderItem={renderProductItem}
              style={styles.modalTableList}
              contentContainerStyle={styles.modalTableListContent}
              showsVerticalScrollIndicator
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // 상단
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 4,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#b0b0b0',
    // marginHorizontal: 20,
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  segmentItemActive: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    color: '#333',
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  searchButton: {
    marginLeft: 'auto',
    backgroundColor: '#007AFF',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // 테이블
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f3f7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  tableList: {
    flex: 1,
  },
  tableListContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  cell: {
    fontSize: 13,
    color: '#444',
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  storeNamePressable: {
    flex: 2,
  },
  colNo: {
    flex: 0.7,
  },
  colName: {
    flex: 2,
  },
  colCode: {
    flex: 1.2,
  },
  colPosGroup: {
    flex: 1.5,
  },
  colUseYn: {
    flex: 1,
  },

  // 푸터
  footer: {
    flexDirection: 'row',
    paddingVertical: 10,
    marginHorizontal: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
  },
  footerTextButton: {
    paddingHorizontal: 20,
  },
  footerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerSeparator: {
    width: 1,
    height: 18,
    backgroundColor: '#b0b0b0',
    alignSelf: 'center',
  },
  footerText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  footerTextDanger: {
    color: '#FF3B30',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalStoreName: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f3f7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  modalHeaderCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  modalTableList: {
    flex: 1,
    marginTop: 2,
  },
  modalTableListContent: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  modalTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  modalCell: {
    fontSize: 13,
    color: '#444',
  },
  modalColNo: {
    flex: 0.7,
  },
  modalColCode: {
    flex: 1.4,
  },
  modalColName: {
    flex: 2.2,
  },
});
