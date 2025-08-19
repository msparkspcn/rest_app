import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type VendorRow = {
  no: number;
  vendor: string;
  status: '등록' | '취소';
};

type RegisterFilter = '전체' | '등록' | '취소';

export default function VenderListScreen() {
  const [vendorQuery, setVendorQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('전체');
  const [submitted, setSubmitted] = useState<{ q: string; f: RegisterFilter }>({ q: '', f: '전체' });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);

  const baseData: VendorRow[] = useMemo(() => {
    return Array.from({ length: 20 }).map((_, index) => ({
      no: index + 1,
      vendor: `거래처 ${String(index + 1).padStart(2, '0')}`,
      status: index % 2 === 0 ? '등록' : '취소',
    }));
  }, []);

  const filteredData = useMemo(() => {
    const { q, f } = submitted;
    return baseData
      .filter((row) => (f === '전체' ? true : row.status === f))
      .filter((row) => (q.trim().length === 0 ? true : row.vendor.includes(q.trim())));
  }, [baseData, submitted]);

  const onSearch = () => {
    setSubmitted({ q: vendorQuery, f: registerFilter });
  };

  const openDetail = (vendor: VendorRow) => {
    setSelectedVendor(vendor);
    setIsDetailVisible(true);
  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  type VendorDetailRow = { no: number; code: string; name: string };
  const detailData: VendorDetailRow[] = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, index) => ({
        no: index + 1,
        code: `C${1000 + index}`,
        name: `명칭 ${index + 1}`,
      })),
    []
  );

  const renderDetailHeader = () => (
    <View style={styles.modalTableHeaderRow}>
      <Text style={[styles.modalHeaderCell, styles.modalColNo]}>No</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColCode]}>코드</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColName]}>명칭</Text>
    </View>
  );

  const renderDetailItem = ({ item }: { item: VendorDetailRow }) => (
    <View style={styles.modalTableRow}>
      <Text style={[styles.modalCell, styles.modalColNo]}>{item.no}</Text>
      <Text style={[styles.modalCell, styles.modalColCode]}>{item.code}</Text>
      <Text style={[styles.modalCell, styles.modalColName]}>{item.name}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, styles.colNo]}>No</Text>
      <Text style={[styles.headerCell, styles.colVendor]}>거래처</Text>
      <Text style={[styles.headerCell, styles.colStatus]}>상태</Text>
    </View>
  );

  const renderItem = ({ item }: { item: VendorRow }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, styles.colNo]}>{item.no}</Text>
      <Pressable style={styles.vendorNamePressable} onPress={() => openDetail(item)}>
        <Text style={[styles.cell, styles.colVendor, styles.linkText]}>{item.vendor}</Text>
      </Pressable>
      <Text style={[styles.cell, styles.colStatus]}>{item.status}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* 상단 필터 영역 */}
      <View style={styles.topBar}>
        {/* 1행: 거래처 입력 */}
        <View style={[styles.filterRow, styles.filterRowSpacing]}>
          <Text style={styles.filterLabel}>거래처</Text>
          <TextInput
            style={styles.input}
            placeholder="거래처 입력"
            placeholderTextColor="#999"
            value={vendorQuery}
            onChangeText={setVendorQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>

        {/* 2행: 등록여부 + 조회 */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>등록여부</Text>
          <View style={styles.segmented}>
            {(['전체', '등록', '취소'] as RegisterFilter[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => setRegisterFilter(option)}
                style={[styles.segmentItem, registerFilter === option && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, registerFilter === option && styles.segmentTextActive]}>
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
      {/* 전역 레이아웃의 푸터를 사용합니다. */}

      {/* 상세 모달 */}
      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>거래처 상세</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={20} color="#333" />
              </Pressable>
            </View>

            {renderDetailHeader()}
            {selectedVendor && (
              <Text style={styles.modalStoreName}>{selectedVendor.vendor}</Text>
            )}

            <FlatList
              data={detailData}
              keyExtractor={(item) => String(item.no)}
              renderItem={renderDetailItem}
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterRowSpacing: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    color: '#555',
  },
  filterLabelSpacing: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    padding: 4,
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
  colNo: {
    flex: 0.8,
  },
  colVendor: {
    flex: 2,
  },
  colStatus: {
    flex: 1,
  },
  vendorNamePressable: {
    flex: 2,
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


