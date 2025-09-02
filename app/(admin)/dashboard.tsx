import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as api from "../../services/api/api";
import {Table} from "../../components/Table";

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
    //api 호출 처리 필요
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
    align?: Align;
    headerAlign?: Align;
    cellAlign?: Align;
  };

  const mainColumns: ColumnDef<StoreRow>[] = useMemo(() => ([
    { key: 'no',       title: 'No',     flex: 0.8, align: 'center' },
    { key: 'name',     title: '매장명',   flex: 2,   align: 'left',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
            <Text style={[commonStyles.cell, commonStyles.linkText]}>{item.name}</Text>
          </Pressable>
      ),   },
    { key: 'code',     title: '코드',    flex: 1.2, align: 'center' },
    { key: 'posGroup', title: '포스그룹', flex: 1.5, align: 'left'   },
    { key: 'useYn',    title: '사용여부', flex: 1,   align: 'center' },
  ]), []);

  const alignStyles = {
    left: commonStyles.alignLeft,
    center: commonStyles.alignCenter,
    right: commonStyles.alignRight,
  } as const;

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
    { key: 'productCode', title: '상품코드',  flex: 1.4, align: 'left' },
    { key: 'productName', title: '상품명',   flex: 2.2, align: 'left'   },
  ]), []);

  const renderProductHeader = () => (
    <View style={commonStyles.modalTableHeaderRow}>
      {productColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            styles.modalHeaderContainer,
            i < productColumns.length - 1 && styles.modalHeaderCellDivider,
          ]}
        >
          <Text
            style={[
              commonStyles.modalHeaderCell,
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
    <View style={[commonStyles.modalTableRow, index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd]}>
      {productColumns.map((col, i) => (
        <View
          key={String(col.key)}
          style={[
            { flex: col.flex },
            commonStyles.modalColumnContainer,
            i < productColumns.length - 1 && commonStyles.modalCellDivider,
          ]}
        >
          <Text
            style={[
              commonStyles.modalCell,
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
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>운영여부</Text>
          <View style={commonStyles.segmented}>
            {(['전체', '운영', '폐점'] as OperateFilter[]).map(option => (
              <Pressable
                key={option}
                onPress={() => setOperateFilter(option)}
                style={[commonStyles.segmentItem, operateFilter === option && commonStyles.segmentItemActive]}
              >
                <Text style={[commonStyles.segmentText, operateFilter === option && commonStyles.segmentTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={commonStyles.searchButton} onPress={onSearch}>
            <Text style={commonStyles.searchButtonText}>조회</Text>
          </Pressable>
        </View>
      </View>
      <View style={commonStyles.sectionDivider} />

      <Table data={filteredData} columns={mainColumns}/>

      <View style={commonStyles.sectionDivider} />

      {/* 전역 레이아웃의 푸터를 사용합니다. */}

      {/* 상세 모달 */}
      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>매장 취급상품</Text>
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
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  headerCellDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#b0b0b0',
    paddingRight: 10,
    marginRight: 10,
  },

  tableList: {
    flex: 1,
    backgroundColor: '#fff'
  },
  tableListContent: {
    backgroundColor: '#fff'
    // paddingBottom: 12,
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
  modalStoreName: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  modalHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center', // vertical center
    justifyContent: 'center',
    height: '100%',
  },
});
