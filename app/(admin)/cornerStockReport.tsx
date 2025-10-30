import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal } from "../../components/DatePickerModal";
import ListModal from "../../components/ListModal";
import { Table } from "../../components/Table";
import Const from "../../constants/Const";
import { useUser } from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import { commonStyles } from "../../styles/index";
import { Corner, User } from "../../types";
import { ColumnDef } from "../../types/table";
import { dateToYmd, formattedDate, getTodayYmd } from "../../utils/DateUtils";

type StockRow = {
    itemNm: string;
    stockIn: number;
    stockOut: number;
    prevStock: number;
    currentStock: number;
};

type Vendor = {
    cmpCd: string;
    outSdCmpCd: string;
    outSdCmpNm: string
};

export default function CornerStockReportScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [selectedOutSdCmpCd, setSelectedOutSdCmpCd] = useState<string | null>(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>('');
    const {user}:User = useUser();
    const [stockList, setStockList] = useState<[] | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        getCornerList();
        getVendorList();
    },[]);

    const getCornerList = () => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    setCornerList(cornerList);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    };

    const getVendorList = () => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
            schValue: '',
        }
        api.getVendorList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const vendorList = result.data.responseBody;
                    console.log('List:' + JSON.stringify(vendorList))
                    setVendorList([
                        { outSdCmpCd: '', outSdCmpNm: '전체' },
                        ...vendorList
                    ]);
                }
            })
            .catch(error => {
                console.log("getVendorList error:" + error)
            });
    };

    const onSearch = () => {
        if(selectedCornerCd == '') {
            Alert.alert(Const.ERROR, Const.NO_CORNER_MSG);
            return;
        }
        console.log("조회 클릭")
        const request = {
            cmpCd: user.cmpCd,
            itemNm: itemQuery,
            outSdCmpCd: selectedOutSdCmpCd,
            salesOrgCd: user.salesOrgCd,
            stockDate: saleDate,
            storCd: "5000511",
        }
        console.log('params:'+JSON.stringify(request));
        api.restCornerStockList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const stockList = result.data.responseBody;
                    // console.log('111:' + JSON.stringify(stockList))
                    console.log('length:' + stockList.length)
                    setStockList(stockList);
                    setHasSearched(true);
                }
            })
            .catch(error => {
                console.log("restCornerStockList error:" + error)
            });
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
            key: 'itemNm', title: Const.ITEM_NM, flex: 2,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'prevStock', title: Const.TOTAL_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.prevStock.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockIn', title: Const.GI_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.stockIn.toLocaleString()}</Text>
            )
        },
        {
            key: 'stockOut', title: Const.SALE, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>{item.stockOut.toLocaleString()}</Text>
            )
        },
        {
            key: 'currentStock', title: Const.CUR_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, {color: item.currentStock < 0 ? 'red' : 'black'}]}>
                    {item.currentStock.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_DT}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.VENDOR}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowVendorModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{vendorList.find(g => g.outSdCmpCd === selectedOutSdCmpCd)?.outSdCmpNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.input}
                        placeholderTextColor="#999"
                        value={itemQuery}
                        onChangeText={setItemQuery}
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
                hasSearched={hasSearched}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
            />

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

            <ListModal
                visible={showVendorModal}
                title="거래처 선택"
                data={vendorList}
                keyField="outSdCmpCd"
                labelField="outSdCmpNm"
                onClose={() => setShowVendorModal(false)}
                onSelect={(item) => {
                    setSelectedOutSdCmpCd(item.outSdCmpCd);
                    setShowVendorModal(false);
                }}
            />

        </SafeAreaView>
    );
}


