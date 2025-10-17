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

type SaleRow = {
    no: number;
    orgNm: string;
    salesOrgCd: string;
    actualSaleAmt: number;
    operDiv: string;
    totalSaleAmt: number;
};
type SummaryTotals = {
    label: string;
    totalAmt: number
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

type ListItem =
    | { type: 'summaryPair'; key: string; label: string; pairText: string }
    | { type: 'summaryTotals'; key: string; label: string; totalAmt: number }
    | { type: 'detail'; key: string; no: number; posGroup: string; totalAmt: number };

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
    const [dcIncludedChecked, setDcIncludedChecked] = useState(false);
    const [appliedDcChecked, setAppliedDcChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [selectedSalesOrg, setSelectedSalesOrg] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [saleDetailList, setSaleDetailList] = useState<[] | null>([]);
    const [oilSaleDetailList, setOilSaleDetailList] = useState<[] | null>([]);
    const [selectedOperDiv, setSelectedOperDiv] = useState("01");

    useEffect(() => {
        getSalesOrgList();
    },[]);
    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: '',
            restValue: '',
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
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


    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
        console.log("조회 클릭")

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        // setLoading(true);
        api.mobOperRealTimeSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    // mobOperRealTimeSale();
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeSale error:" + error)
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

                rows.forEach((item) => {
                    storSum += item.actualSaleAmt;
                    no += 1;
                    result.push({
                        ...item,
                        no: no
                    });
                });
                if(!selectedSalesOrgCd) {
                    let summaryName = '';
                    if (operDiv === '01') summaryName = '휴게소 소계';
                    else if (operDiv === '02') summaryName = '주유소 소계';
                    sumNo -= 1;
                    result.push({
                        no: sumNo,
                        salesOrgCd: '',
                        orgNm: summaryName,
                        actualSaleAmt: storSum,
                        totalSaleAmt: storSum,
                        operDiv:'',
                        isSummary: true,
                    });
                }
            });
        console.log("result:"+JSON.stringify(result));

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
                    if (storCd === '01') summaryName = '주유소 소계';
                    else if (storCd === '02') summaryName = '충전소 소계';
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
                            : commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.salesOrgNm}
                    </Text>
                </Pressable>
            ),
        },
        {key: 'actualSaleAmt', title: '총매출', flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isSummary ? { fontWeight: 'bold' } : null]}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [tableData])

    // 3행 요약 데이터 구성
    // const summaryRows = useMemo(() => {
    //     const today: SummaryTotals = {
    //         label: '당일합계',
    //         totalAmt: totalValues.totalAmt
    //     };
    //     // 데모 수치 생성
    //     const yearCumulative = today.totalAmt * 200; // 연 누적 (예시)
    //     const monthCumulative = today.totalAmt * 15; // 월 누적 (예시)
    //     const prevWeekDelta = Math.round(today.totalAmt * 0.14); // 전주 매출 (예시)
    //     const prevDayDelta = Math.round(today.totalAmt * -0.046); // 전일 매출 (예시, 음수)
    //
    //     const sign = (n: number) => (n >= 0 ? '+' : '-');
    //     const pair1 = `${yearCumulative.toLocaleString()} / ${monthCumulative.toLocaleString()}`;
    //     const pair2 = `${sign(prevWeekDelta)}${Math.abs(prevWeekDelta).toLocaleString()} / ${sign(prevDayDelta)}${Math.abs(prevDayDelta).toLocaleString()}`;
    //
    //     const row1: ListItem = {type: 'summaryPair', key: 's-ym', label: '년/월 매출누적', pairText: pair1};
    //     const row2: ListItem = {type: 'summaryPair', key: 's-prev', label: '전주/전일 매출', pairText: pair2};
    //     const row3: ListItem = {type: 'summaryTotals', key: 's-today', label: '당일합계', totalAmt: today.totalAmt};
    //     return [row1, row2, row3];
    // }, [saleList]);

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
                            : commonStyles.linkText, {paddingLeft: 10}]}>
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
                <View style={[{flex: 2.5}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={[{flex: 1.1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {oilSaleSummaryRow.totalSaleQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
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
                <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {restSaleSummaryRow.totalCashAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {restSaleSummaryRow.totalEtcPayAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.3}, commonStyles.tableRightBorder]}>
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



    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
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
                // listHeader={() => (
                //     <View>
                //         {saleStatList.map(row => (
                //             <View key={row.sortOrder} style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                //                 <View style={[{flex:0.8}, commonStyles.tableRightBorder]}>
                //                     <Text style={[{paddingLeft:10},styles.cell, styles.summaryLabelText]}>{row.label}</Text>
                //                 </View>
                //                 <View style={[{ flex: 1 }]}>
                //                     <Text style={commonStyles.numberCell}>
                //                         {row.sortOrder === '1' || row.sortOrder === '2' ? row.pairText : row.totalAmt.toLocaleString()}
                //                     </Text>
                //                 </View>
                //             </View>
                //         ))}
                //     </View>
                // )}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    summaryLabelText: {fontWeight: '700', color: '#333'},
    cell: {fontSize: 13, color: '#444'},
});


