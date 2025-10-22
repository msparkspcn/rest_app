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
import * as api from "../../services/api/api";
import {useUser} from "../../contexts/UserContext";
import {User} from "../../types/user";
import LoadingOverlay from "../../components/LoadingOverlay";

type StockRow = {
    itemNm: string;
    inStockQty: number;
    outStockQty: number;
    prevStockQty: number;
    currentStockQty: number;
};

type StockDetailRow = {
    cornerNm: string;
    recdisDt: string;
    totalStockQty: number;
    inStockQty: number;
    saleQty: number;
    currentStockQty: number;
}

export default function CornerStockReportScreen() {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from');
    const [itemValue, setItemNm] = useState('');
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<StockRow | null>(null);
    const [stockList, setStockList] = useState<[] | null>(null);
    const [stockDetailList, setStockDetailList] = useState<[] | null>(null);
    const {user}:User = useUser();
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        console.log("조회 클릭");
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: fromSaleDt,
            itemClassCd: "",
            itemValue: itemValue,
            salesOrgCd: "8100",
            storCd: "",
            toSaleDt: toSaleDt
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);

        api.mobOilPeriodStock(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    console.log('size:'+stockList.length);
                    console.log('stockList:' + JSON.stringify(stockList))
                    setStockList(stockList);
                }
            })
            .catch(error => {
                console.log("mobOilPeriodStock error:" + error)
            })
            .finally(() => setLoading(false));
    };

    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const openDetail = (stock: StockRow) => {
        setSelectedItem(stock)
        setIsDetailVisible(true);
        oilTotalStockStatusList(stock);
    };

    const oilTotalStockStatusList = (stock: StockRow) => {
        console.log("mobOilDailyItemStock 조회 클릭 stock:"+JSON.stringify(stock)+", itemValue:"+itemValue);
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: fromSaleDt,
            itemClassCd: "",
            itemValue: stock.itemCd,
            salesOrgCd: "8100",
            storCd: "",
            toSaleDt: toSaleDt
        }
        console.log('request:'+JSON.stringify(request))
        api.mobOilDailyItemStock(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    console.log('size:'+stockList.length);
                    console.log('stockList:' + JSON.stringify(stockList))
                    setStockDetailList(stockList);
                }
            })
            .catch(error => {
                console.log("mobOilDailyItemStock error:" + error)
            });
    }

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 1.5,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft: 5}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'prevStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.prevStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'inStockQty', title: Const.GI_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.inStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'outStockQty', title: Const.GO_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.outStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStockQty', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.currentStockQty < 0 ? 'red' : ''}]}>
                    {item.currentStockQty.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    const StockDetailColumns: ColumnDef<StockDetailRow>[] = useMemo(() => ([
        {key: 'recdisDt', title: Const.DATE, flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{formattedDate(item.recdisDt)}</Text>
            )
        },
        {
            key: 'prevStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1.1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.prevStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'inStockQty', title: Const.GI_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.inStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'outStockQty', title: Const.SALE, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.outStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStockQty', title: Const.CUR_STOCK_QTY, flex: 1.1,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.currentStockQty.toLocaleString()}</Text>
            )
        },
    ]), []);

    const detailTotalPrevStockQty = useMemo(() => {
        if(stockDetailList) {
            return stockDetailList.reduce((acc, row) => acc + row.prevStockQty, 0);
        }

    }, [stockDetailList]);
    const detailTotalInStockQty = useMemo(() => {
        if(stockDetailList) {
            return stockDetailList.reduce((acc, row) => acc + row.inStockQty, 0);
        }
        }, [stockDetailList]);
    const detailTotalSaleQty = useMemo(() => {
        if(stockDetailList) {
            return stockDetailList.reduce((acc, row) => acc + row.outStockQty, 0);
        }
        }, [stockDetailList]);
    const detailTotalCurStockQty = useMemo(() => {
        if(stockDetailList) {
            return stockDetailList.reduce((acc, row) => row.currentStockQty, 0);
        }
        }, [stockDetailList]);

    const renderDetailFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1.5}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.modalTotalText]}>
                    합계
                </Text>
            </View>
            <View style={[{flex: 1.1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberSmallCell}>
                    {detailTotalPrevStockQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberSmallCell}>
                    {detailTotalInStockQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberSmallCell}>
                    {detailTotalSaleQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.1}, commonStyles.tableRightBorder]}>
                <Text style={commonStyles.numberSmallCell}>
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
                        <Text style={commonStyles.selectText}>{formattedDate(fromSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Text>-</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => openDatePicker('to')}>
                        <Text style={commonStyles.selectText}>{formattedDate(toSaleDt)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholderTextColor="#999"
                        value={itemValue}
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
                data={stockList}
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
                            data={stockDetailList}
                            columns={StockDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooter}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalTotalText: {
        fontWeight: '700',
        color: '#222',
    },
});


