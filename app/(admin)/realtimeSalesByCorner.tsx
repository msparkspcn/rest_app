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
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {User, Corner} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    storCd: string;
    cornerCd: string;
    cornerNm: string;
    actualSaleAmt: number;
    dailySaleRatio: number;
    monthlyActualSaleAmt: number;
    monthlySaleRatio: number
};
type SaleDetailRow = {
    no: number;
    itemNm: string;
    saleQty: number;
    actualSaleAmt: number;
    saleRatio: number;
}

export default function RealtimeSalesByCornerScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [cornerList, setCornerList] = useState<Corner[]>([]);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string>('');
    const [selectedCorner, setSelectedCorner] = useState<Corner>({"cornerCd":"", "storCd":""});
    const [showCornerListModal, setShowCornerListModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}: User = useUser();
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    setCornerList([
                        { cornerCd: '', cornerNm: '전체' },
                        ...cornerList
                    ]);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    },[]);

    const onSearch = (storCd: string, cornerCd: string) => {
        console.log("조회 클릭 saleDate11:"+saleDate)
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: cornerCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: storCd,
            toSaleDt: saleDate
        }
        setLoading(true);

        api.mobRestRealTimeSaleNews(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeSaleNews error:" + error)
            }).finally(() => setLoading(false));
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (sale: SaleRow, saleDate: string) => {
        setSelectedSale(sale)
        console.log("매출금액 클릭 item:"+JSON.stringify(sale)+",saleDate:"+saleDate);
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: sale.cornerCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: sale.storCd,
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        api.mobRestRealTimeItemSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('saleDetailList:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeItemSale error:" + error)
            });
    }

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: Const.CORNER_NM, flex: 1.4,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.cornerNm}
                </Text>
            ),
        },
        {
            key: 'actualSaleAmt', title: Const.SALE_AMT, flex: 1,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item, saleDate)}>
                    <Text style={[commonStyles.numberSmallCell, commonStyles.linkText]}>
                        {item.actualSaleAmt.toLocaleString()}
                    </Text>
                </Pressable>
            )
        },
        {
            key: 'dailySaleRatio', title: Const.COMP_RATIO, flex: 0.6,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.dailySaleRatio.toFixed(1)}%</Text>
            )
        },
        {
            key: 'monthlyActualSaleAmt', title: Const.MONTH_TOTAL_AMT, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.monthlyActualSaleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'monthlySaleRatio', title: Const.COMP_RATIO, flex: 0.6,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.monthlySaleRatio.toFixed(1)}%</Text>
            )
        },
    ]), [saleDate]);

    const totalSaleAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.actualSaleAmt, 0), [saleList]);
    const totalMonthSaleAmt = useMemo(() => (saleList ?? []).reduce((acc, r) => acc + r.monthlyActualSaleAmt, 0), [saleList]);


    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 1.4}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
                    {fontSize: 13, fontWeight: 'bold'}]}>
                    전체 합계
                </Text>
            </View>
            <View style={[{flex: 1.6}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberSmallCell]}>
                    {totalSaleAmt.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.6}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.numberSmallCell]}>
                    {totalMonthSaleAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );

    const summaryRow = useMemo(() => {
        if(saleDetailList) {
            const totalSaleAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            const totalCompRatio = saleDetailList.reduce((sum, item) => sum + item.saleRatio, 0);
            return {
                totalQty: totalQty,
                totalSaleAmt: totalSaleAmt,
                totalCompRatio: totalCompRatio
            };
        }
    }, [saleDetailList]);

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: Const.ITEM_NM, flex: 2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>{item.itemNm}</Text>
            )
        },
        {
            key: 'saleQty', title: Const.QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.actualSaleAmt.toLocaleString()}</Text>
            )
        },
        {
            key: 'saleRatio', title: Const.COMP_RATIO, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleRatio.toFixed(1)}%</Text>
            )
        },
    ]), []);

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
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1.5}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberCell]}>
                        {summaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.numberCell]}>
                        {summaryRow.totalCompRatio.toLocaleString()}%
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={() => onSearch(selectedCorner.storCd, selectedCorner.cornerCd)}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table
                data={saleList}
                columns={mainColumns}
                listFooter={renderFooter}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />

            <ListModal
                visible={showCornerListModal}
                title="매장 선택"
                data={cornerList}
                keyField="cornerCd"
                labelField="cornerNm"
                onClose={() => setShowCornerListModal(false)}
                onSelect={(item) => {
                    setSelectedCorner(item);
                    setSelectedCornerCd(item.cornerCd);
                    setShowCornerListModal(false);
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
                            <Text style={commonStyles.modalTitle}>{selectedSale?.cornerNm}</Text>
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
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    totalText: {fontWeight: '700', color: '#222'},
});


