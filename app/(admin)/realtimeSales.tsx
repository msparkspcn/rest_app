import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Row = { no: number; posGroup: string; cash: number; card: number; other: number; total: number };
type SummaryTotals = { label: string; cash: number; cardEtc: number; total: number };
type ListItem =
  | { type: 'summaryPair'; key: string; label: string; pairText: string }
  | { type: 'summaryTotals'; key: string; label: string; cash: number; cardEtc: number; total: number }
  | { type: 'detail'; key: string; no: number; posGroup: string; cash: number; cardEtc: number; total: number };
type PosGroup = { id: string; name: string };

export default function RealtimeSalesScreen() {
  const [saleDate, setSaleDate] = useState('2025/08/04');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const posGroups: PosGroup[] = useMemo(
    () => Array.from({ length: 6 }).map((_, i) => ({ id: `G${i + 1}`, name: `그룹 ${i + 1}` })),
    []
  );
  const [selectedPosGroupId, setSelectedPosGroupId] = useState<string | null>(posGroups[0]?.id ?? null);
  const [showPosGroupModal, setShowPosGroupModal] = useState(false);

  const baseData: Row[] = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, idx) => {
        const cash = 10000 + (idx % 5) * 3000;
        const card = 20000 + (idx % 7) * 2500;
        const other = 1000 * (idx % 4);
        return {
          no: idx + 1,
          posGroup: `그룹 ${((idx % 6) + 1)}`,
          cash,
          card,
          other,
          total: cash + card + other,
        };
      }),
    []
  );

  const filteredData = useMemo(() => {
    if (!selectedPosGroupId) return baseData;
    const groupName = posGroups.find(g => g.id === selectedPosGroupId)?.name;
    return baseData.filter(r => (groupName ? r.posGroup === groupName : true));
  }, [baseData, posGroups, selectedPosGroupId]);

  const onSearch = () => {
    // 데모: 현재는 선택 값만으로 필터링 적용
  };

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

  const openDatePicker = () => {
    setTempDate(parseDate(saleDate));
    setShowDatePicker(true);
  };

  const renderHeader = () => (
    <View style={styles.tableHeaderRow}>
      <Text style={[styles.headerCell, styles.colNo]}>No</Text>
      <Text style={[styles.headerCell, styles.colPosGroup]}>포스그룹</Text>
      <Text style={[styles.headerCell, styles.colCash]}>현금</Text>
      <Text style={[styles.headerCell, styles.colCardEtc]}>카드 외</Text>
      <Text style={[styles.headerCell, styles.colTotal]}>총매출</Text>
    </View>
  );

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'summaryPair') {
      return (
        <View style={[styles.tableRow, styles.summaryRow]}>
          <Text style={[styles.cell, styles.colNo]} />
          <Text style={[styles.cell, styles.colPosGroup, styles.summaryLabelText]}>{item.label}</Text>
          <View style={styles.colRightSpan}>
            <Text style={[styles.cell, styles.rightSpanText]} numberOfLines={1} ellipsizeMode="tail">{item.pairText}</Text>
          </View>
        </View>
      );
    }
    if (item.type === 'summaryTotals') {
      return (
        <View style={[styles.tableRow, styles.summaryRow]}>
          <Text style={[styles.cell, styles.colNo]} />
          <Text style={[styles.cell, styles.colPosGroup, styles.summaryLabelText]}>{item.label}</Text>
          <Text style={[styles.cell, styles.colCash]} numberOfLines={1}>{item.cash.toLocaleString()}</Text>
          <Text style={[styles.cell, styles.colCardEtc]} numberOfLines={1}>{item.cardEtc.toLocaleString()}</Text>
          <Text style={[styles.cell, styles.colTotal]} numberOfLines={1}>{item.total.toLocaleString()}</Text>
        </View>
      );
    }
    return (
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.colNo]} numberOfLines={1}>{item.no}</Text>
        <Text style={[styles.cell, styles.colPosGroup]} numberOfLines={1}>{item.posGroup}</Text>
        <Text style={[styles.cell, styles.colCash]} numberOfLines={1}>{item.cash.toLocaleString()}</Text>
        <Text style={[styles.cell, styles.colCardEtc]} numberOfLines={1}>{item.cardEtc.toLocaleString()}</Text>
        <Text style={[styles.cell, styles.colTotal]} numberOfLines={1}>{item.total.toLocaleString()}</Text>
      </View>
    );
  };

  const totalValues = useMemo(() => {
    return filteredData.reduce(
      (acc, r) => {
        acc.cash += r.cash;
        acc.cardEtc += r.card + r.other;
        acc.total += r.total;
        return acc;
      },
      { cash: 0, cardEtc: 0, total: 0 }
    );
  }, [filteredData]);

  // 3행 요약 데이터 구성
  const summaryRows = useMemo(() => {
    const today: SummaryTotals = { label: '당일합계', cash: totalValues.cash, cardEtc: totalValues.cardEtc, total: totalValues.total };
    // 데모 수치 생성
    const yearCumulative = today.total * 200; // 연 누적 (예시)
    const monthCumulative = today.total * 15; // 월 누적 (예시)
    const prevWeekDelta = Math.round(today.total * 0.14); // 전주 매출 (예시)
    const prevDayDelta = Math.round(today.total * -0.046); // 전일 매출 (예시, 음수)

    const sign = (n: number) => (n >= 0 ? '+' : '-');
    const pair1 = `${yearCumulative.toLocaleString()} / ${monthCumulative.toLocaleString()}`;
    const pair2 = `${sign(prevWeekDelta)}${Math.abs(prevWeekDelta).toLocaleString()} / ${sign(prevDayDelta)}${Math.abs(prevDayDelta).toLocaleString()}`;

    const row1: ListItem = { type: 'summaryPair', key: 's-ym', label: '년/월 매출누적', pairText: pair1 };
    const row2: ListItem = { type: 'summaryPair', key: 's-prev', label: '전주/전일 매출', pairText: pair2 };
    const row3: ListItem = { type: 'summaryTotals', key: 's-today', label: today.label, cash: today.cash, cardEtc: today.cardEtc, total: today.total };
    return [row1, row2, row3];
  }, [totalValues]);

  // 상세 행 구성 (카드 외 = 카드 + 외)
  const detailRows: ListItem[] = useMemo(
    () =>
      filteredData.map((r) => ({
        type: 'detail',
        key: `d-${r.no}`,
        no: r.no,
        posGroup: r.posGroup,
        cash: r.cash,
        cardEtc: r.card + r.other,
        total: r.total,
      })),
    [filteredData]
  );

  const combinedRows: ListItem[] = useMemo(() => {
    return [...summaryRows, ...detailRows];
  }, [summaryRows, detailRows]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <View style={[styles.filterRow, styles.filterRowSpacing]}>
          <Text style={styles.filterLabel}>조회일자</Text>
          <TouchableOpacity style={styles.selectInput} onPress={openDatePicker}>
            <Text style={styles.selectText}>{saleDate}</Text>
            <Text style={styles.selectArrow}> ▼</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>포스그룹</Text>
          <TouchableOpacity style={styles.selectInput} onPress={() => setShowPosGroupModal(true)}>
            <Text style={styles.selectText}>{posGroups.find(g => g.id === selectedPosGroupId)?.name || '선택'}</Text>
            <Text style={styles.selectArrow}> ▼</Text>
          </TouchableOpacity>
          <Pressable style={styles.searchButton} onPress={onSearch}>
            <Text style={styles.searchButtonText}>조회</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      <View style={styles.tableContainer}>
        {renderHeader()}
        <FlatList
          data={combinedRows}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          style={styles.tableList}
          contentContainerStyle={styles.tableListContent}
          showsVerticalScrollIndicator
        />
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>조회일자 선택</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalPickerContainer}>
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
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalOkButton}
                onPress={() => {
                  if (tempDate) setSaleDate(formatDate(tempDate));
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalOkButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPosGroupModal} transparent animationType="slide" onRequestClose={() => setShowPosGroupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>포스그룹 선택</Text>
              <TouchableOpacity onPress={() => setShowPosGroupModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={posGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setSelectedPosGroupId(item.id); setShowPosGroupModal(false); }}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  topBar: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, backgroundColor: '#f5f5f5' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filterRowSpacing: { marginBottom: 10 },
  filterLabel: { fontSize: 14, color: '#555', marginRight: 8 },
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
  tableListContent: { 
    paddingBottom: 12 
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee', paddingVertical: 12 },
  summaryRow: { backgroundColor: '#fff7e6' },
  summaryLabelText: { fontWeight: '700', color: '#333' },
  cell: { fontSize: 13, color: '#444' },
  rightSpanText: { textAlign: 'right' },
  totalRow: { backgroundColor: '#fafafa' },
  totalText: { fontWeight: '700', color: '#222' },
  colNo: { flex: 0.6 },
  colPosGroup: { flex: 1.6 },
  colCash: { flex: 1, textAlign: 'right' },
  colCardEtc: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1.2, textAlign: 'right' },
  colRightSpan: { flex: 2.2, alignItems: 'flex-end' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 480, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', height: '70%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  modalClose: { fontSize: 18, color: '#666' },
  modalPickerContainer: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  modalActions: { padding: 12, alignItems: 'flex-end' },
  modalOkButton: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  modalOkButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  modalItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f0f0f0' },
  modalItemText: { fontSize: 16, color: '#333' },
});


