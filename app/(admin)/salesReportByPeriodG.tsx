import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
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
import {formattedDate, ymdToDateWithDay, getTodayYmd, dateToYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type SaleRow = {
    saleDtInfo: string;
    cornerNm: string;
    saleQty: number;
    saleAmt: number;
};

type SaleData = {
    saleDt: string;
    saleAmt: number;
    totalSaleAmt: number;
    cornerCd: number;
    cornerNm: string;
}

type StoreGroup = { id: string; name: string };

export default function SalesReportByPeriod() {
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState([]);
    const storeGroups: StoreGroup[] = useMemo(
        () => [
            {id: "", name: "전체"},
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );
    const [registerFilter, setRegisterFilter] = useState<StoreGroup>(storeGroups[0]);
    const baseData: SaleRow[] = useMemo(
        () =>
            Array.from({length: 24}).map((_, idx) => {
                return {
                    // saleDtInfo: ymdToDateWithDay('20250901'),
                    saleDtInfo: '20250901',
                    cornerNm: '주유소',
                    saleQty: idx * 10,
                    saleAmt: 10000,
                };
            }),
        []
    );

    useEffect(() => {
        console.log('api 테스트1')
    })

    const restDailySale = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: "SLKR",
            cornerCd: "",
            detailDiv: "",
            fromSaleDt: '20250901',
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



    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        setIsDetailVisible(true);
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        { key: 'saleDtInfo',       title: '일자(요일)',     flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'center'}]}>{ymdToDateWithDay(item.saleDtInfo)}</Text>
            )},
        { key: 'cornerNm',     title: Const.CORNER,   flex: 1,   align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.cornerNm}</Text>
                </Pressable>
            ),   },
        { key: 'saleQty', title: Const.SALE_QTY, flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        { key: 'saleAmt', title: '총매출', flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.saleAmt.toLocaleString()}</Text>
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
        () => Array.from({ length: 9 }).map((_, index) => ({
            no: index + 1,
            itemNm: `상품 ${index + 1}`,
            qty: index * 1000,
            price: index * 10,
            totalAmt: index * 10 * 10
        })),
        []
    );

    const productColumns: ColumnDef<ProductSaleRow>[] = useMemo(() => ([
        { key: 'no', title: Const.NO, flex: 0.7, align: 'center' },
        { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left' },
        { key: 'qty', title: '판매\n수량',   flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.qty.toLocaleString()}
                </Text>
            )
        },
        { key: 'price', title: Const.PRICE,   flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.price.toLocaleString()}
                </Text>
            )
        },
        { key: 'totalAmt', title: '금액',   flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
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
        const totalQty = productData.reduce((sum, item) => sum + item.qty, 0);
        const totalAmt = productData.reduce((sum, item) => sum + item.totalAmt, 0);
        return {
            totalQty,
            totalAmt
        };
    }, [productData]);

    const renderSummaryRow = () => {
        return (
            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                <View
                    style={[{
                        flex: 0.7 + 2.2,
                        justifyContent:'center',
                        borderRightWidth:StyleSheet.hairlineWidth,
                        borderRightColor: '#aaa',
                        height:'100%'
                    }]}
                >
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold',
                                paddingLeft: 10,
                            }
                        ]}>합계</Text>
                </View>
                <View
                    style={[
                        { flex: 1.2,
                            justifyContent:'center',
                            borderRightWidth:StyleSheet.hairlineWidth,
                            borderRightColor: '#aaa',
                            height:'100%'
                            // backgroundColor:'red'
                        },
                        // commonStyles.modalColumnContainer,
                        // commonStyles.modalCellDivider,
                        commonStyles.summaryCell,
                    ]}
                >
                    <Text style={[
                        commonStyles.modalCell,
                        commonStyles.numberCell,{

                    }]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View
                    style={[
                        { flex: 1.5 + 2,
                            justifyContent:'center',
                            borderRightWidth:StyleSheet.hairlineWidth,
                            borderRightColor: '#aaa',
                            height:'100%'},
                        commonStyles.summaryCell,

                    ]}
                >
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
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
                    <Text style={commonStyles.filterLabel}>{Const.STORE_GROUP}</Text>
                    <View style={commonStyles.segmented}>
                        {storeGroups.map((option) => (
                            <Pressable
                                key={option.id}
                                onPress={() => setRegisterFilter(option)}
                                style={[commonStyles.segmentItem, registerFilter.id === option.id && commonStyles.segmentItemActive]}
                            >
                                <Text
                                    style={[commonStyles.segmentText, registerFilter.id === option.id && commonStyles.segmentTextActive]}>
                                    {option.name}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider} />

            <Table
                // data={saleList}
                data={baseData}
                columns={mainColumns}
            />

            <View style={commonStyles.sectionDivider} />

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{formattedDate(selectedSale?.saleDtInfo)}{' '+selectedSale?.cornerNm}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <Table
                            data={productData}
                            columns={productColumns}
                            isModal={true}
                            listFooter={renderSummaryRow}
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
        height: 30,
        backgroundColor: '#fff7e6'
    },
});
