import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as api from "../../services/api/api";
import {Table} from "../../components/Table";

type CornerRow = {
  no: number;
  cornerNm: string;
  cornerCd: string;
  posGroup: string;
  useYn: 'Y' | 'N';
};

type OperateFilter = '전체' | '운영' | '폐점';

export default function DashboardScreen() {
  const [operateFilter, setOperateFilter] = useState<OperateFilter>('전체');
  const [submittedFilter, setSubmittedFilter] = useState<OperateFilter>('전체');
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedCorner, setSelectedCorner] = useState<CornerRow | null>(null);

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
  const baseData: CornerRow[] = useMemo(() => {
    const rows: CornerRow[] = [];
    for (let i = 1; i <= 30; i += 1) {
      rows.push({
        no: i,
        cornerNm: `매장 ${i.toString().padStart(2, '0')}`,
        cornerCd: `S${(1000 + i).toString()}`,
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

  const openDetail = (store: CornerRow) => {
    setSelectedCorner(store);
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

  const mainColumns: ColumnDef<CornerRow>[] = useMemo(() => ([
    { key: 'no',       title: 'No',     flex: 0.8, align: 'center' },
    { key: 'cornerNm',     title: '매장명',   flex: 2,   align: 'left',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
            <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.cornerNm}</Text>
          </Pressable>
      ),   },
    { key: 'cornerCd',     title: '코드',    flex: 1.2, align: 'center' },
    { key: 'posGroup', title: '포스그룹', flex: 1.5, align: 'left'   },
    { key: 'useYn',    title: '사용여부', flex: 1,   align: 'center',
      renderCell: (item) => (
          <Text style={[commonStyles.cell, {textAlign:'center'}]}>
            {item.useYn ==='Y' ? '운영' : '폐점'}
          </Text>
      )
    },
  ]), []);

  type ItemRow = { no: number; itemCd: string; itemName: string };
  const itemData: ItemRow[] = useMemo(
    () => Array.from({ length: 205 }).map((_, index) => ({
      no: index + 1,
      itemCd: `P${1001 + index}`,
      itemName: `상품 ${index + 1}`,
    })),
    []
  );

  const itemColumns: ColumnDef<ItemRow>[] = useMemo(() => ([
    { key: 'no',          title: 'No',     flex: 0.4, align: 'center' },
    { key: 'itemCd', title: '상품코드',  flex: 1.8, align: 'left' },
    { key: 'itemName', title: '상품명',   flex: 2.2, align: 'left'   },
  ]), []);

  const CornerNmRow = () => {
    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
          <Text style={styles.modalCornerNm}>{selectedCorner?.cornerNm}</Text>
        </View>
    );
  };
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

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>매장 취급상품</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={20} color="#333" />
              </Pressable>
            </View>

            <Table data={itemData} columns={itemColumns} isModal={true} listHeader={CornerNmRow}/>
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
  modalCornerNm: {
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
});
