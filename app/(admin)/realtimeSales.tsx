import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DatePickerModal } from "../../components/DatePickerModal";
import ListModal from "../../components/ListModal";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { useUser } from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import { commonStyles } from "../../styles/index";
import { Stor, User } from "../../types";
import { ColumnDef } from "../../types/table";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";

type SaleRow = {
    saleDt: string;
    storNm: string;
    storCd: string;
    cashAmt: number;
    cardAmt: number;
    etcPayAmt: number;
    actualSaleAmt: number
};
type SummaryTotals = {
    label: string;
    cashAmt: number;
    cardEtc: number;
    totalAmt: number
};
type SaleDetailRow = {
    itemNm: string;
    saleQty: number;
    salePrc: number;
    actualSaleAmt: number;
}
type ListItem =
    | { type: 'summaryPair'; key: string; label: string; pairText: string }
    | { type: 'summaryTotals'; key: string; label: string; cashAmt: number; cardEtc: number; totalAmt: number }
    | { type: 'detail'; key: string; no: number; storCd: string; cashAmt: number; cardEtc: number; totalAmt: number };

export default function RealtimeSales() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [storList, setStorList] = useState<Stor[]>([]);
    const [selectedStorCd, setSelectedStorCd] = useState<string | null>(null);
    const [showStorModal, setShowStorModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedStor, setSelectedStor] = useState<SaleRow | null>(null);
    const {user}:User = useUser();
    const [saleList, setSaleList] = useState<[] | null>(null);
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);

    useEffect(()=> {
        getStorList();
    },[]);

    const getStorList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operType: Const.OPER_TYPE_REST,
            salesOrgCd: user.salesOrgCd,
            storeValue: ""
        }
        console.log("request:" + JSON.stringify(request))
        api.getStorList(request)
            .then(result => {
                // console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const storList = result.data.responseBody;
                    setStorList([
                            {storCd: '', storNm: '전체'},
                            ...storList
                        ]
                    );
                }
            })
            .catch(error => {
                console.log("getStorList error:" + error)
            });
    }

    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 80}).map((_, idx) => {
                const cashAmt = 10000 + (idx % 5) * 3000;
                const cardAmt = 20000 + (idx % 7) * 2500;
                const etcPayAmt = 1000 * (idx % 4);
                return {
                    saleDt:'',
                    storCd: '',
                    storNm: `그룹 ${((idx % 6) + 1)}`,
                    cashAmt,
                    cardAmt,
                    etcPayAmt,
                    actualSaleAmt: cashAmt + cardAmt + etcPayAmt,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        if (!selectedStorCd) return baseData;
        const groupName = storList.find(g => g.storCd === selectedStorCd)?.storNm;
        return baseData.filter(r => (groupName ? r.storNm === groupName : true));
    }, [baseData, storList, selectedStorCd]);

    const onSearch = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: selectedStorCd,
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        api.mobRestRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeSaleStat error:" + error)
            });

    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (sale: SaleRow) => {
        setSelectedStor(sale);

        console.log(sale.storNm+" 클릭 item:"+JSON.stringify(sale));
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: sale.saleDt,
            salesOrgCd: user.salesOrgCd,
            storCd: sale.storCd,
            toSaleDt: sale.saleDt,
        }
        console.log('request:'+JSON.stringify(request));
        api.mobRestRealTimeSaleDetail(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('saleDetailList:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeItemSaleDetail error:" + error)
            });
    }

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {
            key: 'storNm', title: '포스그룹', flex: 1, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.storNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'cashAmt', title: '현금', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.cashAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'etcPayAmt', title: '카드 외', flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {(item.etcPayAmt + item.cardAmt).toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '총매출', flex: 1.2, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    // const totalValues = useMemo(() => {
    //     return filteredData.reduce(
    //         (acc, r) => {
    //             acc.cashAmt += r.cashAmt;
    //             acc.cardEtc += r.cardAmt + r.etcPayAmt;
    //             acc.totalAmt += r.actualSaleAmt;
    //             return acc;
    //         },
    //         {cashAmt: 0, cardEtc: 0, totalAmt: 0}
    //     );
    // }, [filteredData]);

    // 3행 요약 데이터 구성
    // const summaryRows = useMemo(() => {
    //     const today: SummaryTotals = {
    //         label: '당일합계',
    //         cashAmt: totalValues.cashAmt,
    //         cardEtc: totalValues.cardEtc,
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
    //     const row3: ListItem = {
    //         type: 'summaryTotals',
    //         key: 's-today',
    //         label: today.label,
    //         cashAmt: today.cashAmt,
    //         cardEtc: today.cardEtc,
    //         totalAmt: today.totalAmt
    //     };
    //     return [row1, row2, row3];
    // }, [totalValues]);

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: '상품명', flex: 2, align: 'left'},
        {
            key: 'saleQty', title: Const.QTY, flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'salePrc', title: Const.PRICE, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.salePrc.toLocaleString()}</Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '금액', flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.actualSaleAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const detailSummaryRow = useMemo(() => {
        if(saleDetailList) {
            const totalSaleAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            return {
                totalQty: totalQty,
                totalSaleAmt: totalSaleAmt
            };
        }
    }, [saleDetailList]);

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2.5}, commonStyles.tableRightBorder]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.5}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {detailSummaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 2.2}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {detailSummaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>포스그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text
                            style={styles.selectText}>{storList.find(g => g.storCd === selectedStorCd)?.storNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table
                data={saleList}
                columns={mainColumns}
                // listHeader={() => (
                //     <View>
                //         {summaryRows.map(row => (
                //             <View key={row.key} style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                //                 <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                //                     <Text style={[{textAlign: 'center'}, styles.cell, styles.summaryLabelText]}>
                //                         {row.label}
                //                     </Text>
                //                 </View>
                //                 <View style={[{flex: 3.2}]}>
                //                     <Text style={commonStyles.numberCell}>
                //                         {"pairText" in row ? row.pairText : ''}
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
                visible={showStorModal}
                title="포스그룹 선택"
                data={storList}
                keyField="storCd"
                labelField="storNm"
                onClose={() => setShowStorModal(false)}
                onSelect={(item) => {
                    setSelectedStorCd(item.storCd);
                    setShowStorModal(false);
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
                            {selectedStor && (
                                <Text style={commonStyles.modalTitle}>{selectedStor?.storNm}</Text>
                            )}
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={saleDetailList}
                            columns={saleDetailColumns}
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
    summaryLabelText: {fontWeight: '700', color: '#333'},
    cell: {fontSize: 13, color: '#444'},
    rightSpanText: {textAlign: 'right'},
});


