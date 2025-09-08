import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";

type PurchaseRow = { date: string; vendor: string; amount: number };
type PurchaseDetailRow = { itemNm: string, qty: number, price: number, totalAmt: number };

export default function PurchaseDailyReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [vendorQuery, setVendorQuery] = useState('');
    const [submitted, setSubmitted] = useState({from: '2025/08/01', to: '2025/08/04', vendor: ''});
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedVendorName, setSelectedVendorName] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const baseData: PurchaseRow[] = useMemo(
        () => [
            {date: '2025/09/01', vendor: '거래처 A', amount: 120000},
            {date: '2025/09/01', vendor: '거래처 B', amount: 80000},
            {date: '2025/09/02', vendor: '거래처 A', amount: 60000},
            {date: '2025/09/03', vendor: '거래처 C', amount: 150000},
            {date: '2025/09/04', vendor: '거래처 A', amount: 90000},
            {date: '2025/09/04', vendor: '거래처 D', amount: 50000},
        ],
        []
    );

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {key: 'date', title: '일자', flex: 1, align: 'center'},
        {
            key: 'vendor', title: '거래처', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openVendorDetail(item.vendor)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.vendor}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'amount', title: '금액', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.amount.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, styles.totalRow]}>
            <View style={[{flex: 3}, commonStyles.cellDivider,]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
                    {fontSize: 13, fontWeight: 'bold'}]}>합계</Text>
            </View>
            <View>
                <Text
                    style={[commonStyles.cell, styles.totalText, {paddingRight: 10}]}>{totalAmount.toLocaleString()}</Text>
            </View>
        </View>
    );

    const filteredData = useMemo(() => {
        const from = submitted.from.replace(/\//g, '');
        const to = submitted.to.replace(/\//g, '');
        const v = submitted.vendor.trim();
        return baseData
            .filter(r => r.date.replace(/\//g, '') >= from && r.date.replace(/\//g, '') <= to)
            .filter(r => (v.length === 0 ? true : r.vendor.includes(v)));
    }, [baseData, submitted]);

    const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

    const onSearch = () => {
        setSubmitted({from: fromPurchaseDt, to: toPurchaseDt, vendor: vendorQuery});
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품', flex: 2.2, align: 'left'},
        {
            key: 'qty', title: '수량', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right', backgroundColor:'red'}]}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: '단가', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.price.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 2.2, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooter = () => (
        <View style={[commonStyles.modalTableRow, styles.modalTotalRow]}>
            <View style={{flex: 2.2}}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>합계</Text>
            </View>
            <View style={{flex: 1}}>
                <Text style={[commonStyles.cell, commonStyles.alignRight, styles.modalTotalText]}>
                    {detailTotalQty.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 3.7}}>
                <Text style={[commonStyles.cell, commonStyles.alignRight, styles.modalTotalText]}>
                    {detailTotalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openVendorDetail = (vendorName: string) => {
        setSelectedVendorName(vendorName);
        setIsDetailVisible(true);
    };

    type DetailRow = { no: number; itemNm: string; qty: number; price: number; totalAmt: number };
    const detailData: DetailRow[] = useMemo(
        () =>
            Array.from({length: 60}).map((_, idx) => {
                const qty = (idx % 5) + 1;
                const price = 1200 + (idx % 7) * 300;
                return {
                    no: idx + 1,
                    itemNm: `상품 ${idx + 1}`,
                    qty,
                    price,
                    totalAmt: qty * price,
                };
            }),
        []
    );

    const detailTotalAmount = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.totalAmt, 0);
    }, [detailData]);
    const detailTotalQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.qty, 0);
    }, [detailData]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRow, styles.filterRowSpacing]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text style={styles.tilde}>~</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>거래처</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="거래처 입력"
                        placeholderTextColor="#999"
                        value={vendorQuery}
                        onChangeText={setVendorQuery}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>조회</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table data={filteredData} columns={mainColumns} listFooter={renderFooter}/>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromPurchaseDt(dateToYmd(date));
                    else setToPurchaseDt(dateToYmd(date));
                }}
            />

            <Modal visible={isDetailVisible} transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedVendorName && (
                                <Text style={commonStyles.modalTitle}>{selectedVendorName}</Text>
                            )}

                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={PurchaseDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    filterRowSpacing: {
        marginBottom: 10,
    },
    filterLabel: {
        minWidth: 50,
        fontSize: 14,
        color: '#555',
    },
    tilde: {
        color: '#666',
    },
    input: {
        flex: 1,
        height: 40,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        color: '#333',
    },
    selectText: {
        fontSize: 14,
        color: '#333',
    },

    totalRow: {
        backgroundColor: '#fafafa',
    },
    totalText: {
        fontWeight: '700',
        color: '#222',
    },
    modalTotalRow: {
        backgroundColor: '#fafafa',
    },
    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    }
});


