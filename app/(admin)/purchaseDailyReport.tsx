import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {formattedDate, getTodayString} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";

type PurchaseRow = { date: string; vendor: string; amount: number };
type PurchaseDetailRow = {itemNm: string, qty: number, price: number, totalAmt: number};

export default function PurchaseDailyReportScreen() {
  const [fromPurchaseDt, setPurchaseDt] = useState(getTodayString());
  const [toPurchaseDt, setToPurchaseDt] = useState(getTodayString());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
  const [tempToDate, setTempToDate] = useState<Date | null>(null);
  const [vendorQuery, setVendorQuery] = useState('');
  const [submitted, setSubmitted] = useState({ from: '2025/08/01', to: '2025/08/04', vendor: '' });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);

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

  const baseData: PurchaseRow[] = useMemo(
    () => [
      { date: '2025/09/01', vendor: '거래처 A', amount: 120000 },
      { date: '2025/09/01', vendor: '거래처 B', amount: 80000 },
      { date: '2025/09/02', vendor: '거래처 A', amount: 60000 },
      { date: '2025/09/03', vendor: '거래처 C', amount: 150000 },
      { date: '2025/09/04', vendor: '거래처 A', amount: 90000 },
      { date: '2025/09/04', vendor: '거래처 D', amount: 50000 },
    ],
    []
  );

  const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
    { key: 'date',       title: '일자',     flex: 1, align: 'center' },
    { key: 'vendor',     title: '거래처',   flex: 2,   align: 'left',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openVendorDetail(item.vendor) }>
            <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft:10}]}>
              {item.vendor}
            </Text>
          </Pressable>
      ),
    },
    { key: 'amount',    title: '금액', flex: 1,   align: 'right',
      renderCell: (item) => (
          <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.amount.toLocaleString()}</Text>
      )
    },
  ]), []);

  const filteredData = useMemo(() => {
    const from = submitted.from.replace(/\//g, '');
    const to = submitted.to.replace(/\//g, '');
    const v = submitted.vendor.trim();
    return baseData
      .filter(r => r.date.replace(/\//g, '') >= from && r.date.replace(/\//g, '') <= to)
      .filter(r => (v.length === 0 ? true : r.vendor.includes(v)));
  }, [baseData, submitted]);

  const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

  const onSearch = () => {
    setSubmitted({ from: fromPurchaseDt, to: toPurchaseDt, vendor: vendorQuery });
  };

  const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
    { key: 'itemNm', title: '상품',   flex: 2.2, align: 'left' },
    { key: 'qty', title: '수량',   flex: 1, align: 'right' },
    { key: 'price', title: '단가',   flex: 1.5, align: 'right' },
    { key: 'totalAmt', title: '금액',   flex: 2.2, align: 'right' },
  ]), []);

  const renderFooter = () => (
    <View style={[commonStyles.tableRow, styles.totalRow]}>
      <View style={[{ flex: 3 }, commonStyles.cellDivider,]}>
        <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
          {fontSize: 13, fontWeight: 'bold'}]}>합계</Text>
      </View>
      <View>
        <Text style={[commonStyles.cell, styles.totalText, {paddingRight:10}]}>{totalAmount.toLocaleString()}</Text>
      </View>
    </View>
  );

  const renderDetailFooter = () => (
      <View style={[commonStyles.modalTableRow, styles.modalTotalRow]}>
        <View style={[{flex:2.2}, commonStyles.modalCellDivider]}>
          <Text style={[commonStyles.modalCell,  commonStyles.alignCenter, styles.modalTotalText]}>합계</Text>
        </View>
        <View style={[{flex:1}, commonStyles.modalCellDivider]}>
          <Text style={[commonStyles.modalCell, commonStyles.alignRight,styles.modalTotalText]}>
            {detailTotalQty.toLocaleString()}
          </Text>
        </View>
        <View style={[{flex:3.7}, commonStyles.modalCellDivider]}>
          <Text style={[commonStyles.modalCell, commonStyles.alignRight,styles.modalTotalText]}>
            {detailTotalAmount.toLocaleString()}
          </Text>
        </View>
      </View>
  );

  const openFromPicker = () => {
    setTempFromDate(parseDate(fromPurchaseDt));
    setShowFromPicker(true);
  };

  const openToPicker = () => {
    setTempToDate(parseDate(toPurchaseDt));
    setShowToPicker(true);
  };

  const openVendorDetail = (vendorName: string) => {
    setSelectedVendorName(vendorName);
    setIsDetailVisible(true);
  };

  type DetailRow = { no: number; itemNm: string; qty: number; price: number; totalAmt: number };
  const detailData: DetailRow[] = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, idx) => {
        const qty = (idx % 5) + 1;
        const price = 1200 + (idx % 7) * 300;
        return {
          no: idx + 1,
          itemNm: `상품 ${idx + 1}`,
          qty,
          price,
          totalAmt: qty * price,
        };
      }),
    []
  );

  const detailTotalAmount = useMemo(() => {
    return detailData.reduce((acc, row) => acc + row.totalAmt, 0);
  }, [detailData]);
  const detailTotalQty = useMemo(() => {
    return detailData.reduce((acc, row) => acc + row.qty, 0);
  }, [detailData]);

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
          <Text style={commonStyles.filterLabel}>조회일자</Text>
          <TouchableOpacity style={commonStyles.selectInput} onPress={openFromPicker}>
            <Text style={styles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
            <Text style={commonStyles.selectArrow}> ▼</Text>
          </TouchableOpacity>
          <Text style={styles.tilde}>~</Text>
          <TouchableOpacity style={commonStyles.selectInput} onPress={openToPicker}>
            <Text style={styles.selectText}>{formattedDate(toPurchaseDt)}</Text>
            <Text style={commonStyles.selectArrow}> ▼</Text>
          </TouchableOpacity>
        </View>

        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>거래처</Text>
          <TextInput
            style={styles.input}
            placeholder="거래처 입력"
            placeholderTextColor="#999"
            value={vendorQuery}
            onChangeText={setVendorQuery}
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

      {/* 날짜 선택 모달 - 시작일 */}
      <Modal
          visible={showFromPicker}
          transparent animationType="slide"
          onRequestClose={() => setShowFromPicker(false)}
      >
        <View style={commonStyles.dateModalOverlay}>
          <View style={commonStyles.dateModalCard}>
            <View style={commonStyles.dateModalHeader}>
              <Text style={commonStyles.dateModalTitle}>시작일 선택</Text>
              <TouchableOpacity onPress={() => setShowFromPicker(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={commonStyles.dateModalPickerContainer}>
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
            <View style={commonStyles.modalActions}>
              <Pressable
                style={commonStyles.modalOkButton}
                onPress={() => {
                  if (tempFromDate) setPurchaseDt(formatDate(tempFromDate));
                  setShowFromPicker(false);
                }}
              >
                <Text style={commonStyles.modalOkButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
          visible={showToPicker}
          transparent animationType="slide"
          onRequestClose={() => setShowToPicker(false)}
      >
        <View style={commonStyles.dateModalOverlay}>
          <View style={commonStyles.dateModalCard}>
            <View style={commonStyles.dateModalHeader}>
              <Text style={commonStyles.dateModalTitle}>종료일 선택</Text>
              <TouchableOpacity onPress={() => setShowToPicker(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={commonStyles.dateModalPickerContainer}>
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
            <View style={commonStyles.modalActions}>
              <Pressable
                style={commonStyles.modalOkButton}
                onPress={() => {
                  if (tempToDate) setToPurchaseDt(formatDate(tempToDate));
                  setShowToPicker(false);
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
            {selectedVendorName && (
              <Text style={commonStyles.modalTitle}>{selectedVendorName}</Text>
            )}

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
  filterRowSpacing: {
    marginBottom: 10,
  },
  filterLabel: {
    minWidth:50,
    fontSize: 14,
    color: '#555',
  },
  tilde: {
    color: '#666',
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
  selectText: {
    fontSize: 14,
    color: '#333',
  },

  totalRow: {
    backgroundColor: '#fafafa',
  },
  totalText: {
    fontWeight: '700',
    color: '#222',
  },
  modalTotalRow: {
    backgroundColor: '#fafafa',
  },
  modalTotalText: {
    fontWeight: '700',
    color: '#222',
  }
});


