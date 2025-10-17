import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import {User, SalesOrg} from "../../types";
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import ListModal from "../../components/ListModal";

type SaleRow = { tmzonDiv: string; actualSaleAmt: number, saleRatio: number };
type ListItem = {
    type: "summaryTotals";
    key: string;
    label: string;
    totalAmt: number;
    totalSaleRatio: number
};

export default function SalesReportByTimezoneScreen() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')

    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');

    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [saleList, setSaleList] = useState<SaleRow[]>([]);

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
        console.log('조회 클릭')
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: selectedSalesOrgCd,
            fromSaleDt: fromSaleDt,
            toSaleDt: toSaleDt,
            storCd: ""
        }
        console.log("request:"+JSON.stringify(request))
        api.mobOperTmzonSale(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result.data))
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("mobOperTmzonSale error:" + error)
            });
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'tmzonDiv', title: '시간대', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[{textAlign:'center'}, commonStyles.cell]}>{item.tmzonDiv}시</Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '판매금액', flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.actualSaleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'saleRatio', title: '비율', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.saleRatio.toFixed(2)}%
                </Text>
            )
        },
    ]), [])

    // 3행 요약 데이터 구성
    const summaryRows = useMemo(() => {
        const timeGroups = {
            dawn: ["01", "02", "03", "04", "05", "06"],       // 새벽
            morning: ["07", "08", "09", "10", "11", "12"],    // 오전
            afternoon: ["13", "14", "15", "16", "17", "18"],  // 오후
            night: ["19", "20", "21", "22", "23", "24"],      // 저녁
        };

        // ✅ 특정 구간 totalAmt 합산 함수
        const sumByGroup = (group: string[]) =>
            saleList
                .filter((row) => group.includes(String(row.tmzonDiv).padStart(2, "0")))
                .reduce(
                    (acc, row) => {
                        acc.totalSaleRatio += row.saleRatio;
                        acc.totalAmt += row.actualSaleAmt;
                        return acc;
                    },
                    {totalSaleRatio: 0, totalAmt: 0}
                );

        const dawnTotals = sumByGroup(timeGroups.dawn);
        const morningTotals = sumByGroup(timeGroups.morning);
        const afternoonTotals = sumByGroup(timeGroups.afternoon);
        const nightTotals = sumByGroup(timeGroups.night);

        const sign = (n: number) => (n >= 0 ? '+' : '-');

        const row1: ListItem = {
            type: 'summaryTotals',
            key: 'time-dawn',
            label: '새벽\n[01시-06시]',
            totalAmt: dawnTotals.totalAmt,
            totalSaleRatio: dawnTotals.totalSaleRatio
        };
        const row2: ListItem = {
            type: 'summaryTotals',
            key: 'time-morning',
            label: '오전\n[07시-12시]',
            totalAmt: morningTotals.totalAmt,
            totalSaleRatio: morningTotals.totalSaleRatio
        };
        const row3: ListItem = {
            type: 'summaryTotals',
            key: 'time-afternoon',
            label: '오후\n[13시-18시]',
            totalAmt: afternoonTotals.totalAmt,
            totalSaleRatio: afternoonTotals.totalSaleRatio
        };
        const row4: ListItem = {
            type: 'summaryTotals',
            key: 'time-night',
            label: '저녁\n[19시-24시]',
            totalAmt: nightTotals.totalAmt,
            totalSaleRatio: nightTotals.totalSaleRatio
        };
        return [row1, row2, row3, row4];
    }, [saleList]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회기간</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={styles.selectText}>
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
            <Table
                data={saleList}
                columns={mainColumns}
                listHeader={() => (
                    <View>
                        {summaryRows.map(row => (
                            <View key={row.key} style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={[styles.cell, styles.summaryLabelText, {textAlign: 'center'}]}>
                                        {row.label}
                                    </Text>
                                </View>
                                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                                    <Text style={commonStyles.numberCell}>
                                        {row.totalAmt.toLocaleString()}
                                    </Text>
                                </View>
                                <View style={[{
                                    flex: 0.5,
                                }, commonStyles.tableRightBorder]}>
                                    <Text style={commonStyles.numberCell}>
                                        {row.totalSaleRatio.toFixed(2)}%
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
                }}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    summaryRow: {backgroundColor: '#fff7e6'},
    summaryLabelText: {fontWeight: '600', fontSize: 12, color: '#333'},
    cell: {fontSize: 13, color: '#444'},
});


