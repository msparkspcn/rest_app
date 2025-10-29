import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal } from "../../components/DatePickerModal";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { useUser } from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import { commonStyles } from "../../styles/index";
import { ColumnDef } from "../../types/table";
import { User } from "../../types/user";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";

type SaleRow = {
    no: number;
    cornerNm: string;
    todayActualSaleAmt: number;
    yesterdayActualSaleAmt: number;
    monthlyActualSaleAmt: number;
    yearActualSaleAmt: number;
};

export default function RealtimeSalesBySalesOrgScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [detailChecked, setDetailChecked] = useState(false);
    const [appliedDetailChecked, setAppliedDetailChecked] = useState(false);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}: User = useUser();
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

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
            salesOrgCd: user.salesOrgCd,
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
                    setHasSearched(true);
                }
            })
            .catch(error => {
                console.log("mobOilSaleAnalysis error:" + error)
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
                key: 'yesterdayActualSaleAmt', title: '전일매출', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>
                        {Math.round(item.yesterdayActualSaleAmt / 1000).toLocaleString()}
                    </Text>
                )
            },
            {
                key: 'todayActualSaleAmt', title: '당일매출', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>
                        {Math.round(item.todayActualSaleAmt / 1000).toLocaleString()}
                    </Text>
                )
            },
            {
                key: 'monthlyActualSaleAmt', title: '월누계매출', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>
                        {Math.round(item.monthlyActualSaleAmt / 1000).toLocaleString()}
                    </Text>
                )
            },
            {
                key: 'yearActualSaleAmt', title: '년누계', flex: 1,
                renderCell: (item) => (
                    <Text style={commonStyles.numberSmallCell}>
                        {Math.round(item.yearActualSaleAmt / 1000).toLocaleString()}
                    </Text>
                )
            },
        ];

        if (appliedDetailChecked) {
            return [
                {
                    key: 'cornerNm', title: Const.CORNER_NM, flex: 1.2,
                    renderCell: (item) => (
                        <Text style={[commonStyles.cell, {
                            textAlign: 'left',
                            paddingLeft: 5
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

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_DT}</Text>
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
                            <View style={commonStyles.summaryRow}>
                                <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText,
                                        {textAlign:'center'}]}>합계</Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).yesterdayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).todayActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).monthlyActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.columnContainer]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {Math.round(aggregateSales(saleList).yearActualSaleAmt / 1000).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        )
                        : undefined
                }
                hasSearched={hasSearched}
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


