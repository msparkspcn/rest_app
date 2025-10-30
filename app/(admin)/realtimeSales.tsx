import { AntDesign } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal } from "../../components/DatePickerModal";
import ListModal from "../../components/ListModal";
import LoadingOverlay from "../../components/LoadingOverlay";
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

type SaleDetailRow = {
    itemNm: string;
    saleQty: number;
    salePrc: number;
    actualSaleAmt: number;
}

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
    const [saleList, setSaleList] = useState<SaleRow[]>([]);
    const [saleDetailList, setSaleDetailList] = useState<SaleDetailRow[]>([]);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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
        api.getStorList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const storList = result.data.responseBody;
                    setStorList([{storCd: '', storNm: '전체'}, ...storList]);
                }
            })
            .catch(error => {
                console.log("getStorList error:" + error)
            });
    }

    const onSearch = async () => {
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
        setLoading(true);

        try {
            const result = await api.mobRestRealTimeSaleStat(request);
            if (result.data.responseBody != null) {
                const saleList = result.data.responseBody;
                console.log('saleList:' + JSON.stringify(saleList))
                console.log('length:'+saleList.length);
                setSaleList(saleList);
                if(saleList.length > 0) {
                    await mobRestRealTimeSaleResult();
                }
                setHasSearched(true);
            }
        } catch(error) {
            console.log("mobRestRealTimeSaleStat error:" + error)
        } finally {
            setLoading(false);
        }
    };

    const mobRestRealTimeSaleResult = async () => {
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: selectedStorCd,
            toSaleDt: saleDate
        }
        console.log('request2:'+JSON.stringify(request));

        try {
            const result = api.mobRestRealTimeSaleResult(request);
            if (result.data.responseBody != null) {
                const saleStatList = result.data.responseBody;
                console.log('saleStatList:' + JSON.stringify(saleStatList))
                setSaleStatList(saleStatList);
            }
        } catch (error) {
            console.log("mobRestRealTimeSaleResult error:" + error)
        }
    }

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
                console.log("mobRestRealTimeSaleDetail error:" + error)
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
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 5}]}>
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
            key: 'actualSaleAmt', title: '총매출', flex: 1.2,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), [])

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
        if (saleDetailList.length === 0) return null;

        const totalSaleAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
        const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
        return {
            totalQty: totalQty,
            totalSaleAmt: totalSaleAmt
        };
    }, [saleDetailList]);

    const summaryRow = useMemo(() => {
        if (saleList.length === 0) return null;

        const totalCashAmt = saleList.reduce((sum, item) => sum + item.cashAmt, 0);
        const totalEtcAmt = saleList.reduce((sum, item) => sum + item.cardAmt + item.etcPayAmt, 0);
        const totalAmt = totalCashAmt + totalEtcAmt;
        return {
            totalCashAmt: totalCashAmt,
            totalEtcAmt: totalEtcAmt,
            totalAmt: totalAmt,
        };
    }, [saleList]);

    const renderListHeader = () => {
        if(saleList.length == 0) return null;
        return (
            <View>
                {saleStatList.map(row => {
                    let lastWeekIsUp = row.saleAmt1 > 0;
                    let yesDayIsUp = row.saleAmt2 > 0;
                    return (
                        <View
                            key={row.sortOrder}
                            style={commonStyles.summaryRow}
                        >

                            <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                                <Text
                                    style={[{textAlign: 'center'}, commonStyles.cell,
                                        commonStyles.summaryLabelText]}>
                                    {row.label}
                                </Text>
                            </View>

                            {row.sortOrder === '1' && (
                                <View style={[{flex: 3.2}, commonStyles.columnContainer]}>
                                    <Text style={commonStyles.numberCell}>
                                        {row.saleAmt1.toLocaleString()} / {row.saleAmt2.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            {row.sortOrder === '2' && (
                                <View style={[{
                                    flex: 3.2,
                                    height: '100%',
                                    borderRightWidth: StyleSheet.hairlineWidth,
                                    borderBottomWidth: Platform.OS === 'android' ? 1 : StyleSheet.hairlineWidth,
                                    borderColor: '#aaa',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent:'flex-end'
                                }]}>
                                    <Text style={{fontSize: 12, color:'#444'}}>
                                        {row.saleAmt1.toLocaleString()}
                                    </Text>
                                    <AntDesign
                                        name={lastWeekIsUp ? 'caret-up' : 'caret-down'}
                                        size={13}
                                        color={lastWeekIsUp ? 'red' : 'blue'}
                                        style={{paddingHorizontal: 5}}
                                    />
                                    <Text style={{fontSize: 12, color:'#444'}}> /  {row.saleAmt2.toLocaleString()}
                                    </Text>
                                    <AntDesign
                                        name={yesDayIsUp ? 'caret-up' : 'caret-down'}
                                        size={13}
                                        color={yesDayIsUp ? 'red' : 'blue'}
                                        style={{paddingHorizontal: 5}}
                                    />
                                </View>
                            )}
                            {row.sortOrder === '3' && (
                                <>
                                    <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                        <Text style={[commonStyles.numberSmallCell]}>
                                            {summaryRow.totalCashAmt.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                        <Text style={[commonStyles.numberSmallCell]}>
                                            {summaryRow.totalEtcAmt.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                                        <Text style={[commonStyles.numberSmallCell]}>
                                            {summaryRow.totalAmt.toLocaleString()}
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    )
                })}
            </View>
        )
    };

    const renderDetailFooterRow = () => {
        return (
            <View style={commonStyles.summaryRow}>
                <View style={[{flex: 2.5}, commonStyles.columnContainer]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.5}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {detailSummaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 2.2}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberSmallCell]}>
                        {detailSummaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_DT}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>포스그룹</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowStorModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{storList.find(g => g.storCd === selectedStorCd)?.storNm || Const.ALL}</Text>
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
                listHeader={renderListHeader}
                hasSearched={hasSearched}
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
                            hasSearched={isDetailVisible}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};


