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
import {formattedDate, getTodayString} from "../../utils/DateUtils";
import {restDailySale, setAuthToken} from "../../services/api/api";

type StoreRow = {
    no: number;
    name: string;
    code: string;
    posGroup: string;
    useYn: 'Y' | 'N';
};

type OperateFilter = '전체' | '운영' | '폐점';
type CornerOption = { id: string; name: string };

export default function SaleReportByPeriod() {
    const corners: CornerOption[] = useMemo(
        () => Array.from({ length: 12 }).map((_, i) => ({ id: `S${100 + i}`, name: `매장 ${i + 1}` })),
        []
    );
    const [submittedFilter, setSubmittedFilter] = useState<OperateFilter>('전체');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>(corners[0]?.id ?? null);
    const [submittedCornerCd, setSubmittedCornerCd] = useState<string | null>(corners[0]?.id ?? null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayString());
    const [toSaleDt, setToSaleDt] = useState(getTodayString());
    const [currentPickerType, setCurrentPickerType] = useState('from')

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
            fromSaleDt: "20250820",
            itemClassCd: "string",
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleDt: "20250825"
        }
        api.restDailySale(request)
            .then(result => {
                const { responseCode, responseBody } = result;
                if (responseCode === "200" && responseBody != null) {
                    const dailySaleInfo = responseBody;
                    console.log('dailySaleInfo:', JSON.stringify(dailySaleInfo));
                } else {
                    console.error('API 응답 오류 '+responseCode+", responseBody:"+responseBody);
                }
            })
            .catch(error => {
                // Already handled in the getRestDailySale function, but good to have.
            });
    }

    // 테스트 데이터 생성
    const baseData: StoreRow[] = useMemo(() => {
        const rows: StoreRow[] = [];
        for (let i = 1; i <= 30; i += 1) {
            rows.push({
                no: i,
                name: `매장 ${i.toString().padStart(2, '0')}`,
                code: `S${(1000 + i).toString()}`,
                posGroup: `그룹 ${((i % 5) + 1).toString()}`,
                useYn: i % 3 === 0 ? 'N' : 'Y',
            });
        }
        return rows;
    }, []);

    const filteredData = useMemo(() => {
        if (submittedFilter === '전체') return baseData;
        if (submittedFilter === '운영') return baseData.filter(r => r.useYn === 'Y');
        return baseData.filter(r => r.useYn === 'N');
    }, [baseData, submittedFilter]);

    const onSearch = () => {
        restDailySale();
        // setSubmittedFilter(operateFilter);
        //api 호출 처리 필요
    };

    // 전역 푸터 사용으로 지역 초기화 핸들러는 현재 미사용입니다.

    const openDetail = (store: StoreRow) => {
        setSelectedStore(store);
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

    const mainColumns: ColumnDef<StoreRow>[] = useMemo(() => ([
        { key: 'date',       title: '일자(요일)',     flex: 1, align: 'center' },
        { key: 'name',     title: '매장명',   flex: 2,   align: 'left'   },
        { key: 'saleAmt', title: '총매출', flex: 1.5, align: 'left'   },
    ]), []);

    const alignStyles = {
        left: commonStyles.alignLeft,
        center: commonStyles.alignCenter,
        right: commonStyles.alignRight,
    } as const;

    const renderHeader = () => (
        <View style={commonStyles.tableHeaderRow}>
            {mainColumns.map((col, i) => (
                <View
                    key={String(col.key)}
                    style={[
                        { flex: col.flex },
                        commonStyles.columnContainer,
                        i < mainColumns.length - 1 && styles.headerCellDivider,
                    ]}
                >
                    <Text
                        style={[
                            commonStyles.headerCell,
                            alignStyles[col.headerAlign ?? col.align ?? 'left'],
                        ]}
                    >
                        {col.title}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderItem = ({ item, index }: { item: StoreRow; index: number }) => (
        <View style={[commonStyles.tableRow, index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd]}>
            {mainColumns.map((col, i) => {
                const value = col.key === 'useYn' ? (item.useYn === 'Y' ? '운영' : '폐점')
                    : (item as any)[col.key];
                return (
                    <View
                        key={String(col.key)}
                        style={[
                            { flex: col.flex },
                            commonStyles.columnContainer,
                            i < mainColumns.length - 1 && commonStyles.cellDivider,
                        ]}
                    >
                        {col.key === 'name' ? (
                            <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                                <Text
                                    style={[
                                        commonStyles.cell,
                                        alignStyles[col.cellAlign ?? col.align ?? 'left'],
                                        styles.linkText,
                                    ]}
                                >
                                    {value}
                                </Text>
                            </Pressable>
                        ) : (
                            <Text
                                style={[
                                    commonStyles.cell,
                                    alignStyles[col.cellAlign ?? col.align ?? 'left'],
                                ]}
                            >
                                {value}
                            </Text>
                        )}
                    </View>
                );
            })}
        </View>
    );

    type ProductRow = { no: number; productCode: string; productName: string };
    const productData: ProductRow[] = useMemo(
        () => Array.from({ length: 205 }).map((_, index) => ({
            no: index + 1,
            productCode: `P${1001 + index}`,
            productName: `상품 ${index + 1}`,
        })),
        []
    );

    const productColumns: ColumnDef<ProductRow>[] = useMemo(() => ([
        { key: 'no',          title: 'No',     flex: 0.7, align: 'center' },
        { key: 'productCode', title: '상품코드',  flex: 1.4, align: 'left' },
        { key: 'productName', title: '상품명',   flex: 2.2, align: 'left'   },
    ]), []);

    const renderProductHeader = () => (
        <View style={commonStyles.modalTableHeaderRow}>
            {productColumns.map((col, i) => (
                <View
                    key={String(col.key)}
                    style={[
                        { flex: col.flex },
                        styles.modalHeaderContainer,
                        i < productColumns.length - 1 && styles.modalHeaderCellDivider,
                    ]}
                >
                    <Text
                        style={[
                            commonStyles.modalHeaderCell,
                            alignStyles[col.headerAlign ?? col.align ?? 'left'],
                        ]}
                    >
                        {col.title}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderProductItem = ({ item, index }: { item: ProductRow; index: number }) => (
        <View style={[commonStyles.modalTableRow, index % 2 === 0 ? commonStyles.tableRowEven : commonStyles.tableRowOdd]}>
            {productColumns.map((col, i) => (
                <View
                    key={String(col.key)}
                    style={[
                        { flex: col.flex },
                        commonStyles.modalColumnContainer,
                        i < productColumns.length - 1 && commonStyles.modalCellDivider,
                    ]}
                >
                    <Text
                        style={[
                            commonStyles.modalCell,
                            alignStyles[col.cellAlign ?? col.align ?? 'left'],
                        ]}
                    >
                        {(item as any)[col.key]}
                    </Text>
                </View>
            ))}
        </View>
    );


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
    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark" />

            {/* 상단 필터 영역 */}
            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => openDatePicker('from')}>
                        <Text style={styles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={styles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={styles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text style={commonStyles.selectText}>{corners.find(g => g.id === selectedCornerCd)?.name || '선택'}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>조회</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider} />

            {/* 그리드 영역 */}
            <View style={commonStyles.tableContainer}>
                {renderHeader()}
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => String(item.no)}
                    renderItem={renderItem}
                    style={styles.tableList}
                    contentContainerStyle={styles.tableListContent}
                    bounces={false}
                    alwaysBounceVertical={false}
                    overScrollMode="never"
                    showsVerticalScrollIndicator
                />
            </View>

            <View style={commonStyles.sectionDivider} />

            {/* 전역 레이아웃의 푸터를 사용합니다. */}

            {/* 상세 모달 */}
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
                            <Text style={commonStyles.modalTitle}>매장 취급상품</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={20} color="#333" />
                            </Pressable>
                        </View>

                        <View style={styles.modalTableContainer}>
                            {renderProductHeader()}
                            {selectedStore && (
                                <Text style={styles.modalStoreName}>{selectedStore.name}</Text>
                            )}

                            <FlatList
                                data={productData}
                                keyExtractor={(item) => String(item.no)}
                                renderItem={renderProductItem}
                                style={styles.modalTableList}
                                contentContainerStyle={styles.modalTableListContent}
                                bounces={false}
                                alwaysBounceVertical={false}
                                overScrollMode="never"
                                showsVerticalScrollIndicator
                            />
                        </View>
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
    selectInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    selectText: {
        fontSize: 16,
        color: '#333',
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    headerCellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#b0b0b0',
        paddingRight: 10,
        marginRight: 10,
    },

    tableList: {
        flex: 1,
        backgroundColor: '#fff'
    },
    tableListContent: {
        backgroundColor: '#fff'
        // paddingBottom: 12,
    },

    linkText: {
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
    storeNamePressable: {
        flex: 2,
    },
    colNo: {
        flex: 0.7,
    },
    colName: {
        flex: 2,
    },
    colCode: {
        flex: 1.2,
    },
    colPosGroup: {
        flex: 1.5,
    },
    colUseYn: {
        flex: 1,
    },
    modalStoreName: {
        fontSize: 14,
        color: '#555',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },

    modalHeaderCellDivider: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: '#b0b0b0',
        paddingRight: 10,
        marginRight: 10,
    },
    modalTableList: {
        flex: 1,
        marginTop: 2,
        backgroundColor: '#fff'
    },
    modalTableListContent: {
        paddingBottom: 8,
        backgroundColor: '#fff'
    },
    modalTableContainer: {
        flex:1,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    modalHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center', // vertical center
        justifyContent: 'center',
        height: '100%',
    },
});
