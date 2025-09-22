import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";

type StockRow = {
    itemNm: string;
    giQty: number;
    goQty: number;
    totalStockQty: number;
    curStockQty: number;
};

type StockDetailRow = {
    cornerNm: string;
    stockDt: string;
    totalStockQty: number;
    giQty: number;
    saleQty: number;
    curStockQty: number;
}

type Corner = { id: string; name: string};

export default function CornerStockReportScreen() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const corners: Corner[] = useMemo(
        () => Array.from({length: 6}).map((_, i) => ({id: `G${i + 1}`, name: `매장 ${i + 1}`})),
        []
    );
    const [itemNm, setItemNm] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockRow | null>(null);

    const baseData: StockRow[] = useMemo(
        () =>
            Array.from({length: 15}).map((_, idx) => {
                const giQty = 7 + (idx % 5);
                const totalStockQty = 20 + (idx % 7);
                const goQty = 30 + (idx % 5);
                const curStockQty = totalStockQty + giQty - goQty;
                return {
                    itemNm: `상품 ${((idx % 6) + 1)}`,
                    giQty: giQty,
                    totalStockQty: totalStockQty,
                    goQty: goQty,
                    curStockQty: curStockQty,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData;
    }, [baseData]);

    const onSearch = () => {
        // 데모: 현재는 선택 값만으로 필터링 적용
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openDetail = (stock: StockRow) => {
        setSelectedItem(stock)
        setIsDetailVisible(true);
    };

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5, align: 'center',
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 1.5, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft: 10}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'goQty', title: Const.GO_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10
                }]}>{item.goQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {
                    textAlign: 'right',
                    paddingRight: 10,
                    color: item.curStockQty < 0 ? 'red' : 'black',
                }]}>{item.curStockQty.toLocaleString()}</Text>
            )
        },
    ]), [])

    const detailData: StockDetailRow[] = useMemo(
        () =>
            Array.from({length: 10}).map((_, idx) => {
                const qty = (idx % 4) + 1;
                return {
                    cornerNm: '파스쿠찌',
                    stockDt: `2025/09/0${idx + 1}`,
                    totalStockQty: qty,
                    giQty: qty,
                    saleQty: qty,
                    curStockQty: qty
                };
            }),
        []
    );

    const StockDetailColumns: ColumnDef<StockDetailRow>[] = useMemo(() => ([
        {key: 'stockDt', title: Const.DATE, flex: 2, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{item.stockDt}</Text>
            )
        },
        {
            key: 'totalStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.totalStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'saleQty', title: Const.SALE, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, commonStyles.numberCell]}>{item.curStockQty.toLocaleString()}</Text>
            )
        },
    ]), []);

    const detailTotalStockQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.totalStockQty, 0);
    }, [detailData]);
    const detailTotalGiQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.giQty, 0);
    }, [detailData]);
    const detailTotalSaleQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.saleQty, 0);
    }, [detailData]);
    const detailTotalCurStockQty = useMemo(() => {
        return detailData.reduce((acc, row) => acc + row.curStockQty, 0);
    }, [detailData]);

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={{flex: 2,
                justifyContent: 'center',
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor:'#aaa',
                height:'100%'
            }}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={{flex: 1,
                justifyContent: 'center',
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor:'#aaa',
                height:'100%'}}>
                <Text style={[commonStyles.cell, commonStyles.numberCell, styles.modalTotalText]}>
                    {detailTotalStockQty.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 1.5,
                justifyContent: 'center',
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor:'#aaa',
                height:'100%'}}>
                <Text style={[commonStyles.cell, commonStyles.numberCell, styles.modalTotalText]}>
                    {detailTotalGiQty.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 1,
                justifyContent: 'center',
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor:'#aaa',
                height:'100%'}}>
                <Text style={[commonStyles.cell, commonStyles.numberCell, styles.modalTotalText]}>
                    {detailTotalSaleQty.toLocaleString()}
                </Text>
            </View>
            <View style={{flex: 1,
                justifyContent: 'center',
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor:'#aaa',
                height:'100%'}}>
                <Text style={[commonStyles.cell, commonStyles.numberCell, styles.modalTotalText]}>
                    {detailTotalCurStockQty.toLocaleString()}
                </Text>
            </View>
        </View>
    );

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
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholderTextColor="#999"
                        value={itemNm}
                        onChangeText={setItemNm}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table
                data={filteredData}
                columns={mainColumns}
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

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}
                      pointerEvents="box-none">
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedItem?.itemNm}</Text>
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={detailData}
                            columns={StockDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    },
});


