import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as api from "../../services/api/api";
import {formattedDate, ymdToDateWithDay, getTodayYmd, dateToYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import {useUser} from "../../contexts/UserContext";
import {User} from "../../types/user";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    saleDt: string;
    saleQty: number;
    saleAmt: number;
};

type SaleDetailRow = {
    itemNm: string,
    saleQty: number,
    salePrc: number,
    actualSaleAmt: number
};
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
    const [saleDetailList, setSaleDetailList] = useState([]);
    const storeGroups: StoreGroup[] = useMemo(
        () => [
            // {id: "", name: "전체"},
            {id: "01", name: "주유소"},
            {id: "02", name: "충전소"}
        ],
        []
    );
    const [selectedStorCd, setSelectedStorCd] = useState<StoreGroup>(storeGroups[0]);
    const {user}:User = useUser();
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const onSearch = () => {
        console.log("조회 클릭")
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: fromSaleDt,
            salesOrgCd: user.salesOrgCd,
            storCd: selectedStorCd.id,
            toSaleDt: toSaleDt
        }
        setLoading(true);

        api.posGroupByOilDailySale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    setHasSearched(true);
                }
            })
            .catch(error => {console.log("posGroupByOilDailySale error:"+error)})
            .finally(() => setLoading(false));
    };

    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        console.log("매장 클릭 sale:"+JSON.stringify(sale))
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: "",
            fromSaleDt: sale.saleDt,
            salesOrgCd: user.salesOrgCd,
            storCd: sale.storCd,
            toSaleDt: sale.saleDt,
        }
        console.log('request:'+JSON.stringify(request))
        api.mobOilDailyItemSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('111:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {console.log("mobOilDailyItemSale error:"+error)});
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        { key: 'saleDt',       title: '일자(요일)',     flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {textAlign:'center'}]}>{ymdToDateWithDay(item.saleDt)}</Text>
            )},
        { key: 'storNm',     title: Const.CORNER,   flex: 1,   align: 'left',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText,{textAlign: 'center'}]}>
                        {item.storNm}
                    </Text>
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

    const totalAmt = useMemo(() => saleList.reduce((acc, r) => acc + r.saleAmt, 0), [saleList]);
    const totalQty = useMemo(() => saleList.reduce((acc, r) => acc + r.saleQty, 0), [saleList]);


    const renderFooter = () => (
        <View style={commonStyles.summaryRow}>
            <View style={[{flex: 2}, commonStyles.columnContainer]}>
                <Text style={[commonStyles.cell, commonStyles.summaryLabelText,
                    {textAlign: 'center'}]}>합계</Text>
            </View>
            <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                <Text style={commonStyles.numberCell}>
                    {totalQty.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 1.2}, commonStyles.columnContainer]}>
                <Text style={commonStyles.numberCell}>
                    {totalAmt.toLocaleString()}
                </Text>
            </View>
        </View>
    );


    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        { key: 'no', title: Const.NO, flex: 0.7,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left' },
        { key: 'saleQty', title: '판매\n수량',   flex: 1.2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.saleQty.toLocaleString()}
                </Text>
            )
        },
        { key: 'salePrc', title: Const.PRICE,   flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.salePrc.toLocaleString()}
                </Text>
            )
        },
        { key: 'actualSaleAmt', title: '금액',   flex: 2, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {item.actualSaleAmt.toLocaleString()}
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
        const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
        const totalAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
        return {
            totalQty,
            totalAmt
        };
    }, [saleDetailList]);

    const renderSummaryRow = () => {
        return (
            <View style={commonStyles.summaryRow}>
                <View style={[{flex: 0.7 + 2.2}, commonStyles.columnContainer]}>
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold',
                                paddingLeft: 5,
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{ flex: 1.2}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{ flex: 1.5 + 2}, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberCell]}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    };
    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark" />

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
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>{Const.STORE_GROUP}</Text>
                    <View style={commonStyles.segmented}>
                        {storeGroups.map((option) => (
                            <Pressable
                                key={option.id}
                                onPress={() => setSelectedStorCd(option)}
                                style={[commonStyles.segmentItem, selectedStorCd.id === option.id && commonStyles.segmentItemActive]}
                            >
                                <Text
                                    style={[commonStyles.segmentText, selectedStorCd.id === option.id && commonStyles.segmentTextActive]}>
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
                data={saleList}
                columns={mainColumns}
                listFooter={renderFooter}
                hasSearched={hasSearched}
            />

            <View style={commonStyles.sectionDivider} />

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{formattedDate(selectedSale?.saleDt)}{'   '+selectedStorCd.name}</Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333" />
                            </Pressable>
                        </View>

                        <Table
                            data={saleDetailList}
                            columns={saleDetailColumns}
                            isModal={true}
                            listFooter={renderSummaryRow}
                            hasSearched={isDetailVisible}
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
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}
