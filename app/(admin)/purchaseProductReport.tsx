import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type PurchaseRow = { itemNm: string; qty: number; amount: number };
type PurchaseDetailRow = { vendorNm: string, date: string, qty: number, totalAmt: number };
export default function PurchaseProductReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [productQuery, setProductQuery] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItemNm, setSelectedItemNm] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const baseData: PurchaseRow[] = useMemo(
        () =>
            Array.from({length: 20}).map((_, idx) => {
                const qty = ((idx % 5) + 1) * 2;
                const price = 1000 + (idx % 7) * 250;
                return {
                    itemNm: `상품 ${idx + 1}`,
                    qty: qty,
                    amount: qty * price,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData
    }, [baseData]);

    const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

    const onSearch = () => {
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: '상품명', flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openProductDetail(item.itemNm)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'qty', title: Const.QTY, flex: 0.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'amount', title: '금액', flex: 0.8, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.amount.toLocaleString()}</Text>
            )
        },
    ]), []);

    const totalQty = useMemo(() => filteredData.reduce((acc, r) => acc + r.qty, 0), [filteredData]);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1.7}, commonStyles.tableRightBorder, styles.totalText]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText]}>합계</Text>
            </View>
            <View style={[{flex: 0.5}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalQty}
                </Text>
            </View>
            <View style={[{flex: 0.8}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const openProductDetail = (productName: string) => {
        setSelectedItemNm(productName);
        setIsDetailVisible(true);
    };


    const detailData: PurchaseDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                const totalAmt = qty * 100000;
                const day = (idx % 4) + 1;
                return {
                    vendorNm: `거래처 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    date: `2025/08/0${day}`,
                    qty: qty,
                    totalAmt: totalAmt,
                };
            }),
        []
    );

    const detailTotals = useMemo(
        () =>
            detailData.reduce(
                (acc, r) => {
                    acc.qty += r.qty;
                    acc.amount += r.totalAmt;
                    return acc;
                },
                {qty: 0, amount: 0}
            ),
        [detailData]
    );

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'vendorNm', title: '거래처', flex: 1.5, align: 'center'},
        {key: 'date', title: '일자', flex: 1.2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                    {item.date.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'qty', title: Const.QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.qty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);


    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2.7}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.modalCell, commonStyles.alignCenter, styles.modalTotalText]}>
                    {Const.TOTAL_AMT_SHORT}
                </Text>
            </View>
            <View style={[{flex: 0.5}, commonStyles.tableRightBorder]}>
                <Text
                    style={commonStyles.numberSmallCell}>
                    {detailTotals.qty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberSmallCell}>
                    {detailTotals.amount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={commonStyles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text style={commonStyles.tilde}>~</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>상품명</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholder="상품명 입력"
                        placeholderTextColor="#999"
                        value={productQuery}
                        onChangeText={setProductQuery}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
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

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedItemNm && <Text style={commonStyles.modalTitle}>{selectedItemNm}</Text>}
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
    totalRow: {backgroundColor: '#fafafa'},
    totalText: {fontWeight: '700', color: '#222'},
    modalTotalText: {fontWeight: '700', color: '#222'},
});
