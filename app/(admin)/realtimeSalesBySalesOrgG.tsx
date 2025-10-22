import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User} from "../../types/user";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    no: number;
    cornerNm: string;
    todayActualSaleAmt: number;
    yesterdayActualSaleAmt: number;
    monthlyActualSaleAmt: number;
    yearActualSaleAmt: number;
};

type SaleDetailRow = {
    no: number;
    itemNm: string;
    qty: number;
    totalAmt: number;
    monthQty: number;
    monthAmt: number;
    yearAmt: number;
}

export default function RealtimeSalesBySalesOrgScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [detailChecked, setDetailChecked] = useState(false);
    const [appliedDetailChecked, setAppliedDetailChecked] = useState(false);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}: User = useUser();
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheckbox = () => {
        setDetailChecked(!detailChecked);
    };

    const aggregateSales = (rows: SaleRow[]): SaleRow => {
        return rows.reduce((acc, cur) => ({
            no: 0,
            cornerNm: "합계",
            todayActualSaleAmt: acc.todayActualSaleAmt + (cur.todayActualSaleAmt ?? 0),
            yesterdayActualSaleAmt: acc.yesterdayActualSaleAmt + (cur.yesterdayActualSaleAmt ?? 0),
            monthlyActualSaleAmt: acc.monthlyActualSaleAmt + (cur.monthlyActualSaleAmt ?? 0),
            yearActualSaleAmt: acc.yearActualSaleAmt + (cur.yearActualSaleAmt ?? 0),
        }), {no: 0, cornerNm: "합계", todayActualSaleAmt: 0, yesterdayActualSaleAmt: 0, monthlyActualSaleAmt: 0, yearActualSaleAmt: 0});
    };

    const onSearch = () => {
        console.log("조회 클릭 saleDate:"+saleDate)
        setAppliedDetailChecked(detailChecked);
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: '8100',
            storCd: "",
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request))
        setLoading(true);

        api.mobOilSaleAnalysis(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("mobRestSaleAnalysis error:" + error)
            })
            .finally(() => setLoading(false));
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };


    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => {
        const commonCols: ColumnDef<SaleRow>[] = [
            {
                key: 'yesterdayActualSaleAmt', title: '전일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.yesterdayActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'todayActualSaleAmt', title: '당일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.todayActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'monthlyActualSaleAmt', title: '월누계매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.monthlyActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
            {
                key: 'yearActualSaleAmt', title: '년누계', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>{Math.round(item.yearActualSaleAmt / 1000).toLocaleString()}</Text>
                )
            },
        ];

        if (appliedDetailChecked) {
            return [
                {
                    key: 'cornerNm',
                    title: Const.CORNER_NM,
                    flex: 1.2,
                    align: 'center',
                    renderCell: (item) => (
                        <Text style={[commonStyles.cell, {
                            textAlign: 'left',
                            paddingLeft: 10
                        }]}>
                            {item.cornerNm}
                        </Text>
                    )
                },
                ...commonCols
            ];
        }

        return commonCols;
    }, [appliedDetailChecked]);

    const detailData: SaleDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                const totalAmt = qty * 100;
                return {
                    no: idx + 1,
                    itemNm: `상품명 ${((idx % 6) + 1).toString().padStart(2, '0')}`,
                    qty: qty,
                    totalAmt: qty * 10,
                    monthAmt: totalAmt * 10,
                    monthQty: totalAmt,
                    yearAmt: totalAmt * 10,
                };
            }),
        []
    );

    const summaryRow = useMemo(() => {
        const totalSaleAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalQty = detailData.reduce((sum, item) => sum + item.qty, 0);
        const totalAmt = detailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalMonthAmt = detailData.reduce((sum, item) => sum + item.monthAmt, 0);
        const totalMonthQty = detailData.reduce((sum, item) => sum + item.monthQty, 0);
        const totalYearAmt = detailData.reduce((sum, item) => sum + item.yearAmt, 0);
        return {
            totalQty: totalQty,
            totalAmt: totalAmt,
            totalSaleAmt: totalSaleAmt,
            totalMonthAmt: totalMonthAmt,
            totalMonthQty: totalMonthQty,
            totalYearAmt: totalYearAmt,
        };
    }, [detailData]);


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
                data={saleList}
                columns={mainColumns}
                listFooter={
                    appliedDetailChecked
                        ? () => (
                            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText,
                                        {textAlign:'center'}]}>합계</Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).yesterdayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).todayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).monthlyActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
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
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}


