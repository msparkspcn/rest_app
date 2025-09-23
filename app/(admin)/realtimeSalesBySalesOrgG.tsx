import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import {Ionicons} from "@expo/vector-icons";
import Const from "../../constants/Const";

type SaleRow = {
    no: number;
    cornerNm: string;
    todaySaleAmt: number;
    yedaySaleAmt: number;
    monthSaleAmt: number;
    yearSaleAmt: number;
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

    const [detailChecked, setDetailChecked] = useState(false);
    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 2}).map((_, idx) => {
                const todaySaleAmt = 10000 + (idx % 5) * 3000;
                const yedaySaleAmt = 20000 + (idx % 7) * 2500;
                const monthSaleAmt = 1000 * (idx % 4);
                const yearSaleAmt = 1000 * (idx % 4);
                return {
                    no: idx + 1,
                    cornerNm: idx % 2 === 0 ? '주유소' : '충전소',
                    todaySaleAmt,
                    yedaySaleAmt,
                    monthSaleAmt,
                    yearSaleAmt,
                };
            }),
        []
    );

    const handleCheckbox = () => {
        setDetailChecked(!detailChecked);
    };

    const aggregateSales = (rows: SaleRow[]): SaleRow => {
        return rows.reduce((acc, cur) => ({
            no: 0,
            cornerNm: "합계",
            todaySaleAmt: acc.todaySaleAmt + cur.todaySaleAmt,
            yedaySaleAmt: acc.yedaySaleAmt + cur.yedaySaleAmt,
            monthSaleAmt: acc.monthSaleAmt + cur.monthSaleAmt,
            yearSaleAmt: acc.yearSaleAmt + cur.yearSaleAmt,
        }), {no: 0, cornerNm: "합계", todaySaleAmt: 0, yedaySaleAmt: 0, monthSaleAmt: 0, yearSaleAmt: 0});
    };

    const filteredData = useMemo((): SaleRow[] => {
        return detailChecked
            ? baseData
            : [aggregateSales(baseData)];
    }, [baseData, detailChecked]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };


    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => {
        const commonCols: ColumnDef<SaleRow>[] = [
            {
                key: 'yedaySaleAmt', title: '전일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.yedaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'todaySaleAmt', title: '당일매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.todaySaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'monthSaleAmt', title: '월누계매출', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.monthSaleAmt.toLocaleString()}</Text>
                )
            },
            {
                key: 'yearSaleAmt', title: '년누계', flex: 1, align: 'center',
                renderCell: (item) => (
                    <Text style={[commonStyles.cell, {
                        textAlign: 'right',
                        paddingRight: 10
                    }]}>{item.yearSaleAmt.toLocaleString()}</Text>
                )
            },
        ];

        if (detailChecked) {
            return [
                {
                    key: 'cornerNm',
                    title: '매장명',
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
    }, [detailChecked]);

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
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
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
                data={filteredData}
                columns={mainColumns}
                listFooter={
                    detailChecked
                        ? () => (
                            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText,
                                        {textAlign:'center'}]}>합계</Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {aggregateSales(baseData).yedaySaleAmt.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {aggregateSales(baseData).todaySaleAmt.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {aggregateSales(baseData).monthSaleAmt.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, commonStyles.numberCell]}>
                                        {aggregateSales(baseData).yearSaleAmt.toLocaleString()}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {
        fontSize: 14, color: '#333'
    },

    subTitle: {
        fontSize: 14,
        fontWeight: '700',
        paddingVertical: 10,
    },
});


