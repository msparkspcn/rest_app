import {commonStyles} from '@/styles';
import {Ionicons} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as api from "../../services/api/api";
import {
    dateToYm,
    formattedMonth,
    getTodayYm
} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";

type SaleRow = {
    cmpCd: string;
    salesOrgCd: string;
    storCd: string;
    cornerCd: string;
    cornerNm: string;
    totalSaleAmt: number;
    totalVatAmt: number;
    totalNetSaleAmt: number;

};

type SaleDetailRow = {
    saleDt: string;
    saleAmt: number;
    vatAmt: number;
    netSaleAmt: number;
}

type Corner = {
    cmpCd: string;
    salesOrgCd: string;
    storCd: string;
    cornerCd: string;
    cornerNm: string
};
type DetailType = 'daily' | 'monthly';
type DailyDetailRow = { saleDt: string; saleAmt: number, vatAmt: number, netSaleAmt: number };
type MonthlyDetailRow = { saleMonth: string; monthSaleQty: number, monthSaleAmt: number, monthVatAmt: number, monthNetSaleAmt: number };

export default function MonthlySalesReport() {
    const [cornerList, setCornerList] = useState<Corner[]>([]);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>('');
    const [fromSaleMonth, setFromSaleMonth] = useState(getTodayYm());
    const [toSaleMonth, setToSaleMonth] = useState(getTodayYm());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const [detailType, setDetailType] = useState<DetailType>('daily');
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);
    const {user} = useUser();

    useEffect(() => {
        console.log('api 테스트1');
        getCornerList();
    },[]);

    const getCornerList = () => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            cornerValue: ""
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    console.log('cornerList:' + JSON.stringify(cornerList))
                    setCornerList(cornerList);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    }

    const restMonthlyCornerSale = () => {
        console.log("조회 클릭 fromSaleMonth:"+fromSaleMonth)
        const request = {
            cmpCd: "SLKR",
            cornerCd: selectedCornerCd,
            fromSaleMonth: fromSaleMonth,
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleMonth: toSaleMonth
        }
        api.restMonthlyCornerSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("restMonthlyCornerSale error:" + error)
            });
    }

    const restMonthlySale = () => {
        console.log("restMonthlySale 조회 클릭 fromSaleMonth:"+fromSaleMonth+', toSaleMonth:'+toSaleMonth)
        const request = {
            cmpCd: "SLKR",
            cornerCd: 'CIBA',
            fromSaleMonth: fromSaleMonth,
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleMonth: toSaleMonth
        }
        api.restMonthlySale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('222:' + JSON.stringify(saleList))
                    setSaleDetailList(saleList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("restMonthlySale error:" + error)
            });
    }

    const onSearch = () => {
        restMonthlyCornerSale();
    };

    const openDetail = (sale: SaleRow, type: DetailType) => {
        console.log('openDetail type:' + type)
        restMonthlySale();
        setSelectedSale(sale);
        setDetailType(type);
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: Const.CORNER_NM, flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item, 'daily')}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.cornerNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalSaleAmt', title: Const.SALE_AMT, flex: 2,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item, 'monthly')}>
                    <Text style={[commonStyles.numberCell, commonStyles.linkText]}>
                        {item.totalSaleAmt.toLocaleString()}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalVatAmt', title: Const.VAT, flex: 1.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.totalVatAmt.toLocaleString()}</Text>
            ),
        },
        {
            key: 'totalNetSaleAmt', title: '순매출', flex: 2,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.totalNetSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2},
                commonStyles.tableRightBorder, commonStyles.cell, styles.totalText]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText]}>전체 합계</Text>
            </View>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmt.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalVatAmt.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberCell}>
                    {totalNetAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );


    const dailyDetailData: DailyDetailRow[] = useMemo(
        () => Array.from({length: 9}).map((_, index) => ({
            saleDt: `2025/09/0${index + 1}`,
            saleAmt: index * 1000,
            vatAmt: index * 10,
            netSaleAmt: index * 1000 - index * 10
        })),
        []
    );

    const DailyDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'saleDt', title: '일자', flex: 2, align: 'center'},
        {
            key: 'saleAmt', title: Const.SALE_AMT, flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.saleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'vatAmt', title: Const.VAT, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.vatAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'netSaleAmt', title: '순매출', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.netSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const MonthlyDetailColumns: ColumnDef<MonthlyDetailRow>[] = useMemo(() => [
        {key: 'saleMonth', title: '매출년월', flex: 1.5,
            renderCell: (item) => <Text
                style={commonStyles.numberCell}>{formattedMonth(item.saleMonth)}</Text>
        },
        {
            key: 'monthSaleQty', title: Const.QTY, flex: 1,
            renderCell: (item) => <Text
                style={commonStyles.numberSmallCell}>{item.monthSaleQty.toLocaleString()}</Text>
        },
        {
            key: 'monthSaleAmt', title: '총매출', flex: 2,
            renderCell: (item) => <Text
                style={commonStyles.numberSmallCell}>{item.monthSaleAmt.toLocaleString()}</Text>
        },
        {
            key: 'monthVatAmt', title: Const.VAT, flex: 1.5,
            renderCell: (item) => <Text
                style={commonStyles.numberSmallCell}>{item.monthVatAmt.toLocaleString()}</Text>
        },
        {
            key: 'monthNetSaleAmt', title: '순매출', flex: 2,
            renderCell: (item) => <Text
                style={commonStyles.numberSmallCell}>{item.monthNetSaleAmt.toLocaleString()}</Text>
        }
    ], []);

    const detailData = detailType === 'daily' ? dailyDetailData : saleDetailList;
    const detailColumns = detailType === 'daily' ? DailyDetailColumns : MonthlyDetailColumns;

    const renderDetailFooterRow = (type: DetailType) => {
        console.log("DetailType:" + JSON.stringify(type));
        if (type === 'daily') {
            return (
                <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                    <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                            합계
                        </Text>
                    </View>
                    <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {summaryRow.totalSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {summaryRow.totalVatAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {summaryRow.totalNetSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            );
        } else if (type === 'monthly') {
            return (
                <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                    <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                            합계
                        </Text>
                    </View>
                    <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {monthlySummaryRow.totalQty.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {monthlySummaryRow.totalAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {monthlySummaryRow.totalVatAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                        <Text style={commonStyles.numberSmallCell}>
                            {monthlySummaryRow.totalNetSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            )
        }

    };


    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const summaryRow = useMemo(() => {
        const totalSaleAmt = dailyDetailData.reduce((sum, item) => sum + item.saleAmt, 0);
        const totalVatAmt = dailyDetailData.reduce((sum, item) => sum + item.vatAmt, 0);
        const totalNetSaleAmt = dailyDetailData.reduce((sum, item) => sum + item.netSaleAmt, 0);
        return {
            totalSaleAmt: totalSaleAmt,
            totalVatAmt: totalVatAmt,
            totalNetSaleAmt: totalNetSaleAmt,
        };
    }, [dailyDetailData]);

    const monthlySummaryRow = useMemo(() => {
        if (saleDetailList) {
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.monthSaleQty, 0);
            const totalAmt = saleDetailList.reduce((sum, item) => sum + item.monthSaleAmt, 0);
            const totalVatAmt = saleDetailList.reduce((sum, item) => sum + item.monthVatAmt, 0);
            const totalNetSaleAmt = saleDetailList.reduce((sum, item) => sum + item.monthNetSaleAmt, 0);
            return {
                totalQty: totalQty,
                totalAmt: totalAmt,
                totalVatAmt: totalVatAmt,
                totalNetSaleAmt: totalNetSaleAmt,
            };
        }

    }, [saleDetailList]);


    const totalAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.totalSaleAmt, 0),
        [saleList]
    );

    const totalVatAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.totalVatAmt, 0),
        [saleList]
    );

    const totalNetAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.totalNetSaleAmt, 0),
        [saleList]
    );

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회월</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedMonth(fromSaleMonth)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedMonth(toSaleMonth)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table data={saleList} columns={mainColumns} listFooter={renderFooter}/>

            <View style={commonStyles.sectionDivider}/>

            <ListModal
                visible={showCornerModal}
                title="매장 선택"
                data={cornerList}
                keyField="cornerCd"
                labelField="cornerNm"
                onClose={() => setShowCornerModal(false)}
                onSelect={(item) => {
                    setSelectedCornerCd(item.cornerCd);
                    setShowCornerModal(false);
                }}
            />

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedSale?.cornerNm}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333"/>
                            </Pressable>
                        </View>

                        <Table
                            data={detailData}
                            columns={detailColumns}
                            isModal={true}
                            listFooter={() => renderDetailFooterRow(detailType)}
                        />
                    </View>
                </View>
            </Modal>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                pickerMode="month"
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleMonth(dateToYm(date));
                    else setToSaleMonth(dateToYm(date));
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {
        fontSize: 16,
        color: '#333',
    },
    totalText: {fontWeight: '700', color: '#222'},
});
