import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import * as api from "../../services/api/api";
import DateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";
import {formattedDate, formattedDate2, getTodayString} from "../../utils/DateUtils";
import {setAuthToken} from "../../services/api/api";
import {Table} from "../../components/Table";

type SaleRow = {
    saleDtInfo: string;
    cornerNm: string;
    saleAmt: number;
};

type SaleData = {
    saleDt: string;
    saleAmt: number;
    totalSaleAmt: number;
    cornerCd: number;
    cornerNm: string;
}

type OperateFilter = '전체' | '운영' | '폐점';
type CornerOption = { id: string; name: string };

export default function SaleReportByPeriod() {
    const corners: CornerOption[] = useMemo(
        () => Array.from({ length: 12 }).map((_, i) => ({ id: `S${100 + i}`, name: `매장 ${i + 1}` })),
        []
    );
    const [submittedFilter, setSubmittedFilter] = useState<OperateFilter>('전체');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>(corners[0]?.id ?? null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayString());
    const [toSaleDt, setToSaleDt] = useState(getTodayString());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState([]);

    useEffect(() => {
        console.log('api 테스트1')
        setAuthToken("1");
        getStoreInfo('5000511001','1234')
    })

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
    }

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

    type Align = 'left' | 'center' | 'right';
    type ColumnDef<T> = {
        key: keyof T | string;
        title: string;
        flex: number;
        align?: Align;
        headerAlign?: Align;
        cellAlign?: Align;
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        { key: 'saleDtInfo',       title: '일자(요일)',     flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'center', paddingRight:10}]}>{formattedDate2(item.saleDt)}</Text>
            )},
        { key: 'cornerNm',     title: '매장명',   flex: 2,   align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.cornerNm}</Text>
                </Pressable>
            ),   },
        { key: 'saleAmt', title: '총매출', flex: 1.2, align: 'right',
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

    type ProductSaleRow = { no: number; itemNm: string, qty: number, price: number, totalAmt: number };
    const productData: ProductSaleRow[] = useMemo(
        () => Array.from({ length: 50 }).map((_, index) => ({
            no: index + 1,
            itemNm: `상품 ${index + 1}`,
            qty: index * 10,
            price: index * 10,
            totalAmt: index * 10 * 10
        })),
        []
    );

    const productColumns: ColumnDef<ProductSaleRow>[] = useMemo(() => ([
        { key: 'no',          title: 'No',     flex: 0.7, align: 'center' },
        { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left' },
        { key: 'qty', title: '수량',   flex: 1, align: 'right' },
        { key: 'price', title: '단가',   flex: 1.5, align: 'right' },
        { key: 'totalAmt', title: '금액',   flex: 2.2, align: 'right' },
    ]), []);

    const parseDate = (s: string) => {
        const [y, m, d] = s.split('/').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
    };
    const openDatePicker = (pickerType: string) => {
        setTempDate(parseDate(formattedDate(getTodayString())));
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };
    const formatDate = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}${m}${day}`;
    };

    const summartRow = useMemo(() => {
        const totalQty = productData.reduce((sum, item) => sum + item.qty, 0);
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
                        {summartRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View
                    style={[
                        { flex: 1.5 + 2.2},
                        alignStyles['right']
                    ]}
                >
                    <Text style={[commonStyles.modalCell, alignStyles['right']]}>
                        {summartRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark" />

            {/* 상단 필터 영역 */}
            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRow}>
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
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text style={commonStyles.selectText}>{corners.find(g => g.id === selectedCornerCd)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>조회</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider} />

            <Table data={saleList} columns={mainColumns}/>

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
                            <Text style={commonStyles.modalTitle}>{selectedSale?.cornerNm}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={20} color="#333" />
                            </Pressable>
                        </View>

                        <Table
                            data={productData}
                            columns={productColumns}
                            isModal={true}
                            listHeader={renderSummaryRow}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                visible={showDatePicker}
                transparent animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
            >
                <View style={commonStyles.dateModalOverlay}>
                    <View style={commonStyles.dateModalCard}>
                        <View style={commonStyles.dateModalHeader}>
                            <Text style={commonStyles.dateModalTitle}>조회일자 선택</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={commonStyles.dateModalPickerContainer}>
                            {tempDate && (
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                                        if (event.type === 'set' && date) {
                                            setTempDate(date);
                                        }
                                    }}
                                />
                            )}
                        </View>
                        <View style={commonStyles.modalActions}>
                            <Pressable
                                style={commonStyles.modalOkButton}
                                onPress={() => {
                                    if (tempDate) {
                                        if (currentPickerType === 'from') {
                                            console.log('tempDate:'+tempDate)
                                            setFromSaleDt(formatDate(tempDate));
                                        } else if (currentPickerType === 'to') {
                                            setToSaleDt(formatDate(tempDate));
                                        }
                                    }
                                    setShowDatePicker(false);
                                }}
                            >
                                <Text style={commonStyles.dateModalOkButtonText}>확인</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    selectText: {
        fontSize: 16,
        color: '#333',
    },
    linkText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    summaryRow: {
        backgroundColor: '#fff7e6'
    },
});
