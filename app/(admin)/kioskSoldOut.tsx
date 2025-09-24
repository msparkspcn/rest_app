import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {Alert, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { commonStyles } from '@/styles';
import {Table} from "../../components/Table";
import Const from "../../constants/Const";

type StoreOption = { id: string; name: string };
type ProductRow = { itemNm: string; useYn: 'Y' | 'N' };

export default function KioskSoldOutScreen() {
  const stores: StoreOption[] = useMemo(
    () => Array.from({ length: 12 }).map((_, i) => ({ id: `S${100 + i}`, name: `매장 ${i + 1}` })),
    []
  );

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(stores[0]?.id ?? null);
  const [submittedStoreId, setSubmittedStoreId] = useState<string | null>(stores[0]?.id ?? null);
  const [showStoreModal, setShowStoreModal] = useState(false);

  const productData: ProductRow[] = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, index) => ({
        itemNm: `상품 ${index + 1}`,
        useYn: index % 3 === 0 ? 'N' : 'Y',
      })),
    []
  );

  const filteredData: ProductRow[] = useMemo(() => {
    // 데모: 매장에 따라 필터가 바뀌는 것처럼 보이도록 간단 변형
    if (!submittedStoreId) return productData;
    const offset = Number(submittedStoreId.replace(/\D/g, '')) % 2; // 짝/홀에 따라 N 비율 조금 다르게
    return productData.map(
      (p, idx): ProductRow => ({
        ...p,
        useYn: ((idx + offset) % 4 === 0 ? 'N' : 'Y') as 'Y' | 'N',
      })
    );
  }, [productData, submittedStoreId]);

  const onSearch = () => {
    setSubmittedStoreId(selectedStoreId);
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
  const mainColumns: ColumnDef<ProductRow>[] = useMemo(() => ([
    { key: 'no',       title: Const.NO,     flex: 0.3, align: 'center',
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'itemNm',     title: '상품명',   flex: 2,   align: 'left'   },
    { key: 'useYn',    title: '사용여부', flex: 0.5,   align: 'center',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => updateSoldoutYn() }>
            <Text style={[commonStyles.cell, commonStyles.linkText, {textAlign:'center'}]}>
              {item.useYn === 'Y' ? '출력' : '품절'}
            </Text>
          </Pressable>
      ),
    },
  ]), []);

  const updateSoldoutYn = () => {
    Alert.alert('완료', '완료되었습니다.');
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>매장</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowStoreModal(true)}
          >
            <Text style={[styles.selectText, !selectedStoreId && styles.placeholderText]}>
              {stores.find((s) => s.id === selectedStoreId)?.name || Const.SELECT}
            </Text>
            <Text style={commonStyles.selectArrow}>▼</Text>
          </TouchableOpacity>
          <Pressable style={commonStyles.searchButton} onPress={onSearch}>
            <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
          </Pressable>
        </View>
      </View>
      <View style={commonStyles.sectionDivider} />

      <Table data={filteredData} columns={mainColumns} />

      <Modal
        visible={showStoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStoreModal(false)}
      >
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalContent}>
            <View style={commonStyles.listModalHeader}>
              <Text style={commonStyles.modalTitle}>매장 선택</Text>
              <TouchableOpacity onPress={() => setShowStoreModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={stores}
              keyExtractor={(item) => item.id}
              style={commonStyles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedStoreId(item.id);
                    setShowStoreModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  selectInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
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

  modalClose: {
    fontSize: 20,
    color: '#666',
  },

  modalItem: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});
