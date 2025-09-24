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
    salesOrgNm: string;
    salesOrgCd: string;
    전주대비: string;
    전일대비: string;
    totalAmt: number
};
type SummaryTotals = {
    label: string;
    totalAmt: number
};
type SaleDetailRow = {
    storNm: string;
    cashAmt: number;
    cardAmt: number;
    etcAmt: number;
    totalAmt: number;
}
type SalesOrgRow = {
    salesOrgCd: string;
    salesOrgNm: string;
};

type ListItem =
    | { type: 'summaryPair'; key: string; label: string; pairText: string }
    | { type: 'summaryTotals'; key: string; label: string; totalAmt: number }
    | { type: 'detail'; key: string; no: number; posGroup: string; totalAmt: number };
type SalesOrg =  {salesOrgCd: string; salesOrgNm: string};
export default function RealtimeSalesRatio() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const salesOrgList: SalesOrg[] = useMemo(
        () => [
            { salesOrgCd: '', salesOrgNm: '전체' }, // 기본값 추가
            ...Array.from({ length: 6 }).map((_, i) => ({
                salesOrgCd: `G${i + 1}`,
                salesOrgNm: `주유소 ${i + 1}`,
            })),
        ],
        []
    );
    const [vatExcludedChecked, setVatExcludedChecked] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<SalesOrgRow | null>(null);

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const totalAmt = 1000000 * (idx % 5)
                return {
                    salesOrgCd: '',
                    salesOrgNm: `주유소 ${((idx % 6) + 1)}`,
                    전주대비:'10.0%',
                    전일대비:'10.0%',
                    totalAmt,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData;
    }, [baseData]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (salesOrg: SalesOrgRow) => {
        setIsDetailVisible(true);
        setSelectedSalesOrg(salesOrg)
    }

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.4,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'salesOrgNm', title: '사업소', flex: 2,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {key: '전주대비', title: '전주대비', flex: 1.2,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.전주대비.toLocaleString()}
                </Text>
            )
        },
        {key: '전일대비', title: '전일대비', flex: 1.2,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.전일대비.toLocaleString()}
                </Text>
            )
        },
        {key: 'totalAmt', title: '총매출', flex: 1.2,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
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
            {cashAmt: 0, cardEtc: 0, totalAmt: 0}
        );
    }, [filteredData]);

    // 3행 요약 데이터 구성
    const summaryRows = useMemo(() => {
        const today: SummaryTotals = {
            label: '당일합계',
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
        const row3: ListItem = {type: 'summaryTotals', key: 's-today', label: '당일합계', totalAmt: today.totalAmt};
        return [row1, row2, row3];
    }, [totalValues]);

    const handleVatExcludedToggle = () => {
        setVatExcludedChecked(!vatExcludedChecked);
    };
    const handleDcIncludedToggle = () => {
        setDcIncludedChecked(!dcIncludedChecked)
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>부가세별도</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleVatExcludedToggle}
                    >
                        <View style={[commonStyles.checkbox, vatExcludedChecked && commonStyles.checkboxChecked]}>
                            {vatExcludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>DC금액포함</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleDcIncludedToggle}
                    >
                        <View style={[commonStyles.checkbox, dcIncludedChecked && commonStyles.checkboxChecked]}>
                            {dcIncludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
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
                            <View key={row.key} style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={[{flex:2.4}, commonStyles.tableRightBorder]}>
                                    <Text style={[{textAlign:'center'},styles.cell, styles.summaryLabelText]}>
                                        {row.label}
                                    </Text>
                                </View>
                                <View style={[{ flex: 3.6 }, commonStyles.tableRightBorder]}>
                                    <Text style={commonStyles.numberCell}>
                                        {"pairText" in row ? row.pairText : row.totalAmt.toLocaleString()}
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

            <Modal visible={showSalesOrgListModal} transparent animationType="slide"
                   onRequestClose={() => setShowSalesOrgListModal(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>사업장 선택</Text>
                            <TouchableOpacity onPress={() => setShowSalesOrgListModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={salesOrgList}
                            keyExtractor={(item) => item.salesOrgCd}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedSalesOrgCd(item.salesOrgCd);
                                        setShowSalesOrgListModal(false);
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>{item.salesOrgNm}</Text>
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
    summaryLabelText: {fontWeight: '700', color: '#333'},
    cell: {fontSize: 13, color: '#444'},
    rightSpanText: {textAlign: 'right'},
});


