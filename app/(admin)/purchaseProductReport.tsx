import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Row = { no: number; product: string; qty: number; amount: number };

export default function PurchaseProductReportScreen() {
  const [fromDate, setFromDate] = useState('2025/08/01');
  const [toDate, setToDate] = useState('2025/08/04');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
  const [tempToDate, setTempToDate] = useState<Date | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [submitted, setSubmitted] = useState({ from: '2025/08/01', to: '2025/08/04', product: '' });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };
  const parseDate = (s: string) => {
    const [y, m, d] = s.split('/').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const baseData: Row[] = useMemo(
    () =>
      Array.from({ length: 50 }).map((_, idx) => {
        const qty = ((idx % 5) + 1) * 2;
        const price = 1000 + (idx % 7) * 250;
        return {
          no: idx + 1,
          product: `상품 ${idx + 1}`,
          qty,
          amount: qty * price,
        };
      }),
    []
  );

  const filteredData = useMemo(() => {
    const q = submitted.product.trim();
    return baseData.filter(r => (q.length === 0 ? true : r.product.includes(q)));
  }, [baseData, submitted]);

  const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

  const onSearch = () => {
    setSubmitted({ from: fromDate, to: toDate, product: productQuery });
  };

  const openFromPicker = () => {
    setTempFromDate(parseDate(fromDate));
    setShowFromPicker(true);
  };
  const openToPicker = () => {
    setTempToDate(parseDate(toDate));
    setShowToPicker(true);
  };

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, styles.colNo]}>No</Text>
      <Text style={[styles.headerCell, styles.colProduct]}>상품명</Text>
      <Text style={[styles.headerCell, styles.colQty]}>수량</Text>
      <Text style={[styles.headerCell, styles.colAmount]}>금액</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Row }) => (
    <View style={styles.tableRow}>
      <Text style={[styles.cell, styles.colNo]}>{item.no}</Text>
      <Pressable style={styles.productNamePressable} onPress={() => openProductDetail(item.product)}>
        <Text style={[styles.cell, styles.colProduct, styles.linkText]}>{item.product}</Text>
      </Pressable>
      <Text style={[styles.cell, styles.colQty]}>{item.qty}</Text>
      <Text style={[styles.cell, styles.colAmount]}>{item.amount.toLocaleString()}</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={[styles.tableRow, styles.totalRow]}>
      <Text style={[styles.cell, styles.colNo, styles.totalText]}>합계</Text>
      <Text style={[styles.cell, styles.colProduct]} />
      <Text style={[styles.cell, styles.colQty]} />
      <Text style={[styles.cell, styles.colAmount, styles.totalText]}>{totalAmount.toLocaleString()}</Text>
    </View>
  );

  const openProductDetail = (productName: string) => {
    setSelectedProductName(productName);
    setIsDetailVisible(true);
  };

  type DetailRow = { no: number; vendor: string; date: string; qty: number; amount: number };
  const detailData: DetailRow[] = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, idx) => {
        const qty = (idx % 4) + 1;
        const price = 1500 + (idx % 5) * 400;
        const amount = qty * price;
        const day = (idx % 4) + 1;
        return {
          no: idx + 1,
          vendor: `거래처 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
          date: `2025/08/0${day}`,
          qty,
          amount,
        };
      }),
    []
  );

  const detailTotals = useMemo(
    () =>
      detailData.reduce(
        (acc, r) => {
          acc.qty += r.qty;
          acc.amount += r.amount;
          return acc;
        },
        { qty: 0, amount: 0 }
      ),
    [detailData]
  );

  const renderDetailHeader = () => (
    <View style={styles.modalTableHeaderRow}>
      <Text style={[styles.modalHeaderCell, styles.modalColVendor]}>거래처</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColDate]}>일자</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColQty]}>수량</Text>
      <Text style={[styles.modalHeaderCell, styles.modalColAmount]}>금액</Text>
    </View>
  );

  const renderDetailItem = ({ item }: { item: DetailRow }) => (
    <View style={styles.modalTableRow}>
      <Text style={[styles.modalCell, styles.modalColVendor]}>{item.vendor}</Text>
      <Text style={[styles.modalCell, styles.modalColDate]}>{item.date}</Text>
      <Text style={[styles.modalCell, styles.modalColQty]}>{item.qty}</Text>
      <Text style={[styles.modalCell, styles.modalColAmount]}>{item.amount.toLocaleString()}</Text>
    </View>
  );

  const renderDetailFooter = () => (
    <View style={[styles.modalTableRow, styles.modalTotalRow]}>
      <Text style={[styles.modalCell, styles.modalColVendor, styles.modalTotalText]}>합계</Text>
      <Text style={[styles.modalCell, styles.modalColDate]} />
      <Text style={[styles.modalCell, styles.modalColQty, styles.modalTotalText]}>{detailTotals.qty.toLocaleString()}</Text>
      <Text style={[styles.modalCell, styles.modalColAmount, styles.modalTotalText]}>{detailTotals.amount.toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <View style={[styles.filterRow, styles.filterRowSpacing]}>
          <Text style={styles.filterLabel}>조회일자</Text>
          <TouchableOpacity style={styles.selectInput} onPress={openFromPicker}>
            <Text style={styles.selectText}>{fromDate}</Text>
            <Text style={styles.selectArrow}> ▼</Text>
          </TouchableOpacity>
          <Text style={styles.tilde}>~</Text>
          <TouchableOpacity style={styles.selectInput} onPress={openToPicker}>
            <Text style={styles.selectText}>{toDate}</Text>
            <Text style={styles.selectArrow}> ▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>상품명</Text>
          <TextInput
            style={styles.input}
            placeholder="상품명 입력"
            placeholderTextColor="#999"
            value={productQuery}
            onChangeText={setProductQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
          <Pressable style={styles.searchButton} onPress={onSearch}>
            <Text style={styles.searchButtonText}>조회</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.tableContainer}>
        {renderHeader()}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => String(item.no)}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          style={styles.tableList}
          contentContainerStyle={styles.tableListContent}
          showsVerticalScrollIndicator
        />
      </View>

      {/* From Picker */}
      <Modal visible={showFromPicker} transparent animationType="slide" onRequestClose={() => setShowFromPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>시작일 선택</Text>
              <TouchableOpacity onPress={() => setShowFromPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalPickerContainer}>
              {tempFromDate && (
                <DateTimePicker
                  value={tempFromDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                      setTempFromDate(date);
                    }
                  }}
                />
              )}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalOkButton}
                onPress={() => {
                  if (tempFromDate) setFromDate(formatDate(tempFromDate));
                  setShowFromPicker(false);
                }}
              >
                <Text style={styles.modalOkButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* To Picker */}
      <Modal visible={showToPicker} transparent animationType="slide" onRequestClose={() => setShowToPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>종료일 선택</Text>
              <TouchableOpacity onPress={() => setShowToPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalPickerContainer}>
              {tempToDate && (
                <DateTimePicker
                  value={tempToDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                      setTempToDate(date);
                    }
                  }}
                />
              )}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalOkButton}
                onPress={() => {
                  if (tempToDate) setToDate(formatDate(tempToDate));
                  setShowToPicker(false);
                }}
              >
                <Text style={styles.modalOkButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* 상품 상세 모달 */}
      <Modal visible={isDetailVisible} transparent animationType="fade" onRequestClose={() => setIsDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              {selectedProductName && <Text style={styles.modalTitle}>{selectedProductName}</Text>}
              <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderDetailHeader()}
            <FlatList
              data={detailData}
              keyExtractor={(item) => String(item.no)}
              renderItem={renderDetailItem}
              ListFooterComponent={renderDetailFooter}
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, backgroundColor: '#f5f5f5' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterRowSpacing: { marginBottom: 10 },
  filterLabel: { fontSize: 14, color: '#555', marginRight: 8, width: 50 },
  tilde: { color: '#666' },
  input: { flex: 1, height: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, color: '#333' },
  selectInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1, flexBasis: 0 },
  selectText: { fontSize: 14, color: '#333' },
  selectArrow: { fontSize: 12, color: '#666' },
  searchButton: { marginLeft: 'auto', backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionDivider: { height: 2, backgroundColor: '#b0b0b0' },
  tableContainer: { flex: 1, backgroundColor: '#fff', marginHorizontal: 20, marginTop: 10, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f0f3f7', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0', paddingVertical: 10, paddingHorizontal: 12 },
  headerCell: { fontSize: 13, fontWeight: '700', color: '#333' },
  tableList: { flex: 1 },
  tableListContent: { paddingHorizontal: 12, paddingBottom: 12 },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', paddingVertical: 12 },
  cell: { fontSize: 13, color: '#444' },
  totalRow: { backgroundColor: '#fafafa' },
  totalText: { fontWeight: '700', color: '#222' },
  colNo: { flex: 0.8 },
  colProduct: { flex: 2 },
  colQty: { flex: 1 },
  colAmount: { flex: 1.2, textAlign: 'right' },
  linkText: { color: '#007AFF', textDecorationLine: 'underline' },
  productNamePressable: { flex: 2 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  modalClose: { fontSize: 18, color: '#666' },
  modalPickerContainer: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  modalActions: { padding: 12, alignItems: 'flex-end' },
  modalOkButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  modalOkButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  // Modal table styles
  modalTableHeaderRow: { flexDirection: 'row', backgroundColor: '#f0f3f7', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0', paddingVertical: 8, paddingHorizontal: 12, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  modalHeaderCell: { fontSize: 13, fontWeight: '700', color: '#333' },
  modalTableList: { flex: 1, marginTop: 2 },
  modalTableListContent: { paddingHorizontal: 12, paddingBottom: 8 },
  modalTableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', paddingVertical: 10 },
  modalCell: { fontSize: 13, color: '#444' },
  modalTotalRow: { backgroundColor: '#fafafa' },
  modalTotalText: { fontWeight: '700', color: '#222' },
  modalColVendor: { flex: 1.5 },
  modalColDate: { flex: 1.2 },
  modalColQty: { flex: 0.8 },
  modalColAmount: { flex: 1.2 },
});


