import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";

type SaleRow = {
    no:number;
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
    price: number;
    totalAmt: number;
}

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
        }), { no: 0, cornerNm: "합계", todaySaleAmt: 0, yedaySaleAmt: 0, monthSaleAmt: 0, yearSaleAmt: 0 });
    };

    const filteredData = useMemo((): SaleRow[] => {
        return detailChecked
            ? baseData                // ✅ 상세보기 ON → 점포별 리스트
            : [aggregateSales(baseData)]; // ✅ 상세보기 OFF → 합계 1줄
    }, [baseData, detailChecked]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (posGroup: string) => {
    }


    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => {
        const commonCols: ColumnDef<SaleRow>[] = [
            {
                key: 'yedaySaleAmt', title: '전일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.yedaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'todaySaleAmt', title: '당일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.todaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'monthSaleAmt', title: '월누계매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.monthSaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'yearSaleAmt', title: '년누계', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.yearSaleAmt.toLocaleString()}</Text>
                )
            },
        ];

        if (detailChecked) {
            return [
                {
                    key: 'cornerNm',
                    title: '매장명',
                    flex: 1.5,
                    align: 'center',
                    renderCell: (item) => (
                        <Text style={[commonStyles.cell, {textAlign: 'left', paddingLeft: 10}]}>
                            {item.cornerNm}
                        </Text>
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
                const totalAmt = qty * 10000;
                return {
                    no: idx+1,
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty: qty,
                    price: qty * 10,
                    totalAmt: totalAmt,
                };
            }),
        []
    );

const SaleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품명', flex: 2, align: 'center'},
        {key: 'itemNm', title: '상품명', flex: 2, align: 'center'},
        {
            key: 'qty', title: '수량', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: '단가', flex: 1.5, align: 'right',
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
                <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowPosGroupModal(true)}>
                        <Text
                            style={styles.selectText}>{posGroups.find(g => g.id === selectedPosGroupId)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>상세보기</Text>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={handleCheckbox}
                    >
                        <View style={[styles.checkbox, detailChecked && styles.checkboxChecked]}>
                            {detailChecked && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>조회</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Text style={{textAlign:'right', paddingHorizontal:10, paddingTop:10}}>(단위:천원)</Text>
            <Table
                data={filteredData}
                columns={mainColumns}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    filterRowSpacing: {marginBottom: 10},
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
    checkboxContainer: {
        marginRight: 12,
        marginTop: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    checkmark: {
        color: '#fff',
        fontSize: 16,
    },
});


