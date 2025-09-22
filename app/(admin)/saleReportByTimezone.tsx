import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type SaleRow = { tmzonDiv: string; totalAmt: number, billCnt: number };
type ListItem = {
    type: "summaryTotals";
    key: string;
    label: string;
    totalAmt: number;
    billCnt: number
};
type PosGroup = { id: string; name: string };

export default function SalesReportByTimezoneScreen() {
  const [saleDate, setSaleDate] = useState(getTodayYmd());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const posGroups: PosGroup[] = useMemo(
    () => Array.from({ length: 6 }).map((_, i) => ({ id: `G${i + 1}`, name: `그룹 ${i + 1}` })),
    []
  );
  const [selectedPosGroupId, setSelectedPosGroupId] = useState<string | null>(posGroups[0]?.id ?? null);
  const [showPosGroupModal, setShowPosGroupModal] = useState(false);

  const baseData: SaleRow[] = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, idx) => {
          const tmzonDiv = String(idx + 1).padStart(2, "0")+"시";
        return {
          tmzonDiv,
          billCnt: idx * 10,
          totalAmt: 10000,
        };
      }),
    []
  );

  const filteredData = useMemo(() => {
    if (!selectedPosGroupId) return baseData;
    return baseData;
  }, [baseData, selectedPosGroupId]);

  const onSearch = () => {
    // 데모: 현재는 선택 값만으로 필터링 적용
  };

  const openDatePicker = () => {
      setTempDate(new Date());
      setShowDatePicker(true);
  };

  const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
      {key: 'tmzonDiv', title: '시간대', flex: 1, align: 'center'},
      {key: 'totalAmt', title: '판매금액', flex: 1, align: 'center',
          renderCell: (item) => (
              <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.totalAmt.toLocaleString()}</Text>
          )
      },
      {key: 'billCnt', title: '영수건수', flex: 0.5, align: 'center',
          renderCell: (item) => (
              <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.billCnt.toLocaleString()}</Text>
          )
      },
  ]), [])

  const totalValues = useMemo(() => {
    return filteredData.reduce(
      (acc, r) => {
        acc.totalAmt+= r.totalAmt;
        return acc;
      },
      { cashAmt: 0, cardEtc: 0, totalAmt: 0 }
    );
  }, [filteredData]);

  // 3행 요약 데이터 구성
  const summaryRows = useMemo(() => {
      const timeGroups = {
          dawn: ["01", "02", "03", "04", "05", "06"],       // 새벽
          morning: ["07", "08", "09", "10", "11", "12"],    // 오전
          afternoon: ["13", "14", "15", "16", "17", "18"],  // 오후
          night: ["19", "20", "21", "22", "23", "24"],      // 저녁
      };

      // ✅ 특정 구간 totalAmt 합산 함수
      const sumByGroup = (group: string[]) =>
          baseData
              .filter((row) => group.includes(String(row.tmzonDiv).padStart(2, "0")))
              .reduce(
                  (acc, row) => {
                      acc.billCnt += row.billCnt;
                      acc.totalAmt += row.totalAmt;
                      return acc;
                  },
                  { billCnt: 0, totalAmt: 0 }
              );

      const dawnTotals = sumByGroup(timeGroups.dawn);
      const morningTotals = sumByGroup(timeGroups.morning);
      const afternoonTotals = sumByGroup(timeGroups.afternoon);
      const nightTotals = sumByGroup(timeGroups.night);

      const sign = (n: number) => (n >= 0 ? '+' : '-');

    const row1: ListItem = { type: 'summaryTotals', key: 'time-dawn', label: '새벽\n[01시-06시]', totalAmt: dawnTotals.totalAmt, billCnt: dawnTotals.billCnt};
    const row2: ListItem = { type: 'summaryTotals', key: 'time-morning', label: '오전\n[07시-12시]', totalAmt: morningTotals.totalAmt, billCnt: morningTotals.billCnt};
    const row3: ListItem = { type: 'summaryTotals', key: 'time-afternoon', label: '오후\n[13시-18시]', totalAmt: afternoonTotals.totalAmt, billCnt:  afternoonTotals.billCnt};
    const row4: ListItem = { type: 'summaryTotals', key: 'time-night', label: '저녁\n[19시-24시]', totalAmt: nightTotals.totalAmt, billCnt: nightTotals.billCnt};
    return [row1, row2, row3, row4];
  }, [totalValues]);

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={commonStyles.filterRowFront}>
          <Text style={commonStyles.filterLabel}>조회일자</Text>
          <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
            <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
            <Text style={commonStyles.selectArrow}> ▼</Text>
          </TouchableOpacity>
        </View>
        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>포스그룹</Text>
          <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowPosGroupModal(true)}>
            <Text style={styles.selectText}>{posGroups.find(g => g.id === selectedPosGroupId)?.name || '선택'}</Text>
            <Text style={commonStyles.selectArrow}> ▼</Text>
          </TouchableOpacity>
          <Pressable style={commonStyles.searchButton} onPress={onSearch}>
            <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
          </Pressable>
        </View>
      </View>

      <View style={commonStyles.sectionDivider} />
        <Table
            data={filteredData}
            columns={mainColumns}
               listHeader={() => (
                   <View>
                       {summaryRows.map(row => (
                           <View key={row.key} style={{flexDirection:'row', justifyContent:'space-between', padding: 8, backgroundColor:'#fff7e6'}}>
                               <Text style={[styles.cell, styles.summaryLabelText]}>{row.label}</Text>
                               <Text style={[styles.cell, styles.rightSpanText]}>{row.totalAmt}</Text>
                               <Text style={[styles.cell, styles.rightSpanText]}>{row.billCnt}</Text>
                           </View>
                       ))}
                   </View>
               )}
        />

        <DatePickerModal
            visible={showDatePicker}
            initialDate={tempDate}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(date) => setSaleDate(dateToYmd(date))}
        />
      <Modal visible={showPosGroupModal} transparent animationType="slide" onRequestClose={() => setShowPosGroupModal(false)}>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>포스그룹 선택</Text>
              <TouchableOpacity onPress={() => setShowPosGroupModal(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={posGroups}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                    style={commonStyles.modalItem}
                    onPress={() => { setSelectedPosGroupId(item.id); setShowPosGroupModal(false); }}
                >
                  <Text style={commonStyles.modalItemText}>{item.name}</Text>
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
  selectText: { fontSize: 14, color: '#333' },
  summaryRow: { backgroundColor: '#fff7e6' },
  summaryLabelText: { fontWeight: '600',  fontSize:12, color: '#333' },
  cell: { fontSize: 13, color: '#444' },
  rightSpanText: { textAlign: 'right' },
});


