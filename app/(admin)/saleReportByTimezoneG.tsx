import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DatePickerModal } from "../../components/DatePickerModal";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { commonStyles } from "../../styles/index";
import { ColumnDef } from "../../types/table";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";

type SaleRow = { tmzonDiv: string; totalAmt: number, billCnt: number };
type ListItem = {
    type: "summaryTotals";
    key: string;
    label: string;
    totalAmt: number;
    billCnt: number
};
type StoreGroup = { id: string; name: string };

export default function SalesReportByTimezoneScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const storeGroups: StoreGroup[] = useMemo(
        () => [
            {id: "", name: "전체"},
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );
    const [selectedStoreGroupId, setSelectedStoreGroupId] = useState<string | null>(storeGroups[0]?.id ?? null);
    const [showStoreGroupModal, setShowStoreGroupModal] = useState(false);
    const [registerFilter, setRegisterFilter] = useState<StoreGroup>(storeGroups[0]);
    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 24}).map((_, idx) => {
                const tmzonDiv = String(idx + 1).padStart(2, "0") + "시";
                return {
                    tmzonDiv,
                    billCnt: idx * 10,
                    totalAmt: 10000,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        if (!selectedStoreGroupId) return baseData;
        return baseData;
    }, [baseData, selectedStoreGroupId]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'tmzonDiv', title: '시간대', flex: 0.8, align: 'center'},
        {
            key: 'totalAmt', title: '판매금액', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[
                    commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10,
                }]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'billCnt', title: '영수건수', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.billCnt.toLocaleString()}</Text>
            )
        },
    ]), [])

    const totalValues = useMemo(() => {
        return filteredData.reduce(
            (acc, r) => {
                acc.totalAmt += r.totalAmt;
                return acc;
            },
            {cashAmt: 0, cardEtc: 0, totalAmt: 0}
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
                    {billCnt: 0, totalAmt: 0}
                );

        const dawnTotals = sumByGroup(timeGroups.dawn);
        const morningTotals = sumByGroup(timeGroups.morning);
        const afternoonTotals = sumByGroup(timeGroups.afternoon);
        const nightTotals = sumByGroup(timeGroups.night);

        const row1: ListItem = {
            type: 'summaryTotals',
            key: 'time-dawn',
            label: '새벽\n[01시-06시]',
            totalAmt: dawnTotals.totalAmt,
            billCnt: dawnTotals.billCnt
        };
        const row2: ListItem = {
            type: 'summaryTotals',
            key: 'time-morning',
            label: '오전\n[07시-12시]',
            totalAmt: morningTotals.totalAmt,
            billCnt: morningTotals.billCnt
        };
        const row3: ListItem = {
            type: 'summaryTotals',
            key: 'time-afternoon',
            label: '오후\n[13시-18시]',
            totalAmt: afternoonTotals.totalAmt,
            billCnt: afternoonTotals.billCnt
        };
        const row4: ListItem = {
            type: 'summaryTotals',
            key: 'time-night',
            label: '저녁\n[19시-24시]',
            totalAmt: nightTotals.totalAmt,
            billCnt: nightTotals.billCnt
        };
        return [row1, row2, row3, row4];
    }, [totalValues]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장그룹</Text>
                    <View style={commonStyles.segmented}>
                        {storeGroups.map((option) => (
                            <Pressable
                                key={option.id}
                                onPress={() => setRegisterFilter(option)}
                                style={[commonStyles.segmentItem, registerFilter.id === option.id && commonStyles.segmentItemActive]}
                            >
                                <Text
                                    style={[commonStyles.segmentText, registerFilter.id === option.id && commonStyles.segmentTextActive]}>
                                    {option.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>
            <Table
                data={filteredData}
                columns={mainColumns}
                listHeader={() => (
                    <View>
                        {summaryRows.map(row => (
                            <View key={row.key} style={{
                                flexDirection: 'row',
                                paddingTop:2,
                                paddingBottom: 4,
                                backgroundColor: '#fff7e6',
                                alignItems:'center'
                            }}>
                                <Text style={[
                                    styles.summaryLabelText,
                                    { flex: 0.8,},
                                    commonStyles.cellDivider,
                                ]}>
                                    {row.label}
                                </Text>
                                <View style={[
                                    { flex: 1},
                                    commonStyles.cellDivider,
                                ]}>
                                    <Text style={[
                                        styles.cell,
                                        {
                                            paddingRight: 10,
                                            textAlign: 'right'
                                        },
                                    ]}>
                                        {row.totalAmt.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={{ flex: 0.5 }}>
                                    <Text style={[
                                        styles.cell,
                                        { textAlign: 'right', paddingRight: 10 },
                                    ]}>
                                        {row.billCnt.toLocaleString()}
                                    </Text>
                                </View>
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
            <Modal visible={showStoreGroupModal} transparent animationType="slide"
                   onRequestClose={() => setShowStoreGroupModal(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>포스그룹 선택</Text>
                            <TouchableOpacity onPress={() => setShowStoreGroupModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={storeGroups}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedStoreGroupId(item.id);
                                        setShowStoreGroupModal(false);
                                    }}
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
    selectText: {fontSize: 14, color: '#333'},
    tableList: {flex: 1},
    tableListContent: {paddingBottom: 12},
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee',
        paddingVertical: 12
    },
    summaryRow: {backgroundColor: '#fff7e6'},
    summaryLabelText: {fontWeight: '600', fontSize: 11, color: '#333', textAlign: 'center'},
    cell: {fontSize: 12, color: '#444', width:'100%'},
    rightSpanText: {textAlign: 'right'},
});


