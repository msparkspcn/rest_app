import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {commonStyles} from "../../styles/index";
import {formattedDate, getTodayString} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";

type PurchaseRow = { no: number; itemNm: string; qty: number; amount: number };
type PurchaseDetailRow = {vendorNm: string, date: string, qty: number, totalAmt: number};
export default function PurchaseProductReportScreen() {
  const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayString());
  const [toPurchaseDt, setToPurchaseDt] = useState(getTodayString());
  const [productQuery, setProductQuery] = useState('');
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedItemNm, setSelectedItemNm] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };
  const parseDate = (s: string) => {
    const [y, m, d] = s.split('/').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const baseData: PurchaseRow[] = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, idx) => {
        const qty = ((idx % 5) + 1) * 2;
        const price = 1000 + (idx % 7) * 250;
        return {
          no: idx + 1,
          itemNm: `상품 ${idx + 1}`,
          qty: qty,
          amount: qty * price,
        };
      }),
    []
  );

  const filteredData = useMemo(() => {
    return baseData
  }, [baseData]);

  const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

  const onSearch = () => {};

    const openDatePicker = (pickerType: string) => {
        setTempDate(parseDate(formattedDate(getTodayString())));
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        { key: 'no',       title: 'No',     flex: 0.5, align: 'center' },
        { key: 'itemNm',       title: '상품명',     flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openProductDetail(item.itemNm) }>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft:10}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        { key: 'qty',     title: '수량',   flex: 0.5,   align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.amount.toLocaleString()}</Text>
            )
        },
        { key: 'amount',    title: '금액', flex: 0.8,   align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.amount.toLocaleString()}</Text>
            )
        },
    ]), []);

    const totalQty = useMemo(() => filteredData.reduce((acc, r) => acc + r.qty, 0), [filteredData]);

  const renderFooter = () => (
    <View style={[commonStyles.tableRow, styles.totalRow]}>
        <View style={[{flex: 1.7}, commonStyles.cell, styles.totalText]}>
            <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText]}>합계</Text>
        </View>
        <View style={{flex:0.5}}>
            <Text style={[commonStyles.cell, commonStyles.alignRight, styles.totalText,{paddingRight:10}]}>
                {totalQty}
            </Text>
        </View>
        <View style={{flex: 0.8}}>
            <Text style={[commonStyles.cell, commonStyles.alignRight, styles.totalText,{paddingRight:10}]}>
                {totalAmount.toLocaleString()}
            </Text>
        </View>
    </View>
  );

  const openProductDetail = (productName: string) => {
    setSelectedItemNm(productName);
    setIsDetailVisible(true);
  };


  const detailData: PurchaseDetailRow[] = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, idx) => {
        const qty = (idx % 4) + 1;
        const totalAmt = qty * 10000;
        const day = (idx % 4) + 1;
        return {
            vendorNm: `거래처 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
            date: `2025/08/0${day}`,
            qty:qty,
            totalAmt:totalAmt,
        };
      }),
    []
  );

  const detailTotals = useMemo(
    () =>
      detailData.reduce(
        (acc, r) => {
          acc.qty += r.qty;
          acc.amount += r.totalAmt;
          return acc;
        },
        { qty: 0, amount: 0 }
      ),
    [detailData]
  );

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        { key: 'vendorNm', title: '거래처',   flex: 2, align: 'center' },
        { key: 'date', title: '일자',   flex: 1.2, align: 'center' },
        { key: 'qty', title: '수량',   flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,{textAlign:'right'}]}>{item.qty.toLocaleString()}</Text>
            )
        },
        { key: 'totalAmt', title: '금액',   flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,{textAlign:'right'}]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);


    const renderDetailFooter = () => (
    <View style={[commonStyles.modalTableRow, styles.modalTotalRow]}>
        <View style={{flex:3.2}}>
            <Text style={[commonStyles.modalCell, commonStyles.alignCenter, styles.modalTotalText]}>합계</Text>
        </View>
        <View style={{flex:0.5}}>
            <Text style={[commonStyles.modalCell, commonStyles.alignRight, styles.modalTotalText]}>{detailTotals.qty.toLocaleString()}</Text>
        </View>
        <View style={{flex:1.5}}>
            <Text style={[commonStyles.modalCell, commonStyles.alignRight, styles.modalTotalText]}>
                {detailTotals.amount.toLocaleString()}
            </Text>
        </View>
      </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
        <StatusBar style="dark" />

        <View style={commonStyles.topBar}>
            <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
                <Text style={commonStyles.filterLabel}>조회일자</Text>
                <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                    <Text style={styles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                    <Text style={commonStyles.selectArrow}> ▼</Text>
                </TouchableOpacity>
                <Text style={styles.tilde}>~</Text>
                <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                    <Text style={styles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                    <Text style={commonStyles.selectArrow}> ▼</Text>
                </TouchableOpacity>
            </View>

            <View style={commonStyles.filterRow}>
              <Text style={commonStyles.filterLabel}>상품명</Text>
              <TextInput
                style={styles.input}
                placeholder="상품명 입력"
                placeholderTextColor="#999"
                value={productQuery}
                onChangeText={setProductQuery}
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                <Text style={commonStyles.searchButtonText}>조회</Text>
              </Pressable>
            </View>
        </View>

        <View style={commonStyles.sectionDivider} />

        <Table data={filteredData} columns={mainColumns} listFooter={renderFooter}/>

      <Modal
          visible={showDatePicker}
          transparent animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={commonStyles.dateModalOverlay}>
          <View style={commonStyles.dateModalCard}>
            <View style={commonStyles.dateModalHeader}>
              <Text style={commonStyles.dateModalTitle}>조회일자 선택</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={commonStyles.dateModalPickerContainer}>
              {tempDate && (
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                        setTempDate(date);
                    }
                  }}
                />
              )}
            </View>
            <View style={commonStyles.modalActions}>
              <Pressable
                style={commonStyles.modalOkButton}
                onPress={() => {
                    if(tempDate) {
                        if (currentPickerType === 'from') {
                            console.log('from Date:'+tempDate)
                            setFromPurchaseDt(formatDate(tempDate));
                        } else if (currentPickerType === 'to') {
                            setToPurchaseDt(formatDate(tempDate));
                        }
                    }
                    setShowDatePicker(false);
                }}
              >
                <Text style={commonStyles.modalOkButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isDetailVisible} transparent animationType="fade" onRequestClose={() => setIsDetailVisible(false)}>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              {selectedItemNm && <Text style={commonStyles.modalTitle}>{selectedItemNm}</Text>}
              <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

              <Table
                  data={detailData}
                  columns={PurchaseDetailColumns}
                  isModal={true}
                  listFooter={renderDetailFooter}
              />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterRowSpacing: { marginBottom: 10 },
  tilde: { color: '#666' },
  input: { flex: 1, height: 40, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, color: '#333' },
  selectInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexGrow: 1, flexBasis: 0 },
  selectText: { fontSize: 14, color: '#333' },
  headerCell: { fontSize: 13, fontWeight: '700', color: '#333' },
  totalRow: { backgroundColor: '#fafafa' },
  totalText: { fontWeight: '700', color: '#222' },
  linkText: { color: '#007AFF', textDecorationLine: 'underline' },
  productNamePressable: { flex: 2 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: '80%' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  modalClose: { fontSize: 18, color: '#666' },
  modalPickerContainer: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  modalActions: { padding: 12, alignItems: 'flex-end' },
  modalOkButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  modalOkButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalTotalRow: { backgroundColor: '#fafafa' },
  modalTotalText: { fontWeight: '700', color: '#222' },
});


