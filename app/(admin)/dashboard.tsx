import { Ionicons } from '@expo/vector-icons';
// import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as api from "../../services/api/api";

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

  useEffect(() => {
    console.log('api 테스트1')
    getStoreInfo('5000511001','1234')
  })

  const getStoreInfo = (userId, password) => {
    api.login(userId, password)
        .then(response => {
          if (response.data.responseBody != null) {
            const userInfo = response.data.responseBody;
            console.log('userInfo:' + JSON.stringify(userInfo))
          }
        })
        .catch(error => console.log("userInfo error:"+error))
        .finally()
  }

  // 테스트 데이터 생성
  const baseData: StoreRow[] = useMemo(() => {
    const rows: StoreRow[] = [];
    for (let i = 1; i <= 30; i += 1) {
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

  type Align = 'left' | 'center' | 'right';
  type ColumnDef<T> = {
    key: keyof T | string;
    title: string;
    flex: number;
    align?: Align; // default align for both header and cell
    headerAlign?: Align; // overrides header align
    cellAlign?: Align;   // overrides cell align
  };

  const mainColumns: ColumnDef<StoreRow>[] = useMemo(() => ([
    { key: 'no',       title: 'No',     flex: 0.8, align: 'center' },
    { key: 'name',     title: '매장명',   flex: 2,   align: 'left'   },
    { key: 'code',     title: '코드',    flex: 1.2, align: 'center' },
    { key: 'posGroup', title: '포스그룹', flex: 1.5, align: 'left'   },
    { key: 'useYn',    title: '사용여부', flex: 1,   align: 'center' },
  ]), []);

  const alignStyles = {
    left: styles.alignLeft,
    center: styles.alignCenter,
    right: styles.alignRight,
  } as const;

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      {mainColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            styles.columnContainer,
            i < mainColumns.length - 1 && styles.headerCellDivider,
          ]}
        >
          <Text
            style={[
              styles.headerCell,
              alignStyles[col.headerAlign ?? col.align ?? 'left'],
            ]}
          >
            {col.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item, index }: { item: StoreRow; index: number }) => (
    <View style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
      {mainColumns.map((col, i) => {
        const value = col.key === 'useYn' ? (item.useYn === 'Y' ? '운영' : '폐점') : (item as any)[col.key];
        return (
          <View
            key={String(col.key)}
            style={[
              { flex: col.flex },
              styles.columnContainer,
              i < mainColumns.length - 1 && styles.cellDivider,
            ]}
          >
            {col.key === 'name' ? (
              <Pressable style={styles.columnPressable} onPress={() => openDetail(item)}>
                <Text
                  style={[
                    styles.cell,
                    alignStyles[col.cellAlign ?? col.align ?? 'left'],
                    styles.linkText,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ) : (
              <Text
                style={[
                  styles.cell,
                  alignStyles[col.cellAlign ?? col.align ?? 'left'],
                ]}
              >
                {value}
              </Text>
            )}
          </View>
        );
      })}
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

  const productColumns: ColumnDef<ProductRow>[] = useMemo(() => ([
    { key: 'no',          title: 'No',     flex: 0.7, align: 'center' },
    { key: 'productCode', title: '상품코드',  flex: 1.4, align: 'center' },
    { key: 'productName', title: '상품명',   flex: 2.2, align: 'left'   },
  ]), []);

  const renderProductHeader = () => (
    <View style={styles.modalTableHeaderRow}>
      {productColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            styles.modalColumnContainer,
            i < productColumns.length - 1 && styles.modalHeaderCellDivider,
          ]}
        >
          <Text
            style={[
              styles.modalHeaderCell,
              alignStyles[col.headerAlign ?? col.align ?? 'left'],
            ]}
          >
            {col.title}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderProductItem = ({ item, index }: { item: ProductRow; index: number }) => (
    <View style={[styles.modalTableRow, index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd]}>
      {productColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            styles.modalColumnContainer,
            i < productColumns.length - 1 && styles.modalCellDivider,
          ]}
        >
          <Text
            style={[
              styles.modalCell,
              alignStyles[col.cellAlign ?? col.align ?? 'left'],
            ]}
          >
            {(item as any)[col.key]}
          </Text>
        </View>
      ))}
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
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
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

            <View style={styles.modalTableContainer}>
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
                bounces={false}
                alwaysBounceVertical={false}
                overScrollMode="never"
                showsVerticalScrollIndicator
              />
            </View>
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
    paddingHorizontal: 10,
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
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 1,
    marginVertical: 4,
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
    marginHorizontal: 10,
    marginTop: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f3f7',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#b0b0b0',
    paddingRight: 10,
    marginRight: 10,
  },
  columnPressable: {
    flex: 1,
    justifyContent: 'center',
  },
  alignLeft: {
    textAlign: 'left',
  },
  alignCenter: {
    textAlign: 'center',
  },
  alignRight: {
    textAlign: 'right',
  },
  tableList: {
    flex: 1,
    backgroundColor: '#fff'
  },
  tableListContent: {
    backgroundColor: '#fff'
    // paddingBottom: 12,
  },
  columnContainer: {
    flexDirection: 'row',
    alignItems: 'center', // vertical center
    justifyContent: 'center',
    height: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowEven: {
    backgroundColor: '#ffffff',
  },
  tableRowOdd: {
    backgroundColor: '#fafafa',
  },
  cell: {
    fontSize: 12,
    color: '#444'
  },
  cellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#eee',
    paddingRight: 10,
    marginRight: 10,
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
    // De-emphasize footer on both platforms
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
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
    padding: 10,
  },
  modalCard: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#fff',
    padding: 10,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
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
  },
  modalHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    paddingRight: 8,
  },
  modalHeaderCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#b0b0b0',
    paddingRight: 10,
    marginRight: 10,
  },
  modalTableList: {
    flex: 1,
    marginTop: 2,
    backgroundColor: '#fff'
  },
  modalTableListContent: {
    paddingBottom: 8,
    backgroundColor: '#fff'
  },
  modalTableContainer: {
    flex:1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  modalColumnContainer: {
    flexDirection: 'row',
    alignItems: 'center', // vertical center
    justifyContent: 'center',
    height: '100%',
  },
  modalTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  modalCell: {
    fontSize: 12,
    color: '#444',
  },
  modalCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#eee',
    paddingRight: 10,
    marginRight: 10,
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
