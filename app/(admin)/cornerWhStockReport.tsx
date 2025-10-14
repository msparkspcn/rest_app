import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
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
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {User, Corner} from "../../types";

type StockRow = {
    itemNm: string;
    giQty: number;
    saleQty: number;
    whStockQty: number;
    curStockQty: number;
};

type Vendor = {
    cmpCd: string;
    outSdCmpCd: string;
    outSdCmpNm: string
};

export default function CornerWhStockReportScreen() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [selectedOutSdCmpCd, setSelectedOutSdCmpCd] = useState<string | null>(null);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [itemQuery, setItemQuery] = useState('');
    const [selectedCorner, setSelectedCorner] = useState<string | null>(cornerList[0]?.cornerCd ?? null);
    const {user}:User = useUser();
    const [stockList, setStockList] = useState<[] | null>(null);

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
    }

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
    }

    const baseData: StockRow[] = useMemo(
        () =>
            Array.from({length: 15}).map((_, idx) => {
                const giQty = 7 + (idx % 5);
                const totalStockQty = 20 + (idx % 7);
                const saleQty = 30 + (idx % 5);
                const curStockQty = totalStockQty + giQty - saleQty;
                return {
                    itemNm: `상품 ${((idx % 6) + 1)}`,
                    giQty: giQty,
                    whStockQty: 0,
                    saleQty: saleQty,
                    curStockQty: curStockQty,
                };
            }),
        []
    );

    const filteredData = useMemo(() => {
        return baseData;
    }, [baseData]);

    const onSearch = () => {

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
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.itemNm}
                </Text>
            ),
        },
        {
            key: 'giQty', title: Const.GI_QTY, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.giQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'saleQty', title: Const.SALE, flex: 0.5,
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'curStockQty', title: Const.CUR_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.curStockQty < 0 ? 'red' : 'black'}]}>
                    {item.curStockQty.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'whStockQty', title: Const.WH_STOCK_QTY, flex: 0.7,
            renderCell: (item) => (
                <Text style={[commonStyles.numberSmallCell, {color: item.whStockQty < 0 ? 'red' : 'black'}]}>
                    {item.whStockQty.toLocaleString()}
                </Text>
            )
        },
    ]), [])

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={styles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={styles.selectText}>{cornerList.find(g => g.cornerCd === selectedCorner)?.cornerNm || Const.SELECT}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.VENDOR}</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowVendorModal(true)}>
                        <Text
                            style={styles.selectText}>{vendorList.find(g => g.outSdCmpCd === selectedOutSdCmpCd)?.outSdCmpNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.ITEM_NM}</Text>
                    <TextInput
                        style={commonStyles.selectInput}
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
                data={filteredData}
                columns={mainColumns}
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
                    setSelectedCorner(item.cornerCd);
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

const styles = StyleSheet.create({
    selectText: {fontSize: 14, color: '#333'},
});


