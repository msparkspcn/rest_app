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
    cashAmt: number;
    cardAmt: number;
    etcAmt: number;
    totalAmt: number
};
type SummaryTotals = {
    label: string;
    cashAmt: number;
    cardEtc: number;
    totalAmt: number
};
type SaleDetailRow = {
    itemNm: string;
    qty: number;
    price: number;
    totalAmt: number;
}
type ListItem =
    | { type: 'summaryPair'; key: string; label: string; pairText: string }
    | { type: 'summaryTotals'; key: string; label: string; cashAmt: number; cardEtc: number; totalAmt: number }
    | { type: 'detail'; key: string; no: number; posGroup: string; cashAmt: number; cardEtc: number; totalAmt: number };
type PosGroup = { id: string; name: string };

export default function RealtimeSalesScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const posGroups: PosGroup[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({id: `G${i + 1}`, name: `그룹 ${i + 1}`})),
        []
    );
    const [selectedPosGroupId, setSelectedPosGroupId] = useState<string | null>(posGroups[0]?.id ?? null);
    const [showPosGroupModal, setShowPosGroupModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const cashAmt = 10000 + (idx % 5) * 3000;
                const cardAmt = 20000 + (idx % 7) * 2500;
                const etcAmt = 1000 * (idx % 4);
                return {
                    storCd: '',
                    storNm: `그룹 ${((idx % 6) + 1)}`,
                    cashAmt,
                    cardAmt,
                    etcAmt,
                    totalAmt: cashAmt + cardAmt + etcAmt,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        if (!selectedPosGroupId) return baseData;
        const groupName = posGroups.find(g => g.id === selectedPosGroupId)?.name;
        return baseData.filter(r => (groupName ? r.storNm === groupName : true));
    }, [baseData, posGroups, selectedPosGroupId]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (posGroup: string) => {
        setIsDetailVisible(true);
    }

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '포스그룹', flex: 1, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item.posGroup)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.storNm}
                    </Text>
                </Pressable>
            ),
        },
        {key: 'cashAmt', title: '현금', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right',paddingRight: 10}]}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {key: 'etcAmt', title: '카드 외', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right',paddingRight: 10}]}>
                    {item.etcAmt.toLocaleString()}
                </Text>
            )
        },
        {key: 'totalAmt', title: '총매출', flex: 1.2, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right',paddingRight: 10}]}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    const totalValues = useMemo(() => {
        return filteredData.reduce(
            (acc, r) => {
                acc.cashAmt += r.cashAmt;
                acc.cardEtc += r.cardAmt + r.etcAmt;
                acc.totalAmt += r.totalAmt;
                return acc;
            },
            {cashAmt: 0, cardEtc: 0, totalAmt: 0}
        );
    }, [filteredData]);

    // 3행 요약 데이터 구성
    const summaryRows = useMemo(() => {
        const today: SummaryTotals = {
            label: '당일합계',
            cashAmt: totalValues.cashAmt,
            cardEtc: totalValues.cardEtc,
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
            key: 's-today',
            label: today.label,
            cashAmt: today.cashAmt,
            cardEtc: today.cardEtc,
            totalAmt: today.totalAmt
        };
        return [row1, row2, row3];
    }, [totalValues]);

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                const totalAmt = qty * 10000;
                return {
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty: qty,
                    price: qty * 10,
                    totalAmt: totalAmt,
                };
            }),
        []
    );

    const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: '상품명', flex: 2, align: 'center'},
        {
            key: 'qty', title: '수량', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: '단가', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.price.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

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
                    <Text style={commonStyles.filterLabel}>포스그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowPosGroupModal(true)}>
                        <Text
                            style={styles.selectText}>{posGroups.find(g => g.id === selectedPosGroupId)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
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
                                justifyContent: 'space-between',
                                padding: 8,
                                backgroundColor: '#fff7e6'
                            }}>
                                <Text style={[styles.cell, styles.summaryLabelText]}>{row.label}</Text>
                                {"pairText" in row &&
                                <Text style={[styles.cell, styles.rightSpanText]}>{row.pairText}</Text>}
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

            <Modal visible={showPosGroupModal} transparent animationType="slide"
                   onRequestClose={() => setShowPosGroupModal(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>포스그룹 선택</Text>
                            <TouchableOpacity onPress={() => setShowPosGroupModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={posGroups}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedPosGroupId(item.id);
                                        setShowPosGroupModal(false);
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {/*{selectedItemNm && <Text style={commonStyles.modalTitle}>{selectedItemNm}</Text>}*/}
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={SaleDetailColumns}
                            isModal={true}
                            // listFooter={renderDetailFooter}
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
    cell: {fontSize: 13, color: '#444'},
    rightSpanText: {textAlign: 'right'},
});


