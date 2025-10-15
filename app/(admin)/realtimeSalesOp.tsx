import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {User, SalesOrg} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
type SaleRow = {
    salesOrgNm: string;
    salesOrgCd: string;
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

export default function RealtimeSalesScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [vatExcludedChecked, setVatExcludedChecked] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<SalesOrgRow | null>(null);

    useEffect(() => {
        getSalesOrgList();
    },[]);
    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: '',
            restValue: '',
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    console.log('salesOrgList:' + JSON.stringify(salesOrgList))
                    setSalesOrgList([
                            {salesOrgCd:'', salesOrgNm: '전체'},
                            ...salesOrgList
                        ]
                    );
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const totalAmt = 1000000 * (idx % 5)
                return {
                    salesOrgCd: '',
                    salesOrgNm: `주유소 ${((idx % 6) + 1)}`,
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
            key: 'salesOrgNm', title: '사업소', flex: 2, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {key: 'totalAmt', title: '총매출', flex: 1.2, align: 'center',
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

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                const cashAmt = 100000;
                const cardAmt = 200000;
                const etcAmt = 250000;
                const totalAmt = qty * 10000000;
                return {
                    storNm: `포스그룹명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    cashAmt,
                    cardAmt,
                    etcAmt,
                    totalAmt: totalAmt,
                };
            }),
        []
    );

    const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'storNm', title: '포스그룹', flex: 1.5, align: 'center'},
        {
            key: 'cashAmt', title: Const.CASH, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'etcAmt', title: Const.CARD_ETC, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.etcAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1.3, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const summaryRow = useMemo(() => {
        const totalSaleAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalCashAmt = detailData.reduce((sum, item) => sum + item.cashAmt, 0);
        const totalEtcAmt = detailData.reduce((sum, item) => sum + item.cardAmt + item.etcAmt, 0);
        return {
            totalCashAmt: totalCashAmt,
            totalSaleAmt: totalSaleAmt,
            totalEtcAmt: totalEtcAmt
        };
    }, [detailData]);

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalCashAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalEtcAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.3}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        )
    }

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
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
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
                                <View style={[{flex:0.8}, commonStyles.tableRightBorder]}>
                                    <Text style={[{paddingLeft:10},styles.cell, styles.summaryLabelText]}>{row.label}</Text>
                                </View>
                                <View style={[{ flex: 1 }]}>
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

            <ListModal
                visible={showSalesOrgListModal}
                title="사업장 선택"
                data={salesOrgList}
                keyField="salesOrgCd"
                labelField="salesOrgNm"
                onClose={() => setShowSalesOrgListModal(false)}
                onSelect={(item) => {
                    setSelectedSalesOrgCd(item.salesOrgCd);
                    setShowSalesOrgListModal(false);
                }}
            />

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <View style={{flexDirection:'row',alignItems: 'flex-end'}}>
                                <Text style={commonStyles.modalTitle}>{selectedSalesOrg?.salesOrgNm}</Text>
                                <Text style={commonStyles.modalSmallTitle}>  (VAT포함)</Text>
                            </View>

                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={SaleDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooterRow}
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
});


