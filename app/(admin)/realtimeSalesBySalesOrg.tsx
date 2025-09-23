import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import {Ionicons} from "@expo/vector-icons";
import Const from "../../constants/Const";

type SaleRow = {
    no: number;
    cornerNm: string;
    todaySaleAmt: number;
    yedaySaleAmt: number;
    monthSaleAmt: number;
    yearSaleAmt: number;
};

type SaleDetailRow = {
    no: number;
    itemNm: string;
    qty: number;
    totalAmt: number;
    monthQty: number;
    monthAmt: number;
    yearAmt: number;
}

type CornerRow = {
    no: number;
    cornerNm: string;
    cornerCd: string;
    posGroup: string;
    useYn: 'Y' | 'N';
};

type PosGroup = { id: string; name: string };

export default function RealtimeSalesBySalesOrgScreen() {
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
    const [detailChecked, setDetailChecked] = useState(false);
    const [selectedCorner, setSelectedCorner] = useState<CornerRow | null>(null);
    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const todaySaleAmt = 10000 + (idx % 5) * 3000;
                const yedaySaleAmt = 20000 + (idx % 7) * 2500;
                const monthSaleAmt = 1000 * (idx % 4);
                const yearSaleAmt = 1000 * (idx % 4);
                return {
                    no: idx + 1,
                    cornerNm: `그룹 ${((idx % 6) + 1)}`,
                    todaySaleAmt,
                    yedaySaleAmt,
                    monthSaleAmt,
                    yearSaleAmt,
                };
            }),
        []
    );

    const handleCheckbox = () => {
        setDetailChecked(!detailChecked);
    };

    const aggregateSales = (rows: SaleRow[]): SaleRow => {
        return rows.reduce((acc, cur) => ({
            no: 0,
            cornerNm: "합계",
            todaySaleAmt: acc.todaySaleAmt + cur.todaySaleAmt,
            yedaySaleAmt: acc.yedaySaleAmt + cur.yedaySaleAmt,
            monthSaleAmt: acc.monthSaleAmt + cur.monthSaleAmt,
            yearSaleAmt: acc.yearSaleAmt + cur.yearSaleAmt,
        }), {no: 0, cornerNm: "합계", todaySaleAmt: 0, yedaySaleAmt: 0, monthSaleAmt: 0, yearSaleAmt: 0});
    };

    const filteredData = useMemo((): SaleRow[] => {
        return detailChecked
            ? baseData
            : [aggregateSales(baseData)];
    }, [baseData, detailChecked]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (store: CornerRow) => {
        setSelectedCorner(store);
        setIsDetailVisible(true);
    }

    const closeDetail = () => {
        setIsDetailVisible(false);
    };


    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => {
        const commonCols: ColumnDef<SaleRow>[] = [
            {
                key: 'yedaySaleAmt', title: '전일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.yedaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'todaySaleAmt', title: '당일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.todaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'monthSaleAmt', title: '월누계매출', flex: 1.1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.monthSaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'yearSaleAmt', title: '년누계', flex: 1.3, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.yearSaleAmt.toLocaleString()}</Text>
                )
            },
        ];

        if (detailChecked) {
            return [
                {
                    key: 'cornerNm',
                    title: '매장명',
                    flex: 1.3,
                    align: 'center',
                    renderCell: (item) => (
                        <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                            <Text style={[commonStyles.cell, commonStyles.linkText, {
                                textAlign: 'left',
                                paddingLeft: 10
                            }]}>
                                {item.cornerNm}
                            </Text>
                        </Pressable>
                    )
                },
                ...commonCols
            ];
        }

        return commonCols;
    }, [detailChecked]);

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                const totalAmt = qty * 100;
                return {
                    no: idx + 1,
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty: qty,
                    totalAmt: qty * 10,
                    monthAmt: totalAmt * 10,
                    monthQty: totalAmt,
                    yearAmt: totalAmt * 10,
                };
            }),
        []
    );

    const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품명', flex: 1, align: 'center'},
        {
            key: 'qty', title: Const.QTY, flex: 0.6, align: 'center',
            renderCell: (item) => (
                <Text style={[styles.cell, commonStyles.numberSmallCell]}>
                    {item.qty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'price', title: '금액', flex: 0.6, align: 'right',
            renderCell: (item) => (
                <Text style={[styles.cell, commonStyles.numberSmallCell]}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'monthQty', title: '월누계\n수량', flex: 0.9, align: 'right',
            renderCell: (item) => (
                <Text style={[styles.cell, commonStyles.numberSmallCell]}>
                    {item.monthQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'monthAmt', title: '월누계금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[styles.cell, commonStyles.numberSmallCell]}>
                    {item.monthAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'yearAmt', title: '년누계금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[styles.cell, commonStyles.numberSmallCell]}>
                    {item.yearAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);
    const summaryRow = useMemo(() => {
        const totalSaleAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalQty = detailData.reduce((sum, item) => sum + item.qty, 0);
        const totalAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalMonthAmt = detailData.reduce((sum, item) => sum + item.monthAmt, 0);
        const totalMonthQty = detailData.reduce((sum, item) => sum + item.monthQty, 0);
        const totalYearAmt = detailData.reduce((sum, item) => sum + item.yearAmt, 0);
        return {
            totalQty: totalQty,
            totalAmt: totalAmt,
            totalSaleAmt: totalSaleAmt,
            totalMonthAmt: totalMonthAmt,
            totalMonthQty: totalMonthQty,
            totalYearAmt: totalYearAmt,
        };
    }, [detailData]);

    const CornerNmRow = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                <Text style={styles.subTitle}>{selectedCorner?.cornerNm}</Text>
                <Text style={styles.subTitle}>(단위:천원)</Text>
            </View>
        );
    };
    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={{flex: 1,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={{flex: 0.6,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 0.6,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 0.9,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalMonthQty.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 1.5,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalMonthAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 1.5,
                    justifyContent: 'center',
                    borderRightWidth: StyleSheet.hairlineWidth,
                    borderRightColor:'#aaa',
                    height:'100%'}}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalYearAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowPosGroupModal(true)}>
                        <Text
                            style={styles.selectText}>{posGroups.find(g => g.id === selectedPosGroupId)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>상세보기</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleCheckbox}
                    >
                        <View style={[commonStyles.checkbox, detailChecked && commonStyles.checkboxChecked]}>
                            {detailChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Text style={{textAlign: 'right', paddingHorizontal: 10, paddingTop: 10}}>(단위:천원)</Text>
            <Table
                data={filteredData}
                columns={mainColumns}
                listFooter={
                    detailChecked
                        ? () => (
                            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={{flex: 1.3,
                                    justifyContent: 'center',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderRightColor:'#aaa',
                                    height:'100%'
                                }}>
                                    <Text style={[commonStyles.cell, styles.summaryLabelText, {
                                        textAlign: 'center'
                                    }]}>합계</Text>
                                </View>
                                <View style={{flex: 1,
                                    justifyContent: 'center',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderRightColor:'#aaa',
                                    height:'100%'
                                }}>
                                    <Text style={[commonStyles.cell, commonStyles.numberCell, styles.summaryLabelText]}>
                                        {aggregateSales(baseData).yedaySaleAmt.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{flex: 1,
                                    justifyContent: 'center',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderRightColor:'#aaa',
                                    height:'100%'
                                }}>
                                    <Text style={[commonStyles.cell, commonStyles.numberCell, styles.summaryLabelText]}>
                                        {aggregateSales(baseData).todaySaleAmt.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{flex: 1.1,
                                    justifyContent: 'center',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderRightColor:'#aaa',
                                    height:'100%'
                                }}>
                                    <Text style={[commonStyles.cell, commonStyles.numberCell, styles.summaryLabelText]}>
                                        {aggregateSales(baseData).monthSaleAmt.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={{flex: 1.3,
                                    justifyContent: 'center',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderRightColor:'#aaa',
                                    height:'100%'
                                }}>
                                    <Text style={[commonStyles.cell, commonStyles.numberCell, styles.summaryLabelText]}>
                                        {aggregateSales(baseData).yearSaleAmt.toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        )
                        : undefined
                }
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
                            <Text style={commonStyles.modalTitle}>사업장 선택</Text>
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

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>상품매출현황</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333"/>
                            </Pressable>

                        </View>
                        <CornerNmRow/>
                        <Table
                            data={detailData}
                            columns={SaleDetailColumns}
                            isModal={true}
                            listFooter={() => renderDetailFooterRow()}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {
        fontSize: 14, color: '#333'
    },
    summaryLabelText: {
        fontWeight: '700',
        color: '#333'
    },
    cell: {
        fontSize: 11,
        color: '#444',
        width: '100%'
    },
    subTitle: {
        fontSize: 14,
        fontWeight: '700',
        paddingVertical: 10,
    },
});


