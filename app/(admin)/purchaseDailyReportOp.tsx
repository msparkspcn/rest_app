import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {dateToYmd, formattedDate, getTodayYmd, ymdToDateWithDay} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type PurchaseRow = { salesOrgNm: string; amount: number };
type PurchaseDetailRow = { vendorNm: string; saleDtInfo: string; totalAmt: number; };
type SalesOrg =  {salesOrgCd: string; salesOrgNm: string};
export default function PurchaseDailyReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [salesOrgNmQuery, setsalesOrgNmQuery] = useState('');
    const [submitted, setSubmitted] = useState({from: '2025/08/01', to: '2025/08/04', salesOrgNm: ''});
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedsalesOrgNmName, setSelectedsalesOrgNmName] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);
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

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');

    const baseData: PurchaseRow[] = useMemo(
        () =>
            Array.from({length: 9}).map((_, idx) => {
                return {
                    salesOrgNm: `사업장${idx +1}`,
                    amount: idx * 10000,
                };
            }), []
    );

    const mainColumns: ColumnDef<PurchaseRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'salesOrgNm', title: '사업장', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable}
                           onPress={() => opensalesOrgNmDetail(item.salesOrgNm)}
                >
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'amount', title: '금액', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>
                    {item.amount.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2.5},commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign:'center'}]}>합계</Text>
            </View>
            <View style={[{flex:1}, commonStyles.tableRightBorder]}>
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
        setSubmitted({from: fromPurchaseDt, to: toPurchaseDt, salesOrgNm: salesOrgNmQuery});
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'saleDtInfo', title: '일자(요일)', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,
                    {textAlign:'center', paddingRight:10}]}>
                    {item.saleDtInfo}
                </Text>
            )
        },
        {key: 'vendorNm', title: '거래처', flex: 1.8, align: 'left'},
        {
            key: 'totalAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.totalAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 3.3}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.numberCell, styles.modalTotalText]}>
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

    const opensalesOrgNmDetail = (salesOrgNmName: string) => {
        setSelectedsalesOrgNmName(salesOrgNmName);
        setIsDetailVisible(true);
    };

    type DetailRow = { saleDtInfo: string; vendorNm: string; totalAmt: number };
    const detailData: DetailRow[] = useMemo(
        () =>
            Array.from({length: 5}).map((_, idx) => {
                const qty = (idx % 5) + 10000;
                const price = 1200 + (idx % 7) * 300;
                return {
                    saleDtInfo:ymdToDateWithDay(`2025090${idx+1}`),
                    vendorNm: `거래처 ${idx + 1}`,
                    totalAmt: qty * price,
                };
            }),
        []
    );

    const detailTotalAmount = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.totalAmt, 0);
    }, [detailData]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장명</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
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

            <Modal visible={isDetailVisible}
                   transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedsalesOrgNmName && (
                                <Text style={commonStyles.modalTitle}>{selectedsalesOrgNmName}</Text>
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

    totalRow: {
        height: 30,
        alignItems: 'center',
        backgroundColor: '#fafafa',
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


