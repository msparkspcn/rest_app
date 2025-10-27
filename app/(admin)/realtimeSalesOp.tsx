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
import {AntDesign} from "@expo/vector-icons";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    no: number;
    orgNm: string;
    saleAmt: number;
    salesOrgCd: string;
    actualSaleAmt: number;
    netSaleAmt: number;
    operDiv: string;
    totalSaleAmt: number;
    vatAmt: number;
};

type SaleDetailRow = {
    storNm: string;
    cashAmt: number;
    cardAmt: number;
    etcPayAmt: number;
    actualSaleAmt: number;
}
type OilSaleDetailRow = {
    no: number;
    storCd: string;
    orgNm: string;
    gaugeNm: string;
    saleQty: number;
    actualSaleAmt: number;
    totalSaleAmt: number;
    isFirstRow: boolean;
};

export default function RealtimeSalesScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [vatExcludedChecked, setVatExcludedChecked] = useState(false);
    const [appliedVatChecked, setAppliedVatChecked] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(true);
    const [appliedDcChecked, setAppliedDcChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<SaleRow[]>([]);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [saleDetailList, setSaleDetailList] = useState<[] | null>([]);
    const [oilSaleDetailList, setOilSaleDetailList] = useState<[] | null>([]);
    const [selectedOperDiv, setSelectedOperDiv] = useState("01");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

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
    }


    const onSearch = () => {
        console.log("조회 클릭")
        setAppliedDcChecked(dcIncludedChecked);
        setAppliedVatChecked(vatExcludedChecked);
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);
        api.mobOperRealTimeSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    if(saleList.length > 0) {
                        mobOperRealTimeSaleStat();
                    }
                    else {
                        setLoading(false);
                    }
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSale error:" + error)
            });
    };

    const mobOperRealTimeSaleStat = () => {
        console.log("실적 조회")

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        // setLoading(true);
        api.mobOperRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleStatList = result.data.responseBody;
                    console.log('saleStatList:' + JSON.stringify(saleStatList))
                    setSaleStatList(saleStatList);
                }
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperRealTimeSaleStat error:" + error)
            });
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
            .sort()
            .forEach(operDiv => {
                const rows = grouped[operDiv];
                let storSum = 0;
                let netSaleSum = 0;
                rows.forEach((item) => {
                    if (appliedVatChecked && appliedDcChecked) storSum += item.saleAmt - item.vatAmt; //부가세 적용, DC적용 X
                    else if (appliedVatChecked && !appliedDcChecked) storSum += item.netSaleAmt; //부가세 적용, DC적용
                    else if (!appliedVatChecked && appliedDcChecked) storSum += item.saleAmt; //부가세 적용X, DC적용 X 총 매출
                    else if (!appliedVatChecked && !appliedDcChecked) storSum += item.actualSaleAmt; //부가세 적용X, DC적용 -> 기본값
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
                        orgNm: summaryName,
                        saleAmt: 0,
                        actualSaleAmt: 0,
                        totalSaleAmt: storSum,
                        operDiv:'',
                        isSummary: true,
                        vatAmt: 1, netSaleAmt: 0
                    });
                }
            });
        // console.log("result:"+JSON.stringify(result));

        return result;
    }, [saleList]);

    const oilDetailTableData = useMemo(() => {
        if (!oilSaleDetailList) return []; // null 방지
        console.log('data:'+JSON.stringify(oilSaleDetailList));

        const result: (OilSaleDetailRow & { isSummary?: boolean })[] = [];

        const grouped: Record<string, OilSaleDetailRow[]> = {};
        oilSaleDetailList.forEach(item => {
            if (!grouped[item.storCd]) grouped[item.storCd] = [];
            grouped[item.storCd].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort()
            .forEach(storCd => {
                const rows = grouped[storCd];
                let storSum = 0;
                let saleQtySum = 0;
                rows.forEach((item, idx) => {
                    storSum += item.actualSaleAmt;
                    saleQtySum += item.saleQty;
                    no += 1;
                    result.push({
                        ...item,
                        no: no,
                        isFirstRow: idx === 0 ? true : false,
                    });
                });
                if(!selectedSalesOrgCd) {
                    let summaryName = '';
                    if (storCd === '01') summaryName = Const.OIL_SUMMARY;
                    else if (storCd === '02') summaryName = Const.GAS_SUMMARY;
                    sumNo -= 1;
                    result.push({
                        no: sumNo,
                        storCd: '',
                        orgNm: summaryName,
                        gaugeNm: '',
                        saleQty: saleQtySum,
                        actualSaleAmt: storSum,
                        totalSaleAmt: storSum,
                        isSummary: true,
                        isFirstRow: false
                    });
                }
            });

        return result;
    }, [oilSaleDetailList]);

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (sale: SaleRow) => {
        setSelectedSalesOrg(sale);
        setSelectedOperDiv(sale.operDiv);

        if(sale.operDiv=='01') getRestSaleDetail();
        else getOilSaleDetail();
    }

    const getRestSaleDetail = () => {
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            toSaleDt: saleDate,
        }
        console.log('request:'+JSON.stringify(request));
        api.mobRestRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('saleDetailList:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeSaleStat error:" + error)
            });
    }

    const getOilSaleDetail = () => {
        console.log("조회 클릭")

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        api.mobOilRealTimeSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const oilSaleList = result.data.responseBody;
                    console.log('oilSaleList:' + JSON.stringify(oilSaleList))
                    setOilSaleDetailList(oilSaleList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSale error:" + error)
            });
    }

    const getDisplayAmt = (item: any) => {
        if (appliedVatChecked && appliedDcChecked) return item.saleAmt - item.vatAmt; //부가세 적용, DC적용 X
        if (appliedVatChecked && !appliedDcChecked) return item.netSaleAmt; //부가세 적용, DC적용
        if (!appliedVatChecked && appliedDcChecked) return item.saleAmt; //부가세 적용X, DC적용 X 총 매출
        if (!appliedVatChecked && !appliedDcChecked) return item.actualSaleAmt; //부가세 적용X, DC적용 -> 기본값
    };


    const mainColumns: ColumnDef<SaleRow& { isSummary?: boolean; }>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (item) => {
                if (item.isSummary) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.no}</Text>
                )
            }
        },
        {
            key: 'orgNm', title: '사업소', flex: 2, align: 'center',
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
        {key: 'actualSaleAmt', title: '총매출', flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isSummary ? { fontWeight: 'bold' } : null]}>
                    {getDisplayAmt(item).toLocaleString()}
                </Text>
            )
        },
    ]), [tableData])

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (item, index) => {
                if (item.isSummary) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index+1}</Text>
                )
            }
        },
        {
            key: 'orgNm', title: '포스그룹', flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell,
                        item.isSummary ? {fontWeight: 'bold', textAlign: 'center'}
                            : commonStyles.linkText, {paddingLeft: 5}]}>
                        {item.storNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'cashAmt', title: Const.CASH, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'etcPayAmt', title: Const.CARD_ETC, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {(item.etcPayAmt + item.cardAmt).toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '금액', flex: 1.3, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [selectedOperDiv]);

    const saleOilDetailColumns: ColumnDef<OilSaleDetailRow& {isSummary?: boolean;}>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '매장', flex: 1,
            renderCell: (item) => {
                if(!item.isFirstRow) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                        {item.storNm}
                    </Text>
                )
            }
        },
        {
            key: 'gaugeNm', title: '게이지', flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.gaugeNm}
                </Text>
            )
        },
        {
            key: 'saleQty', title: Const.SALE_QTY, flex: 1.1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: Const.TOTAL_SALE_AMT, flex: 1.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [selectedOperDiv]);

    const restSaleSummaryRow = useMemo(() => {
        if(saleDetailList) {
            const totalSaleAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalCashAmt = saleDetailList.reduce((sum, item) => sum + item.cashAmt, 0);
            const totalEtcPayAmt = saleDetailList.reduce((sum, item) => sum + item.cardAmt + item.etcPayAmt, 0);
            return {
                totalCashAmt: totalCashAmt,
                totalSaleAmt: totalSaleAmt,
                totalEtcPayAmt: totalEtcPayAmt
            };
        }
    }, [saleDetailList]);

    const oilSaleSummaryRow = useMemo(() => {
        if(oilSaleDetailList) {
            const totalSaleAmt = oilSaleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalSaleQty = oilSaleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            return {
                totalSaleAmt: totalSaleAmt,
                totalSaleQty: totalSaleQty
            };
        }
    }, [oilSaleDetailList]);

    const renderOilSaleDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2.5}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={[{flex: 1.1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {oilSaleSummaryRow.totalSaleQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {oilSaleSummaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        )
    }

    const renderRestSaleDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2}, commonStyles.columnContainer]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {restSaleSummaryRow.totalCashAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {restSaleSummaryRow.totalEtcPayAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {restSaleSummaryRow.totalSaleAmt.toLocaleString()}
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

    const renderListHeader = () => {
        if (saleList.length == 0) return null;
        return (
            <View style={{borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#aaa', backgroundColor:'red'}}>
                {saleStatList.map(row => {
                    let saleValue1;
                    let saleValue2;
                    console.log('row1:'+JSON.stringify(row));

                    if (appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1 - row.vatAmt1;
                        saleValue2 = row.saleAmt2 - row.vatAmt2;

                    } //부가세 적용, DC적용 X
                    if (appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.netSaleAmt1;
                        saleValue2 = row.netSaleAmt2;
                    } //부가세 적용, DC적용
                    if (!appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1;
                        saleValue2 = row.saleAmt2;
                    } //부가세 적용X, DC적용 X 총 매출
                    if (!appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.actualSaleAmt1;
                        saleValue2 = row.actualSaleAmt2;
                    }
                    let lastWeekIsUp = saleValue1 > 0;
                    let yesDayIsUp = saleValue2 > 0
                    console.log('saleValue1:'+saleValue1+', saleValue2:'+saleValue2);
                    return (
                        <View
                            key={row.sortOrder}
                            style={[commonStyles.summaryRow,
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 0,
                                    width: '100%'
                                },
                            ]}
                        >
                            <View style={[{flex: 1, justifyContent: 'center'}, commonStyles.columnContainer]}>
                                <Text style={[{paddingLeft: 5}, styles.cell, styles.summaryLabelText]}>
                                    {row.label}
                                </Text>
                            </View>
                            <View style={[{flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end',
                                height: '100%',
                                borderRightWidth: StyleSheet.hairlineWidth,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderColor: '#aaa'}]}>
                                {(row.sortOrder === '1') && (
                                    <View style={{flexDirection: 'row', alignItems:'center'}}>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue1.toLocaleString()}  /  </Text>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue2.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                                {(row.sortOrder === '2') && (
                                    <View style={{flexDirection: 'row', alignItems:'center'}}>
                                        <Text style={{fontSize: 12}}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={lastWeekIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={lastWeekIsUp ? 'red' : 'blue'}
                                            style={{paddingHorizontal: 5}}
                                        />
                                        <Text style={{fontSize: 12}}>  /  {saleValue2.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={yesDayIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={yesDayIsUp ? 'red' : 'blue'}
                                            style={{paddingHorizontal: 5}}
                                        />
                                    </View>
                                )}
                                {(row.sortOrder === '3') && (
                                    <View style={{flexDirection: 'row', alignItems:'center'}}>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
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
                data={tableData}
                columns={mainColumns}
                listHeader={renderListHeader}
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
                            data={selectedOperDiv === '01' ? saleDetailList : oilDetailTableData}
                            columns={selectedOperDiv === '01' ? saleDetailColumns : saleOilDetailColumns}
                            isModal={true}
                            listFooter={selectedOperDiv === '01' ? renderRestSaleDetailFooterRow : renderOilSaleDetailFooterRow}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    summaryLabelText: {fontWeight: '700', color: '#333'},
    cell: {fontSize: 13, color: '#444'},
});


