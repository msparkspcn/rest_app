import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import {Ionicons} from "@expo/vector-icons";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User, SalesOrg} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    no: number;
    cornerNm: string;
    cornerCd: string;
    todayActualSaleAmt: number;
    yesterdayActualSaleAmt: number;
    monthlyActualSaleAmt: number;
    yearActualSaleAmt: number;
};

type SaleDetailRow = {
    no: number;
    itemNm: string;
    todaySaleQty: number;
    todayActualSaleAmt: number;
    monthlySaleQty: number;
    monthlyActualSaleAmt: number;
    yearActualSaleAmt: number;
}

type CornerRow = {
    no: number;
    cornerNm: string;
    cornerCd: string;
    posGroup: string;
    useYn: 'Y' | 'N';
};

export default function RealtimeSalesBySalesOrgScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string | null>(null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [detailChecked, setDetailChecked] = useState(false);
    const [appliedDetailChecked, setAppliedDetailChecked] = useState(false);
    const [selectedCorner, setSelectedCorner] = useState<CornerRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}: User = useUser();
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operDiv: Const.OPER_TYPE_REST,
            restValue: user.salesOrgCd,
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    setSalesOrgList(salesOrgList);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const handleCheckbox = () => {
        setDetailChecked(!detailChecked);
    };

    const aggregateSales = (rows?: SaleRow[] | null): SaleRow => {
        if (!Array.isArray(rows) || rows.length === 0) {
            return {
                no: 0,
                cornerCd: "",
                cornerNm: "합계",
                todayActualSaleAmt: 0,
                yesterdayActualSaleAmt: 0,
                monthlyActualSaleAmt: 0,
                yearActualSaleAmt: 0
            };
        }

        return rows.reduce((acc, cur) => ({
            no: 0,
            cornerCd: "",
            cornerNm: "합계",
            todayActualSaleAmt: acc.todayActualSaleAmt + (cur.todayActualSaleAmt ?? 0),
            yesterdayActualSaleAmt: acc.yesterdayActualSaleAmt + (cur.yesterdayActualSaleAmt ?? 0),
            monthlyActualSaleAmt: acc.monthlyActualSaleAmt + (cur.monthlyActualSaleAmt ?? 0),
            yearActualSaleAmt: acc.yearActualSaleAmt + (cur.yearActualSaleAmt ?? 0),
        }), {
            no: 0,
            cornerCd: "",
            cornerNm: "합계",
            todayActualSaleAmt: 0,
            yesterdayActualSaleAmt: 0,
            monthlyActualSaleAmt: 0,
            yearActualSaleAmt: 0
        });
    };

    const onSearch = () => {
        if(selectedSalesOrgCd=='' || selectedSalesOrgCd == undefined) {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }
        setAppliedDetailChecked(detailChecked);
        console.log("조회 클릭 saleDate:"+saleDate)
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        setLoading(true);

        api.mobRestSaleAnalysis(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("mobRestSaleAnalysis error:" + error)
            }).finally(() => setLoading(false));
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (sale: SaleRow) => {
        console.log('openDetail sale:'+JSON.stringify(sale))
        setSelectedCorner(sale);
        mobRestItemSaleAnalysis(sale);
    }

    const mobRestItemSaleAnalysis = (item:SaleRow) => {
        console.log("조회 클릭 saleDate:"+saleDate)
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: item.cornerCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        api.mobRestItemSaleAnalysis(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobRestItemSaleAnalysis error:" + error)
            });
    }

    const closeDetail = () => {
        setIsDetailVisible(false);
    };


    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => {
        const commonCols: ColumnDef<SaleRow>[] = [
            {
                key: 'yesterdayActualSaleAmt', title: '전일매출', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.yesterdayActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'todayActualSaleAmt', title: '당일매출', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.todayActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'monthlyActualSaleAmt', title: '월누계매출', flex: 1.1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.monthlyActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'yearActualSaleAmt', title: '년누계', flex: 1.3,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.yearActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
        ];

        if (detailChecked) {
            return [
                {
                    key: 'cornerNm',
                    title: Const.CORNER_NM,
                    flex: 1.3,

                    renderCell: (item) => (
                        <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                            <Text style={[commonStyles.cell, commonStyles.linkText,
                                {textAlign: 'left', paddingLeft: 5}]}
                            >
                                {item.cornerNm}
                            </Text>
                        </Pressable>
                    )
                },
                ...commonCols
            ];
        }

        return commonCols;
    }, [appliedDetailChecked]);

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'itemNm', title: '상품명', flex: 1.1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'todaySaleQty', title: Const.QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell]}>
                    {item.todaySaleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'todayActualSaleAmt', title: '금액', flex: 0.8,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell]}>
                    {Math.round(item.todayActualSaleAmt / 1000).toLocaleString()}
                </Text>
            )
        },
        {
            key: 'monthlySaleQty', title: '월누계\n수량', flex: 0.9,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell]}>
                    {item.monthlySaleQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'monthlyActualSaleAmt', title: '월누계금액', flex: 1.2,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell]}>
                    {Math.round(item.monthlyActualSaleAmt / 1000).toLocaleString()}
                </Text>
            )
        },
        {
            key: 'yearActualSaleAmt', title: '년누계금액', flex: 1.2,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell]}>
                    {Math.round(item.yearActualSaleAmt / 1000).toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const summaryRow = useMemo(() => {
        if (!(saleDetailList) || saleDetailList.length === 0) {
            return {
                totalQty: 0,
                totalAmt: 0,
                totalMonthAmt: 0,
                totalMonthlySaleQty: 0,
                totalYearAmt: 0,
            };
        }
        const totalQty = saleDetailList.reduce((sum, item) => sum + item.todaySaleQty, 0);
        const totalAmt = saleDetailList.reduce((sum, item) => sum + item.todayActualSaleAmt, 0);
        const totalMonthAmt = saleDetailList.reduce((sum, item) => sum + item.monthlyActualSaleAmt, 0);
        const totalMonthlySaleQty = saleDetailList.reduce((sum, item) => sum + item.monthlySaleQty, 0);
        const totalYearAmt = saleDetailList.reduce((sum, item) => sum + item.yearActualSaleAmt, 0);
        return {
            totalQty: totalQty,
            totalAmt: totalAmt,
            totalMonthAmt: totalMonthAmt,
            totalMonthlySaleQty: totalMonthlySaleQty,
            totalYearAmt: totalYearAmt,
        };
    }, [saleDetailList]);

    const CornerNmRow = () => {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10}}>
                <Text style={styles.subTitle}>{selectedCorner?.cornerNm}</Text>
                <Text style={styles.subTitle}>(단위:천원)</Text>
            </View>
        );
    };

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 1.1}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                        합계
                    </Text>
                </View>
                <View style={[{flex: 0.7}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>{summaryRow.totalQty.toLocaleString()}</Text>
                </View>
                <View style={[{flex: 0.8}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>{Math.round(summaryRow.totalAmt / 1000).toLocaleString()}</Text>
                </View>
                <View style={[{flex: 0.9}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>{summaryRow.totalMonthlySaleQty.toLocaleString()}</Text>
                </View>
                <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>{Math.round(summaryRow.totalMonthAmt / 1000).toLocaleString()}</Text>
                </View>
                <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>{Math.round(summaryRow.totalYearAmt / 1000).toLocaleString()}</Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>상세보기</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleCheckbox}
                    >
                        <View style={[commonStyles.checkbox, detailChecked && commonStyles.checkboxChecked]}>
                            {detailChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Text style={{textAlign: 'right', paddingHorizontal: 10, paddingTop: 10}}>(단위:천원)</Text>
            <Table
                data={appliedDetailChecked ? saleList : saleList ? [aggregateSales(saleList)] : []}
                columns={mainColumns}
                listFooter={
                    appliedDetailChecked
                        ? () => (
                            <View style={commonStyles.summaryRow}>
                                <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign: 'center'}]}>
                                        합계
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell, commonStyles.summaryLabelText]}>
                                        {Math.round(aggregateSales(saleList).yesterdayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell, commonStyles.summaryLabelText]}>
                                        {Math.round(aggregateSales(saleList).todayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1.1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell, commonStyles.summaryLabelText]}>
                                        {Math.round(aggregateSales(saleList).monthlyActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1.3}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.numberSmallCell, commonStyles.summaryLabelText]}>
                                        {Math.round(aggregateSales(saleList).yearActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        )
                        : undefined
                }
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

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>상품매출현황</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333"/>
                            </Pressable>

                        </View>
                        <CornerNmRow/>
                        <Table
                            data={saleDetailList}
                            columns={saleDetailColumns}
                            isModal={true}
                            listFooter={() => renderDetailFooterRow()}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cell: {
        fontSize: 11,
        color: '#444',
        width: '100%'
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '700',
        paddingTop: 20,
    },
});


