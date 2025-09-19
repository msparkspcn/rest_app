import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type SaleRow = {
    storNm: string;
    storCd: string;
    gauge: string;
    saleQty: number;
    totalAmt: number
};
type SummaryTotals = {
    label: string;
    saleQty: number;
    totalAmt: number
};

type ListItem =
    | { type: 'summaryPair'; key: string; label: string; pairText: string }
    | { type: 'summaryTotals'; key: string; label: string; saleQty: number; totalAmt: number }
    | { type: 'detail'; key: string; no: number; posGroup: string; gauge: string; saleQty: number; totalAmt: number };
type StoreGroup = { id: string; name: string };

export default function RealtimeSalesScreen() {
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
    const [registerFilter, setRegisterFilter] = useState<StoreGroup>(storeGroups[0]);

    const [selectedStoreGroupId, setSelectedStoreGroupId] = useState<string | null>(storeGroups[0]?.id ?? null);
    const [showStoreGroupModal, setShowStoreGroupModal] = useState(false);

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                // const gauge = `${idx}번무연`;
                const saleQty = 20000 + (idx % 7) * 2500;
                return {
                    storCd: '',
                    storNm: `그룹 ${((idx % 6) + 1)}`,
                    gauge: `${idx}번무연`,
                    saleQty: saleQty,
                    totalAmt: saleQty * 256,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        if (!selectedStoreGroupId) return baseData;
        const groupName = storeGroups.find(g => g.id === selectedStoreGroupId)?.name;
        return baseData.filter(r => (groupName ? r.storNm === groupName : true));
    }, [baseData, storeGroups, selectedStoreGroupId]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '매장', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.storNm}
                </Text>
            ),
        },
        {
            key: 'gauge', title: '게이지', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.gauge}
                </Text>
            )
        },
        {
            key: 'saleQty', title: '판매수량', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right', paddingRight: 10}]}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'totalAmt', title: '총매출', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right', paddingRight: 10}]}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    const totalValues = useMemo(() => {
        return filteredData.reduce(
            (acc, r) => {
                acc.totalAmt += r.totalAmt;
                return acc;
            },
            {saleQty: 0, totalAmt: 0}
        );
    }, [filteredData]);

    // 요약 데이터 구성
    const summaryRows = useMemo(() => {
        const today: SummaryTotals = {
            label: '당일합계',
            saleQty: totalValues.saleQty,
            totalAmt: totalValues.totalAmt
        };
        // 데모 수치 생성
        const yearCumulative = today.totalAmt * 200; // 연 누적 (예시)
        const monthCumulative = today.totalAmt * 15; // 월 누적 (예시)
        const prevWeekDelta = Math.round(today.totalAmt * 0.14); // 전주 매출 (예시)
        const prevDayDelta = Math.round(today.totalAmt * -0.046); // 전일 매출 (예시, 음수)

        const sign = (n: number) => (n >= 0 ? '+' : '-');
        const pair1 = `${yearCumulative.toLocaleString()} / ${monthCumulative.toLocaleString()}`;
        const pair2 = `${sign(prevWeekDelta)}${Math.abs(prevWeekDelta).toLocaleString()} / ${sign(prevDayDelta)}${Math.abs(prevDayDelta).toLocaleString()}`;

        const row1: ListItem = {type: 'summaryPair', key: 's-ym', label: '년/월 매출누적', pairText: pair1};
        const row2: ListItem = {type: 'summaryPair', key: 's-prev', label: '전주/전일 매출', pairText: pair2};
        const row3: ListItem = {
            type: 'summaryTotals',
            key: 's-today1',
            label: '주유소 무연합계',
            saleQty: today.saleQty,
            totalAmt: today.totalAmt
        };
        const row4: ListItem = {
            type: 'summaryTotals',
            key: 's-today2',
            label: '주유소 경유 합계',
            saleQty: today.saleQty,
            totalAmt: today.totalAmt
        };
        const row5: ListItem = {
            type: 'summaryTotals',
            key: 's-today3',
            label: '충전소 LPG 합계',
            saleQty: today.saleQty,
            totalAmt: today.totalAmt
        };
        const row6: ListItem = {
            type: 'summaryTotals',
            key: 's-today4',
            label: today.label,
            saleQty: today.saleQty,
            totalAmt: today.totalAmt
        };
        return [row1, row2, row3, row4, row5, row6];
    }, [totalValues]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRowFront]}>
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
                            <View
                                key={row.key}
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    borderWidth: StyleSheet.hairlineWidth,
                                    // borderBottomWidth: StyleSheet.hairlineWidth,
                                    borderColor: '#aaa',
                                    minHeight: 30,
                                    backgroundColor: '#fff7e6'
                            }}>
                                {row.type === 'summaryPair' ? (
                                    <>
                                        <View
                                            style={{
                                                flex: 1.5,
                                                justifyContent: 'center',
                                                alignItems: 'flex-start',
                                                paddingLeft: 10,
                                                borderRightWidth: StyleSheet.hairlineWidth,
                                                borderColor: '#aaa',
                                            }}
                                        >
                                            <Text style={[styles.cell, styles.summaryLabelText]}>
                                                {row.label}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                flex: 3,
                                                justifyContent: 'center',
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                            }}
                                        >
                                            <Text style={[styles.cell, styles.rightSpanText]}>
                                                {row.pairText}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <View style={{
                                            flex: 1.5,
                                            justifyContent: 'center',
                                            alignItems: 'flex-start',
                                            borderRightWidth: StyleSheet.hairlineWidth,
                                            borderColor: '#aaa',
                                            paddingLeft: 10,
                                            paddingRight: 5,
                                        }}>
                                            <Text style={[styles.cell, styles.summaryLabelText]}>
                                                {row.label}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 2,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            paddingLeft: 10,
                                            borderRightWidth: StyleSheet.hairlineWidth,
                                            paddingRight: 10,
                                            borderColor: '#aaa',
                                        }}>
                                            <Text style={[styles.cell, styles.rightSpanText]}>
                                                {row.saleQty.toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            paddingRight: 10
                                        }}>
                                            <Text style={[
                                                styles.cell,
                                                styles.rightSpanText
                                            ]}>
                                                {row.totalAmt.toLocaleString()}
                                            </Text>
                                        </View>
                                    </>
                                )}
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
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>매장그룹 선택</Text>
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
    summaryLabelText: {fontWeight: '700', color: '#333'},
    cell: {fontSize: 11, color: '#444'},
    rightSpanText: {textAlign: 'right'},
});
