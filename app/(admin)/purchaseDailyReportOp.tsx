import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {commonStyles} from "../../styles/index";
import {Table} from "../../components/Table";
import {dateToYmd, formattedDate, getTodayYmd, ymdToDateWithDay} from "../../utils/DateUtils";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User, SalesOrg} from "../../types";
import ListModal from "../../components/ListModal";
import LoadingOverlay from "../../components/LoadingOverlay";
type PurchaseRow = {
    salesOrgCd: string;
    salesOrgNm: string;
    operDiv: string;
    totalOrderCount: number,
    totalOrdAmt: number,
    totalReturnAmt: number,
    totalOrdVat: number,
    totalAmount: number
};
type PurchaseDetailRow = {
    dlvDt: string;
    outSdCmpCd: string;
    outSdCmpNm: string;
    totalAmount: number
};

export default function PurchaseDailyReportScreen() {
    const [fromPurchaseDt, setFromPurchaseDt] = useState(getTodayYmd());
    const [toPurchaseDt, setToPurchaseDt] = useState(getTodayYmd());
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedsalesOrgNm, setSelectedsalesOrgNm] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const {user}: User = useUser();

    const [purchaseList, setPurchaseList] = useState<[] | null>(null);
    const [purchaseItemList, setPurchaseItemList] = useState<[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    const getSalesOrgList = () => {
        const request = { cmpCd: user.cmpCd }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
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

    const mainColumns: ColumnDef<PurchaseRow& { isPurchaseSummary?: boolean; }>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (item) => {
                if (item.isPurchaseSummary) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.no}</Text>
                )
            }
        },
        {
            key: 'salesOrgNm', title: '사업장', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable}
                           onPress={() => openDetail(item)}
                >
                    <Text style={[commonStyles.cell,

                        item.isPurchaseSummary ? {fontWeight: 'bold', textAlign: 'center'} :commonStyles.linkText, {paddingLeft: 5}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalAmount', title: '금액', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isPurchaseSummary ? { fontWeight: 'bold' } : null]}>
                    {item.totalAmount.toLocaleString()}
                </Text>
            )
        },
    ]), [fromPurchaseDt, toPurchaseDt]);

    const tableData = useMemo(() => {
        if (!purchaseList) return [];

        const result: (PurchaseRow & { isPurchaseSummary?: boolean})[] = [];

        const grouped: Record<string, PurchaseRow[]> = {};
        purchaseList.forEach(item => {
            if (!grouped[item.operDiv]) grouped[item.operDiv] = [];
            grouped[item.operDiv].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort()
            .forEach(operDiv => {
                const rows = grouped[operDiv];
                let operSum = 0;
                rows.forEach((item) => {
                    operSum += item.totalAmount;
                    no += 1;
                    result.push({
                        ...item,
                        no: no
                    });
                });
                if(!selectedSalesOrgCd) {
                    let summaryName = '';
                    if (operDiv === '01') summaryName = '휴게소 소계';
                    else if (operDiv === '02') summaryName = Const.OIL_SUMMARY;
                    sumNo -= 1;
                    result.push({
                        no: sumNo,
                        salesOrgCd: '',
                        salesOrgNm: summaryName,
                        operDiv: '',
                        totalOrderCount: 0,
                        totalOrdAmt: 0,
                        totalReturnAmt: 0,
                        totalOrdVat: 0,
                        totalAmount: operSum,
                        isPurchaseSummary: true
                    });
                }
            });
        // console.log("result:"+JSON.stringify(result));

        return result;
    }, [purchaseList]);

    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2.5},commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign:'center'}]}>합계</Text>
            </View>
            <View style={[{flex:1}, commonStyles.columnContainer]}>
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

    const totalAmount = useMemo(() => (purchaseList ?? []).reduce((acc, r) => acc + r.totalAmount, 0), [purchaseList]);

    const onSearch = () => {
        const request = {
            cmpCd: user.cmpCd,
            fromDate: fromPurchaseDt,
            operDiv: "",
            salesOrgCd: selectedSalesOrgCd,
            toDate: toPurchaseDt
        }
        console.log('request1:'+JSON.stringify(request));
        setLoading(true);

        api.getPurchaseSummaryOp(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseList = result.data.responseBody;
                    console.log('purchaseList:' + JSON.stringify(purchaseList))
                    setPurchaseList(purchaseList);
                }
            })
            .catch(error => {
                console.log("getPurchaseSummaryOp error:" + error)
            }).finally(() => setLoading(false));
    };

    const PurchaseDetailColumns: ColumnDef<PurchaseDetailRow>[] = useMemo(() => ([
        {key: 'dlvDt', title: '일자(요일)', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,
                    {textAlign:'center', paddingRight:10}]}>
                    {ymdToDateWithDay(item.dlvDt)}
                </Text>
            )
        },
        {key: 'outSdCmpNm', title: '거래처', flex: 1.8, align: 'left'},
        {
            key: 'totalAmount', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalAmount.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderDetailFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 1}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 3.3}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell, styles.modalTotalText]}>
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

    const openDetail = (purchase: PurchaseRow) => {
        setSelectedsalesOrgNm(purchase.salesOrgNm);
        console.log('거래처 클릭 purchase:'+JSON.stringify(purchase));
        const request = {
            cmpCd: user.cmpCd,
            outSdCmpCd: "",
            fromDate: fromPurchaseDt,
            salesOrgCd: purchase.salesOrgCd,
            toDate: toPurchaseDt
        }
        console.log('request:'+JSON.stringify(request));

        api.getPurchaseSummary(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const purchaseItemList = result.data.responseBody;
                    purchaseItemList.sort((a, b) => {
                        if (a.dlvDt < b.dlvDt) return -1;
                        if (a.dlvDt > b.dlvDt) return 1;
                        return 0;
                    });
                    console.log('purchaseItemList:' + JSON.stringify(purchaseItemList));
                    setPurchaseItemList(purchaseItemList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("getPurchaseSummary error:" + error)
            });
    };

    const detailTotalAmount = useMemo(() => {
        return (purchaseItemList ?? []).reduce((acc, row) => acc + row.totalAmount, 0);
    }, [purchaseItemList]);

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장명</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
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
                        <Text style={commonStyles.selectText}>{formattedDate(fromPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text style={commonStyles.tilde}>~</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toPurchaseDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table data={tableData} columns={mainColumns} listFooter={renderFooter}/>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromPurchaseDt(dateToYmd(date));
                    else setToPurchaseDt(dateToYmd(date));
                }}
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

            <Modal visible={isDetailVisible}
                   transparent animationType="fade"
                   onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            {selectedsalesOrgNm && (
                                <Text style={commonStyles.modalTitle}>{selectedsalesOrgNm}</Text>
                            )}
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={purchaseItemList}
                            columns={PurchaseDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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


