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
import {formattedDate, ymdToDateWithDay, getTodayYmd, dateToYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";

type SaleRow = {
    saleDtInfo: string;
    salesOrgCd: string; //임시
    cornerCd: string;
    cornerNm: string;
    saleAmt: number;
    taxSaleAmt: number;
};

type Corner = {
    cmpCd: string;
    salesOrgCd: string;
    storCd: string;
    cornerCd: string;
    cornerNm: string
};

export default function SalesReportByPeriod() {
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>('');
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user} = useUser();

    useEffect(() => {
        console.log('api 테스트1');
        getCornerList();
    }, []);

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

    const restDailyCornerSale = () => {
        console.log("restDailyCornerSale 조회 클릭 fromSaleDt:"+fromSaleDt+", toSaleDt:"+toSaleDt)
        const request = {
            cmpCd: "SLKR",
            cornerCd: "",
            detailDiv: "string",
            fromSaleDt: fromSaleDt,
            itemClassCd: "",
            salesOrgCd: "8000",
            storCd: "5000511",
            toSaleDt: toSaleDt
        }
        api.restDailyCornerSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                }
            })
            .catch(error => {
                console.log("restDailyCornerSale error:" + error)
            });
    }

    const onSearch = () => {
        restDailyCornerSale();
    };

    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        setIsDetailVisible(true);
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const totalSumRow = useMemo(() => {
        if (!saleList || saleList.length === 0) return null;

        const totalSum = saleList.reduce((acc, cur) => acc + cur.saleAmt, 0);
        return {
            ...saleList[0],
            cornerNm: '전체 합계',
            saleAmt: totalSum,
            cornerCd: '',
            saleDtInfo: '',
            salesOrgCd: '',
            taxSaleAmt: 0,
            isTotal: true,
        };
    }, [saleList]);


    const tableData = useMemo(() => {
        if (!saleList) return []; // null 방지

        const result: (SaleRow & { isSummary?: boolean })[] = [];

        // 2) 날짜별 처리
        const grouped: Record<string, SaleRow[]> = {};
        saleList.forEach(item => {
            if (!grouped[item.saleDt]) grouped[item.saleDt] = [];
            grouped[item.saleDt].push(item);
        });

        Object.keys(grouped)
            .sort() // 날짜 오름차순
            .forEach(date => {
                const rows = grouped[date];
                let dateSum = 0;

                rows.forEach((item, idx) => {
                    dateSum += item.saleAmt;
                    result.push({
                        ...item,
                        // 날짜 표시: 첫 행만
                        saleDtInfo: idx === 0 ? item.saleDt : '',
                    });
                });

                // 날짜별 합계 row
                result.push({
                    ...rows[0],
                    cornerNm: `${formattedDate(date)} 소계`,
                    saleAmt: dateSum,
                    isSummary: true,
                });
            });

        return result;
    }, [saleList]);

    const mainColumns: ColumnDef<SaleRow & { isSummary?: boolean; saleDtInfo?: string }>[] = useMemo(() => [
        {
            key: 'saleDtInfo',
            title: '일자(요일)',
            flex: 1,
            align: 'center',
            renderCell: (item) => {
                console.log('saleDtInfo isSummary:'+item.isSummary)
                if(item.isSummary) return null;
                return (
                    <Text style={[
                        commonStyles.numberCell,
                        item.isTotal ? {fontWeight: 'bold', backgroundColor: '#ffe5b4'} : {textAlign: 'center'}
                    ]}>
                        {item.isTotal ? '' : ymdToDateWithDay(item.saleDtInfo || item.saleDt)}
                    </Text>
                    )
            },
        },
        {
            key: 'cornerNm',
            title: Const.CORNER_NM,
            flex: 1.8,
            align: 'left',
            renderCell: (item) => {
                const cellFlex = item.isSummary ? 3 : 1.8;
                return (
                    <View style={{ flex: cellFlex, justifyContent: 'center' }}>
                        <Text style={[commonStyles.cell,
                            item.isSummary ? {fontWeight: 'bold', textAlign: 'center'}
                            : [commonStyles.linkText, {paddingLeft: 10}]]}>
                            {item.cornerNm}
                        </Text>
                    </View>
                )
            },
        },
        {
            key: 'saleAmt',
            title: '총매출',
            flex: 1.2,
            align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isSummary ? { fontWeight: 'bold' } : null]}>
                    {item.taxSaleAmt.toLocaleString()}
                </Text>
            ),
        },
    ], [tableData]);

    type ProductSaleRow = { no: number; itemNm: string, qty: number, price: number, totalAmt: number };
    const productData: ProductSaleRow[] = useMemo(
        () => Array.from({length: 50}).map((_, index) => ({
            no: index + 1,
            itemNm: `상품 ${index + 1}`,
            qty: index * 5,
            price: index * 10,
            totalAmt: index * 10 * 10000
        })),
        []
    );

    const productColumns: ColumnDef<ProductSaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center'},
        {key: 'itemNm', title: '상품명', flex: 2.2, align: 'left'},
        {
            key: 'qty', title: Const.QTY, flex: 0.8, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.qty.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: Const.PRICE, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.price.toLocaleString()}</Text>
            )
        },
        {
            key: 'totalAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.totalAmt.toLocaleString()}</Text>
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
                <View style={[{flex: 2.7}, commonStyles.tableRightBorder,]}>
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold'}
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.8}, commonStyles.tableRightBorder]}>
                    <Text style={commonStyles.numberSmallCell}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 2.5}, commonStyles.tableRightBorder]}>
                    <Text style={commonStyles.numberSmallCell}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

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

            <Table
                data={tableData}
                columns={mainColumns}
                listHeader= {totalSumRow ? (
                            <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
                                <View style={[{flex: 2.8}, commonStyles.tableRightBorder]}>
                                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, {textAlign:'center'}]}>
                                        합계
                                    </Text>
                                </View>
                                <View style={[{flex: 1.2}, commonStyles.tableRightBorder]}>
                                    <Text style={commonStyles.numberCell}>
                                        {totalSumRow.saleAmt.toLocaleString()}
                                    </Text>
                                </View>
                                )}
                            </View>
                ) : null}
            />

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
                            data={productData}
                            columns={productColumns}
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
});
