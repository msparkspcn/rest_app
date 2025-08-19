import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type StoreOption = { id: string; name: string };
type ProductRow = { no: number; name: string; useYn: 'Y' | 'N' };

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
        no: index + 1,
        name: `상품 ${index + 1}`,
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

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, styles.colNo]}>No</Text>
      <Text style={[styles.headerCell, styles.colName]}>상품명</Text>
      <Text style={[styles.headerCell, styles.colUseYn]}>출력여부</Text>
    </View>
  );

  const renderItem = ({ item }: { item: ProductRow }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, styles.colNo]}>{item.no}</Text>
      <Text style={[styles.cell, styles.colName]}>{item.name}</Text>
      <Text style={[styles.cell, styles.colUseYn]}>{item.useYn === 'Y' ? '출력' : '품절'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 상단 필터 영역 */}
      <View style={styles.topBar}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>매장</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowStoreModal(true)}
          >
            <Text style={[styles.selectText, !selectedStoreId && styles.placeholderText]}>
              {stores.find((s) => s.id === selectedStoreId)?.name || '선택'}
            </Text>
            <Text style={styles.selectArrow}>▼</Text>
          </TouchableOpacity>
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
      {/* 매장 선택 Modal */}
      <Modal
        visible={showStoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>매장 선택</Text>
              <TouchableOpacity onPress={() => setShowStoreModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={stores}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#f5f5f5',
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
  selectArrow: {
    fontSize: 12,
    color: '#666',
  },
  searchButton: {
    marginLeft: 'auto',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionDivider: {
    height: 2,
    backgroundColor: '#b0b0b0',
  },
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
  colNo: {
    flex: 0.7,
  },
  colName: {
    flex: 2.2,
  },
  colUseYn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalClose: {
    fontSize: 20,
    color: '#666',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});


