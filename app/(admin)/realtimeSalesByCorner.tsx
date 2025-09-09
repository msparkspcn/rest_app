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
    cornerNm: string;
    saleAmt: number;
    dayCompRatio: number;
    monthSaleAmt: number;
    monthCompRatio: number
};
type SaleDetailRow = {
    no: number;
    itemNm: string;
    qty: number;
    totalAmt: number;
    compRatio: number;
}

type PosGroup = { id: string; name: string };

type CornerRow = {
    no: number;
    cornerNm: string;
    cornerCd: string;
    posGroup: string;
    useYn: 'Y' | 'N';
};

export default function RealtimeSalesByCornerScreen() {
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
    const [selectedCorner, setSelectedCorner] = useState<CornerRow | null>(null);
    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const saleAmt = 10000 + (idx % 5) * 3000;
                const dayCompRatio = 20 + (idx % 7);
                const monthSaleAmt = 10000 + (idx % 5);
                const monthCompRatio = 10 + (idx % 5);
                return {
                    no: idx + 1,
                    cornerNm: `그룹 ${((idx % 6) + 1)}`,
                    saleAmt: saleAmt,
                    dayCompRatio: dayCompRatio,
                    monthSaleAmt: monthSaleAmt,
                    monthCompRatio: monthCompRatio,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        if (!selectedPosGroupId) return baseData;
        const groupName = posGroups.find(g => g.id === selectedPosGroupId)?.name;
        return baseData.filter(r => (groupName ? r.cornerNm === groupName : true));
    }, [baseData, posGroups, selectedPosGroupId]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (corner: CornerRow) => {
        console.log('corner:' + JSON.stringify(corner))
        setSelectedCorner(corner)
        setIsDetailVisible(true);
    }

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: Const.CORNER_NM, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.cornerNm}
                </Text>
            ),
        },
        {
            key: 'saleAmt', title: Const.SALE_AMT, flex: 1, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.saleAmt.toLocaleString()}</Text>
                </Pressable>
            )
        },
        {
            key: 'dayCompRatio', title: Const.COMP_RATIO, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.dayCompRatio.toLocaleString()}</Text>
            )
        },
        {
            key: 'monthSaleAmt', title: Const.MONTH_TOTAL_AMT, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.monthSaleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'monthCompRatio', title: Const.COMP_RATIO, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.monthCompRatio.toLocaleString()}</Text>
            )
        },
    ]), [])

    const totalSaleAmt = useMemo(() => filteredData.reduce((acc, r) => acc + r.saleAmt, 0), [filteredData]);
    const totalMonthSaleAmt = useMemo(() => filteredData.reduce((acc, r) => acc + r.monthSaleAmt, 0), [filteredData]);


    const renderFooter = () => (
        <View style={[commonStyles.tableRow, styles.totalRow]}>
            <View style={[{flex: 1}, commonStyles.cellDivider]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
                    {fontSize: 13, fontWeight: 'bold'}]}>합계</Text>
            </View>
            <View style={{flex: 2}}>
                <Text style={[commonStyles.cell, styles.totalText, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{totalSaleAmt.toLocaleString()}</Text>
            </View>
            <View style={{flex: 2}}>
                <Text style={[commonStyles.cell, styles.totalText, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{totalMonthSaleAmt.toLocaleString()}</Text>
            </View>
        </View>
    );

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                return {
                    no: idx + 1,
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty: qty,
                    totalAmt: qty * 10,
                    compRatio: qty * 10,
                };
            }),
        []
    );

    const summaryRow = useMemo(() => {
        const totalSaleAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalQty = detailData.reduce((sum, item) => sum + item.qty, 0);
        const totalCompRatio = detailData.reduce((sum, item) => sum + item.compRatio, 0);
        return {
            totalQty: totalQty,
            totalSaleAmt: totalSaleAmt,
            totalCompRatio: totalCompRatio
        };
    }, [detailData]);

    const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: 'No', flex: 0.5, align: 'center'},
        {key: 'itemNm', title: Const.ITEM_NM, flex: 2, align: 'center'},
        {
            key: 'qty', title: Const.QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'compRatio', title: Const.COMP_RATIO, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, styles.summaryRow]}>
                <View style={{flex: 2.5}}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'right', paddingRight: 5}]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 1.5}}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'right', paddingRight: 2}]}>
                        {summaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={{flex: 1}}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'right'}]}>
                        {summaryRow.totalCompRatio.toLocaleString()}
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
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
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
                listFooter={renderFooter}
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
                            <Text style={commonStyles.modalTitle}>매장 선택</Text>
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
                            <Text style={commonStyles.modalTitle}>{selectedCorner?.cornerNm}</Text>
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
    totalRow: {backgroundColor: '#fafafa'},
    totalText: {fontWeight: '700', color: '#222'},

});


