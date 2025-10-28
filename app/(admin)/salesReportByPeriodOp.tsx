import {commonStyles} from '@/styles';
import {Ionicons} from '@expo/vector-icons';
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
import * as api from "../../services/api/api";
import {formattedDate, ymdToDateWithDay, getTodayYmd, dateToYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import {User, SalesOrg} from "../../types";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    no: number;
    saleDt: string;
    salesOrgCd: string;
    orgNm: string;
    actualSaleAmt: number;
    operDiv: string;
    totalSaleAmt: number;
};

type SaleDetailRow = {
    saleDt: string;
    saleQty: number;
    actualSaleAmt: number;
    taxSaleAmt: number;
    dutyFreeSaleAmt: number;
}

export default function SalesReportByPeriodOp() {
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string | null>(null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<SaleRow[]>([]);
    const {user}: User = useUser();
    const [saleDetailList, setSaleDetailList] = useState([]);
    const [selectedOperDiv, setSelectedOperDiv] = useState("01");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    }, []);

    const getSalesOrgList = () => {
        const request = { cmpCd: user.cmpCd }

        api.getSalsOrgList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    setSalesOrgList([{salesOrgCd:'', salesOrgNm: '전체'}, ...salesOrgList]);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    };

    const totalSaleAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.actualSaleAmt, 0), [saleList]);

    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2.5, paddingLeft:0.5}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign: 'center'}]}>합계</Text>
            </View>
            <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberCell, styles.totalText]}>
                    {totalSaleAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const onSearch = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: fromSaleDt,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: toSaleDt
        }
        setLoading(true);
        api.mobOperPeriodSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    // console.log('list:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    setLoading(false);
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperPeriodSale error:" + error)
            });
    };


    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        console.log('사업소 클릭 sale:'+JSON.stringify(sale));
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: fromSaleDt,
            salesOrgCd: sale.salesOrgCd,
            storCd: "",
            toSaleDt: toSaleDt
        }
        console.log('request:'+JSON.stringify(request))
        api.mobOperSaleDetail(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    setSelectedOperDiv(sale.operDiv);
                    // console.log('saleDetailList:' + JSON.stringify(saleDetailList))

                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobOperSaleDetail error:" + error)
            });
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const tableData = useMemo(() => {
        if (!saleList) return []; // null 방지

        const result: (SaleRow & { isSummary?: boolean })[] = [];

        const grouped: Record<string, SaleRow[]> = {};
        saleList.forEach(item => {
            if (!grouped[item.operDiv]) grouped[item.operDiv] = [];
            grouped[item.operDiv].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort() // 날짜 오름차순
            .forEach(operDiv => {
                const rows = grouped[operDiv];
                let dateSum = 0;

                rows.forEach((item) => {
                    dateSum += item.actualSaleAmt;
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
                        saleDt: '',
                        salesOrgCd: '',
                        orgNm: summaryName,
                        actualSaleAmt: dateSum,
                        totalSaleAmt: dateSum,
                        operDiv:'',
                        isSummary: true,
                    });
                }
            });
        console.log("result:"+JSON.stringify(result));

        return result;
    }, [saleList]);

    const mainColumns: ColumnDef<SaleRow& { isSummary?: boolean; }>[] = useMemo(() => [
        {
            key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (item) => {
                if (item.isSummary) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.no}</Text>
                    )
            }
        },
        {
            key: 'orgNm', title: '사업소', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell,
                        item.isSummary ? {fontWeight: 'bold', textAlign: 'center'}
                        : commonStyles.linkText, {paddingLeft: 5}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'actualSaleAmt', title: '총매출', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isSummary ? { fontWeight: 'bold' } : null]}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ], [tableData]);

    const saleRestDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {
            key: 'saleDt', title: Const.DATE, flex: 1, align: 'left',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,
                    {textAlign: 'center', paddingRight: 10}]}>
                    {ymdToDateWithDay(item.saleDt)}
                </Text>
            )
        },
        {
            key: 'taxSaleAmt', title: Const.NET_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.taxSaleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'dutyFreeSaleAmt', title: Const.DUTY_FREE_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.dutyFreeSaleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: Const.TOTAL_SALE_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [selectedOperDiv]);

    const saleOilDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {
            key: 'saleDt', title: Const.DATE, flex: 1, align: 'left',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,
                    {textAlign: 'center', paddingRight: 10}]}>
                    {ymdToDateWithDay(item.saleDt)}
                </Text>
                )
        },
        {
            key: 'saleQty', title: Const.SALE_QTY, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: Const.TOTAL_SALE_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [selectedOperDiv]);

    const detailColumns = selectedOperDiv === '01' ? saleRestDetailColumns : saleOilDetailColumns;

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const summaryRow = useMemo(() => {
        if (saleDetailList) {
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            const totalAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalTaxAmt = saleDetailList.reduce((sum, item) => sum + item.taxSaleAmt, 0);
            const totalDutyFreeAmt = saleDetailList.reduce((sum, item) => sum + item.dutyFreeSaleAmt, 0);
            return {
                totalQty,
                totalAmt,
                totalTaxAmt,
                totalDutyFreeAmt,
            };
        }
    }, [saleDetailList]);

    const renderRestSummaryRow = () => {
        return (
            <View style={[commonStyles.summaryRow]}>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold'}
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {summaryRow.totalTaxAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {summaryRow.totalDutyFreeAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };

    const renderOilSummaryRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, styles.summaryRow]}>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={commonStyles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>{Const.SALES_ORG}</Text>
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
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table data={tableData} columns={mainColumns} listFooter={renderFooter}/>

            <View style={commonStyles.sectionDivider}/>

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

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedSale?.salesOrgNm}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333"/>
                            </Pressable>
                        </View>

                        <Table
                            data={saleDetailList}
                            columns={detailColumns}
                            isModal={true}
                            listFooter={selectedOperDiv === '01' ? renderRestSummaryRow() : renderOilSummaryRow()}
                        />
                    </View>
                </View>
            </Modal>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
                }}
            />
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    summaryRow: {
        backgroundColor: '#fff7e6'
    },
    totalText: {
        fontWeight: '700',
        color: '#222',
    },
    summaryLabelText: {
        fontWeight: '700',
        color: '#333'
    },
});
