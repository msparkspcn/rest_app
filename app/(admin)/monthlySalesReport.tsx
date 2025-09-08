import {commonStyles} from '@/styles';
import {Ionicons} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
    FlatList,
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
import {setAuthToken} from "../../services/api/api";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";

type SaleRow = {
    cmpCd: string;
    salesOrgCd: string;
    storCd: string;
    cornerCd: string;
    cornerNm: string;
    monthSaleAmt: number;
    monthVatAmt: number;
    monthNetSaleAmt: number;

};

type SaleDetailRow = {
    saleDt: string;
    saleAmt: number;
    vatAmt: number;
    netSaleAmt: number;
}

type CornerOption = { id: string; name: string };
type DetailType = 'daily' | 'monthly';
type DailyDetailRow = { saleDt: string; saleAmt: number, vatAmt: number, netSaleAmt: number };
type MonthlyDetailRow = { saleMonth: string; qty: number, totalAmt: number, vatAmt: number, netSaleAmt: number };

export default function MonthlySalesReport() {
    const corners: CornerOption[] = useMemo(
        () => Array.from({length: 12}).map((_, i) => ({id: `S${100 + i}`, name: `매장 ${i + 1}`})),
        []
    );
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>(corners[0]?.id ?? null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYm());
    const [toSaleDt, setToSaleDt] = useState(getTodayYm());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState([]);
    const [detailType, setDetailType] = useState<DetailType>('daily');

    useEffect(() => {
        console.log('api 테스트1')
        setAuthToken("1");
        getStoreInfo('5000511001', '1234')
    })

    const getStoreInfo = (userId, password) => {
        api.login(userId, password)
            .then(response => {
                if (response.data.responseBody != null) {
                    const userInfo = response.data.responseBody;
                    console.log('userInfo:' + JSON.stringify(userInfo))
                }
            })
            .catch(error => console.log("userInfo error:" + error))
            .finally()
    }

    const restDailySale = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: "SLKR",
            cornerCd: "CIBA",
            fromSaleMonth: "202507",
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleMonth: "202508"
        }
        api.restMonthlySale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("restDailySale error:" + error)
            });
    }

    const onSearch = () => {
        restDailySale();
    };

    // 전역 푸터 사용으로 지역 초기화 핸들러는 현재 미사용입니다.

    const openDetail = (sale: SaleRow, type: DetailType) => {
        console.log('openDetail type:'+type)
        setSelectedSale(sale);
        setDetailType(type);
        setIsDetailVisible(true);
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: '매장명', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item, 'daily')}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {paddingLeft: 10}]}>
                        {item.cornerNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'monthSaleAmt', title: '매출금액', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item, 'monthly')}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {textAlign: 'right', paddingRight: 10}]}>
                        {item.monthSaleAmt.toLocaleString()}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'monthVatAmt', title: '부가세', flex: 1.5, align: 'left',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.monthVatAmt.toLocaleString()}</Text>
            ),
        },
        {
            key: 'monthSaleAmt', title: '순매출', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.monthSaleAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, styles.totalRow]}>
            <View style={[{flex: 2}, commonStyles.cell, styles.totalText]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText]}>전체 합계</Text>
            </View>
            <View style={{flex: 2}}>
                <Text style={[commonStyles.cell, commonStyles.alignRight, styles.totalText, {paddingRight: 10}]}>
                    {totalAmt.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 1.5}}>
                <Text style={[commonStyles.cell, commonStyles.alignRight, styles.totalText, {paddingRight: 10}]}>
                    {totalVatMat.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 2}}>
                <Text style={[commonStyles.cell, commonStyles.alignRight, styles.totalText, {paddingRight: 10}]}>
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
            key: 'saleAmt', title: '매출금액', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>
                    {item.saleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'vatAmt', title: '부가세', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>
                    {item.vatAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'netSaleAmt', title: '순매출', flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'right'}]}>
                    {item.netSaleAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);

    const monthDetailData: MonthlyDetailRow[] = useMemo(
        () => Array.from({ length: 3 }).map((_, index) => ({
            saleMonth: `2025/0${index + 7}`, // 예: 7월, 8월, 9월
            qty: (index + 1) * 5,
            totalAmt: (index + 1) * 10000,
            vatAmt: (index + 1) * 1000,
            netSaleAmt: (index + 1) * 9000
        })),
        []
    );

    const MonthlyDetailColumns: ColumnDef<MonthlyDetailRow>[] = useMemo(() => [
        { key: 'saleMonth', title: '매출년월', flex: 2, align: 'center' },
        {
            key: 'qty', title: '수량', flex: 1, align: 'right',
            renderCell: (item) => <Text style={[commonStyles.cell, { textAlign: 'right' }]}>{item.qty.toLocaleString()}</Text>
        },
        {
            key: 'totalAmt', title: '총매출', flex: 2, align: 'right',
            renderCell: (item) => <Text style={[commonStyles.cell, { textAlign: 'right' }]}>{item.totalAmt.toLocaleString()}</Text>
        },
        {
            key: 'vatAmt', title: '부가세', flex: 1.5, align: 'right',
            renderCell: (item) => <Text style={[commonStyles.cell, { textAlign: 'right' }]}>{item.vatAmt.toLocaleString()}</Text>
        },
        {
            key: 'netSaleAmt', title: '순매출', flex: 2, align: 'right',
            renderCell: (item) => <Text style={[commonStyles.cell, { textAlign: 'right' }]}>{item.netSaleAmt.toLocaleString()}</Text>
        }
    ], []);

    const detailData = detailType === 'daily' ? dailyDetailData : monthDetailData;
    const detailColumns = detailType === 'daily' ? DailyDetailColumns : MonthlyDetailColumns;

    const renderDetailFooterRow = (type: DetailType) => {
        console.log("DetailType:"+JSON.stringify(type));
        if(type === 'daily') {
            return (
                <View style={[commonStyles.modalTableRow, styles.summaryRow]}>
                    <View style={{flex: 2}}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'center', fontSize: 13, fontWeight: 'bold'}]}>
                            합계
                        </Text>
                    </View>
                    <View style={{flex: 2}}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'right', paddingRight:5}]}>
                            {summaryRow.totalSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{flex: 1.5}}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'right', paddingRight:2}]}>
                            {summaryRow.totalVatAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{flex: 2}}>
                        <Text style={[commonStyles.modalCell, {textAlign: 'right'}]}>
                            {summaryRow.totalNetSaleAmt.toLocaleString()}
                        </Text>
                    </View>
                </View>
            );
        } else if (type === 'monthly') {
            return (
                <View style={[commonStyles.modalTableRow, styles.summaryRow]}>
                    <View style={{ flex: 2 }}>
                        <Text style={[commonStyles.modalCell, { textAlign: 'center', fontSize: 13, fontWeight: 'bold' }]}>
                            합계
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[commonStyles.modalCell, { textAlign: 'right', paddingRight: 5 }]}>
                            {monthlySummaryRow.totalQty.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={[commonStyles.modalCell, { textAlign: 'right', paddingRight: 5 }]}>
                            {monthlySummaryRow.totalAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{ flex: 1.5 }}>
                        <Text style={[commonStyles.modalCell, { textAlign: 'right', paddingRight: 2 }]}>
                            {monthlySummaryRow.totalVatAmt.toLocaleString()}
                        </Text>
                    </View>
                    <View style={{ flex: 2 }}>
                        <Text style={[commonStyles.modalCell, { textAlign: 'right' }]}>
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
        const totalQty = monthDetailData.reduce((sum, item) => sum + item.qty, 0);
        const totalAmt = monthDetailData.reduce((sum, item) => sum + item.totalAmt, 0);
        const totalVatAmt = monthDetailData.reduce((sum, item) => sum + item.vatAmt, 0);
        const totalNetSaleAmt = monthDetailData.reduce((sum, item) => sum + item.netSaleAmt, 0);
        return {
            totalQty: totalQty,
            totalAmt: totalAmt,
            totalVatAmt: totalVatAmt,
            totalNetSaleAmt: totalNetSaleAmt,
        };
    },[monthDetailData]);


    const totalAmt = useMemo(() => saleList.reduce((acc, r) => acc + r.monthSaleAmt, 0), [saleList]);
    const totalVatMat = useMemo(() => saleList.reduce((acc, r) => acc + r.monthVatAmt, 0), [saleList]);
    const totalNetAmt = useMemo(() => saleList.reduce((acc, r) => acc + r.monthNetSaleAmt, 0), [saleList]);

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={[commonStyles.filterRow, commonStyles.filterRowSpacing]}>
                    <Text style={commonStyles.filterLabel}>조회월</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedMonth(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedMonth(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{corners.find(g => g.id === selectedCornerCd)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>조회</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table data={saleList} columns={mainColumns} listFooter={renderFooter}/>

            <View style={commonStyles.sectionDivider}/>

            <Modal visible={showCornerModal} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.listModalHeader}>
                            <Text style={commonStyles.modalTitle}>매장 선택</Text>
                            <TouchableOpacity onPress={() => setShowCornerModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={corners}
                            keyExtractor={(item) => item.id}
                            style={commonStyles.modalList}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        setSelectedCornerCd(item.id);
                                        setShowCornerModal(false);
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedSale?.cornerNm}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={20} color="#333"/>
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
                    if (currentPickerType === 'from') setFromSaleDt(dateToYm(date));
                    else setToSaleDt(dateToYm(date));
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
    summaryRow: {
        backgroundColor: '#fff7e6'
    },
    totalRow: {backgroundColor: '#fafafa'},
    totalText: {fontWeight: '700', color: '#222'},
});
