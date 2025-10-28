import {StatusBar} from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {
    Pressable,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function RealtimeStockReportScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [itemNm, setItemNm] = useState('');
    const [stockList, setStockList] = useState<[] | null>(null);
    const {user}:User = useUser();
    const [loading, setLoading] = useState(false);

    const onSearch = () => {
        console.log("mobOilRealTimeStock 조회 클릭 fromSaleDt:"+saleDate+", itemNm:"+itemNm);
        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            itemClassCd: "",
            itemValue: itemNm,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request))
        setLoading(true);

        api.mobOilRealTimeStock(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    console.log('size:'+stockList.length);
                    // console.log('stockList:' + JSON.stringify(stockList))
                    setStockList(stockList);
                }
            })
            .catch(error => {
                console.log("mobOilRealTimeStock error:" + error)
            })
            .finally(() => setLoading(false));
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<StockRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'itemNm', title: Const.ITEM_NM, flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell,{paddingLeft: 5}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'prevStockQty', title: Const.TOTAL_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.prevStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'inStockQty', title: Const.GI_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.inStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'outStockQty', title: Const.GO_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.outStockQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStockQty', title: Const.CUR_STOCK_QTY, flex: 1,
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell,
                    { color: item.currentStockQty < 0 ? 'red' : ''}
                ]}>{item.currentStockQty.toLocaleString()}</Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
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
                data={stockList}
                columns={mainColumns}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
};

