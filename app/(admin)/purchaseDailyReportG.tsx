import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

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
        () =>
            Array.from({length: 9}).map((_, idx) => {
                return {
                    date: `2025/09/0${idx + 1}`,
                    vendor: `거래처${idx +1}`,
                    amount: idx * 10000,
                };
            }), []
    );

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'date', title: '일자', flex: 1.5, align: 'center'},
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
            key: 'amount', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.amount.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText, {textAlign:'center'}]}>
                    합계
                </Text>
            </View>
            <View style={[{flex:3.5}, commonStyles.tableRightBorder]}>
                <Text
                    style={[
                        commonStyles.cell,
                        commonStyles.numberCell,
                        styles.totalText,
                    ]}
                >
                    {totalAmount.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const filteredData = useMemo(() => {
        return baseData;

    }, [baseData, submitted]);

    const totalAmount = useMemo(() => filteredData.reduce((acc, r) => acc + r.amount, 0), [filteredData]);

    const onSearch = () => {
        setSubmitted({from: fromPurchaseDt, to: toPurchaseDt, vendor: vendorQuery});
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품', flex: 2, align: 'left'},
        {key: 'seq', title: '일련\n번호', flex: 1, align: 'left',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.no.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: Const.PRICE, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.price.toLocaleString()}</Text>
            )
        },
        {
            key: 'qty', title: Const.QTY, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 3}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 3}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.numberCell, styles.modalTotalText]}>
                    {detailTotalQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, , commonStyles.numberCell, styles.modalTotalText]}>
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
            Array.from({length: 5}).map((_, idx) => {
                const qty = (idx % 5) + 10000;
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
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text style={commonStyles.tilde}>~</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>거래처</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholder="거래처 입력"
                        placeholderTextColor="#999"
                        value={vendorQuery}
                        onChangeText={setVendorQuery}
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

            <Modal visible={isDetailVisible}
                   transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}
            >
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
};

const styles = StyleSheet.create({
    selectText: {
        fontSize: 14,
        color: '#333',
    },

    totalText: {
        fontWeight: '700',
        color: '#222',
    },

    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    },
    summaryLabelText: {
        fontWeight: '700',
        color: '#333'
    },
});


