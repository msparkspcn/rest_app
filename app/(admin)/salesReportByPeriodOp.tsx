import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
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
import {formattedDate, ymdToDateWithDay, getTodayYmd, dateToYmd} from "../../utils/DateUtils";
import {setAuthToken} from "../../services/api/api";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type SaleRow = {
    saleDtInfo: string;
    salesOrgCd: string;
    salesOrgNm: string;
    saleAmt: number;
    salesOrgType: string;
};

type SaleData = {
    saleDt: string;
    saleAmt: number;
    totalSaleAmt: number;
    cornerCd: number;
    salesOrgNm: string;
}

type CornerOption = { id: string; name: string };

export default function SalesReportByPeriod() {
    const corners: CornerOption[] = useMemo(
        () => Array.from({ length: 12 }).map((_, i) => (
            { id: `S${100 + i}`, name: `주유소 ${i + 1}` }
        )),
        []
    );
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>(corners[0]?.id ?? null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState([]);

    useEffect(() => {
        console.log('api 테스트1')
        setAuthToken("1");
        getStoreInfo('5000511001','1234')
    },[])

    const getStoreInfo = (userId, password) => {
        api.login(userId, password)
            .then(response => {
                if (response.data.responseBody != null) {
                    const userInfo = response.data.responseBody;
                    console.log('userInfo:' + JSON.stringify(userInfo))
                }
            })
            .catch(error => console.log("userInfo error:"+error))
            .finally()
    }

    const restDailySale = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: "SLKR",
            cornerCd: "",
            detailDiv: "",
            fromSaleDt: fromSaleDt,
            itemClassCd: "string",
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleDt: toSaleDt
        }
        api.restDailySale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {console.log("restDailySale error:"+error)});
    };

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 2.5},commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.summaryLabelText,
                    {textAlign:'center'}]}>합계</Text>
            </View>
            <View style={[{flex:1.5}, commonStyles.tableRightBorder]}>
                <Text
                    style={[
                        commonStyles.cell,
                        commonStyles.numberCell,
                        styles.totalText,
                    ]}
                >
                    {/*{totalAmount.toLocaleString()}*/}
                </Text>
            </View>
        </View>
    );

    const onSearch = () => {
        restDailySale();
    };

    // 전역 푸터 사용으로 지역 초기화 핸들러는 현재 미사용입니다.

    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        setIsDetailVisible(true);
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            )},
        { key: 'salesOrgNm', title: '사업소', flex: 2, align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.salesOrgCd}</Text>
                </Pressable>
            ),   },
        { key: 'saleAmt', title: '총매출', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'right', paddingRight:10}]}>{item.saleAmt.toLocaleString()}</Text>
            )
        },
    ]), []);

    const alignStyles = {
        left: commonStyles.alignLeft,
        center: commonStyles.alignCenter,
        right: commonStyles.alignRight,
    } as const;

    type SaleDetailRow = {
        saleDtInfo: string;
        qty: number;
        netAmt: number;
        dutyFreeAmt: number;
        totalAmt: number
    };
    const productData: SaleDetailRow[] = useMemo(
        () => Array.from({ length: 15 }).map((_, index) => ({
            saleDtInfo: `상품 ${index + 1}`,
            netAmt: index * 10,
            dutyFreeAmt: index * 10,
            totalAmt: index * 10 * 10,
            qty: index * 5
        })),
        []
    );

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        { key: 'saleDtInfo', title: Const.DATE, flex: 1, align: 'left',
            renderCell: (item) => (
                <Text style={[commonStyles.cell,
                    {textAlign:'center', paddingRight:10}]}>
                    {ymdToDateWithDay('20250923')}
                </Text>
            )
        },
        { key: 'qty', title: Const.SALE_QTY, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.qty.toLocaleString()}
                </Text>
            )
        },
        { key: 'netAmt', title: Const.NET_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.netAmt.toLocaleString()}
                </Text>
            )
        },
        { key: 'dutyFreeAmt', title: Const.DUTY_FREE_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.dutyFreeAmt.toLocaleString()}
                </Text>
            )
        },
        { key: 'totalAmt', title: Const.TOTAL_SALE_AMT, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberSmallCell]}>
                    {item.totalAmt.toLocaleString()}
                </Text>
            )
        },
    ]), []);


    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const summaryRow = useMemo(() => {
        const totalQty = productData.reduce((sum, item) => sum + item.dutyFreeAmt, 0);
        const totalAmt = productData.reduce((sum, item) => sum + item.totalAmt, 0);
        return {
            totalQty,
            totalAmt
        };
    }, [productData]);

    const renderSummaryRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, styles.summaryRow]}>
                <View
                    style={[
                        { flex: 0.7 + 2.2 },
                        commonStyles.modalCellDivider,
                    ]}
                >
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold'}
                        ]}>합계</Text>
                </View>
                <View
                    style={[
                        { flex: 1 },
                        commonStyles.modalColumnContainer,
                        commonStyles.modalCellDivider,
                    ]}
                >
                    <Text style={[commonStyles.modalCell, alignStyles['left']]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View
                    style={[
                        { flex: 1.5 + 2.2},
                        alignStyles['right']
                    ]}
                >
                    <Text style={[commonStyles.modalCell, alignStyles['right']]}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark" />

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
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
                    <Text style={commonStyles.filterLabel}>{Const.SALES_ORG}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text style={commonStyles.selectText}>{corners.find(g => g.id === selectedCornerCd)?.name || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider} />

            <Table data={saleList} columns={mainColumns} listFooter={renderFooter}/>

            <View style={commonStyles.sectionDivider} />

            <Modal visible={showCornerModal} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalContent}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>매장 선택</Text>
                            <TouchableOpacity onPress={() => setShowCornerModal(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={corners}
                            keyExtractor={(item) => item.id}
                            style={commonStyles.modalList}
                            renderItem={({ item }) => (
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
                            <Text style={commonStyles.modalTitle}>{selectedSale?.salesOrgCd}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <Table
                            data={productData}
                            columns={saleDetailColumns}
                            isModal={true}
                            listHeader={renderSummaryRow}
                        />
                    </View>
                </View>
            </Modal>

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => {
                    if (currentPickerType === 'from') setFromSaleDt(dateToYmd(date));
                    else setToSaleDt(dateToYmd(date));
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
    totalText: {
        fontWeight: '700',
        color: '#222',
    },
    summaryLabelText: {
        fontWeight: '700',
        color: '#333'
    },
});
