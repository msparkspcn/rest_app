import {commonStyles} from '@/styles';
import {Ionicons} from '@expo/vector-icons';
import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {
    Modal,
    Pressable,
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
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import {User, Corner} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    cmpCd: string;
    saleDt: string;
    salesOrgCd: string; //임시
    storCd: string;
    cornerCd: string;
    cornerNm: string;
    orgNm: string;
    saleAmt: number;
    taxSaleAmt: number;
    totalSaleAmt: number; //임시로 총매출로 사용(값이 있음)
    isFirstRow: boolean;
};
type ProductSaleRow = {
    no: number;
    itemNm: string,
    saleQty: number,
    actualSaleAmt: number
};

export default function SalesReportByPeriod() {
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string | null>('');
    const [selectedCorner, setSelectedCorner] = useState<Corner>({"cornerCd":"", "storCd":""});
    const [fromSaleDt, setFromSaleDt] = useState(getTodayYmd());
    const [toSaleDt, setToSaleDt] = useState(getTodayYmd());
    const [currentPickerType, setCurrentPickerType] = useState('from')
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [saleList, setSaleList] = useState<[] | null>(null);
    const {user}:User = useUser();
    const [appliedCornerCd, setAppliedCornerCd] = useState<string | null>('');
    const [saleDetailList, setSaleDetailList] = useState<ProductSaleRow | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        getCornerList();
    }, []);

    const getCornerList = () => {
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd
        }
        api.getCornerList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const cornerList = result.data.responseBody;
                    setCornerList([
                        { cornerCd: '', cornerNm: '전체' },
                        ...cornerList
                    ]);
                }
            })
            .catch(error => {
                console.log("getCornerList error:" + error)
            });
    }

    const onSearch = (storCd: string, cornerCd: string) => {
        console.log("restDailyCornerSale 조회 클릭 fromSaleDt:"+fromSaleDt+", toSaleDt:"+toSaleDt)
        const request = {
            cmpCd: user.cmpCd,
            cornerCd: cornerCd,
            fromSaleDt: fromSaleDt,
            itemClassCd: "",
            salesOrgCd: user.salesOrgCd,
            storCd: storCd,
            toSaleDt: toSaleDt
        }
        setLoading(true);
        console.log('request:'+JSON.stringify(request));

        api.restDailyCornerSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    setAppliedCornerCd(selectedCornerCd);
                    setHasSearched(true);
                }
            })
            .catch(error => {
                console.log("restDailyCornerSale error:" + error)
            }).finally(() => setLoading(false));
    };

    const openDetail = (sale: SaleRow) => {
        setSelectedSale(sale);
        console.log('매장명 클릭 sale:'+JSON.stringify(sale));
        const request = {
            cmpCd: sale.cmpCd,
            cornerCd: sale.cornerCd,
            fromSaleDt: sale.saleDt,
            itemClassCd: "",
            salesOrgCd: sale.salesOrgCd,
            storCd: sale.storCd,
            toSaleDt: sale.saleDt
        }
        api.restCornerByItemSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('saleDetailList:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("restCornerByItemSale error:" + error)
            });
    };

    const closeDetail = () => {
        setIsDetailVisible(false);
    };

    const totalSumRow = useMemo(() => {
        if (!saleList || saleList.length === 0) return null;

        // const totalSum = saleList.reduce((acc, cur) => acc + cur.saleAmt, 0);
        const totalSum = saleList.reduce((acc, cur) => acc + cur.totalSaleAmt, 0);  //임시
        return {
            ...saleList[0],
            orgNm: '전체 합계',
            saleAmt: totalSum,
            cornerCd: '',
            saleDt: '',
            salesOrgCd: '',
            taxSaleAmt: 0,
            isTotal: true,
        };
    }, [saleList]);


    const tableData = useMemo(() => {
        if (!saleList) return []; // null 방지
        console.log('selectedCornerCd:'+selectedCornerCd)

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
                    dateSum += item.totalSaleAmt;
                    result.push({
                        ...item,
                        // 날짜 표시: 첫 행만
                        isFirstRow: idx === 0 ? true : false,
                    });
                });
                if(!selectedCornerCd) { //전체 조회일 경우 날짜별 합계 추가
                    result.push({
                        cmpCd: '',
                        saleDt: '',
                        salesOrgCd: '',
                        storCd: '',
                        cornerCd: '',
                        cornerNm: '',
                        orgNm: `${formattedDate(date)} 소계`,
                        taxSaleAmt: 0,
                        saleAmt: dateSum,
                        totalSaleAmt: dateSum,
                        isSummary: true,
                        isFirstRow: false
                    });
                }
            });

        return result;
    }, [saleList]);

    const mainColumns: ColumnDef<SaleRow & { isSummary?: boolean; saleDt?: string }>[] = useMemo(() => [
        {
            key: 'saleDt',
            title: '일자(요일)',
            flex: 1,
            align: 'center',
            renderCell: (item) => {
                if (item.isSummary) return null;
                else if(!item.isFirstRow) return null;
                return (
                    <Text style={[commonStyles.cell, {textAlign: 'center'}]}>
                        {ymdToDateWithDay(item.saleDt)}
                    </Text>
                    )
            },
        },
        {
            key: 'orgNm',
            title: Const.CORNER_NM,
            flex: 1.5,
            align: 'left',
            renderCell: (item) => (
                    <Pressable style={commonStyles.columnPressable} onPress={() => {openDetail(item)}}>
                        <Text style={[commonStyles.cell,
                            item.isSummary ? {fontWeight: 'bold', textAlign: 'center'}
                            : [commonStyles.linkText, {paddingLeft: 5}]]}>
                            {item.cornerNm}
                        </Text>
                    </Pressable>
            )
        },
        {
            key: 'saleAmt',
            title: '총매출',
            flex: 1.5,
            align: 'right',
            renderCell: (item) => (
                <Text style={[commonStyles.numberCell, item.isSummary ? { fontWeight: 'bold' } : null]}>
                    {item.taxSaleAmt.toLocaleString()}
                </Text>
            ),
        },
    ], [tableData]);

    const renderTotalRow = useMemo(() => {
        if (!totalSumRow) return null;
        return (
            <View style={commonStyles.summaryRow}>
                <View style={[{ flex: 2.5 }, commonStyles.columnContainer]}>
                    <Text style={[commonStyles.cell, commonStyles.summaryLabelText, { textAlign: 'center' }]}>
                        합계
                    </Text>
                </View>
                <View style={[{ flex: 1.5 }, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberCell}>
                        {totalSumRow.saleAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    },[totalSumRow]);



    const productColumns: ColumnDef<ProductSaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: '상품명', flex: 2.2, align: 'left'},
        {
            key: 'saleQty', title: Const.QTY, flex: 0.8, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'price', title: Const.PRICE, flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {(item.actualSaleAmt/item.saleQty).toLocaleString()}
                </Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '금액', flex: 1.5, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {item.actualSaleAmt.toLocaleString()}</Text>
            )
        },
    ]), []);


    const openDatePicker = (pickerType: string) => {
        setTempDate(new Date());
        setCurrentPickerType(pickerType);
        setShowDatePicker(true);
    };

    const summaryRow = useMemo(() => {
        // console.log('summaryRow render');
        if (saleDetailList) {
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            const totalAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            return {
                totalQty,
                totalAmt
            };
        }
        else {
            return {
                totalQty: 0,
                totalAmt: 0
            }
        }
    }, [saleDetailList]);

    const renderSummaryRow = useMemo(() => {
        return (
            <View style={commonStyles.summaryRow}>
                <View style={[{flex: 2.7}, commonStyles.columnContainer]}>
                    <Text
                        style={[commonStyles.modalCell, commonStyles.alignCenter,
                            {fontSize: 13, fontWeight: 'bold'}
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.8}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 2.5}, commonStyles.columnContainer]}>
                    <Text style={commonStyles.numberSmallCell}>
                        {summaryRow.totalAmt.toLocaleString()}
                    </Text>
                </View>
            </View>
        );
    }, [saleDetailList]);
    return (
        <SafeAreaView style={commonStyles.container} edges={[]}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>{Const.SEARCH_DT}</Text>
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
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                    <Pressable
                        style={commonStyles.searchButton}
                        onPress={() => onSearch(selectedCorner.storCd, selectedCorner.cornerCd)}
                    >
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table  /*매장 전체일 경우 합계 상단에*/
                data={tableData}
                columns={mainColumns}
                listHeader={!appliedCornerCd ? renderTotalRow : null}
                listFooter={appliedCornerCd ? renderTotalRow : null}
                hasSearched={hasSearched}
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
                    setSelectedCorner(item);
                    setSelectedCornerCd(item.cornerCd);
                    setShowCornerModal(false);
                }}
            />

            <Modal visible={isDetailVisible} animationType="fade" transparent>
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>
                                {formattedDate(selectedSale?.saleDt)}  {selectedSale?.cornerNm}
                            </Text>
                            <Pressable onPress={closeDetail} hitSlop={8}>
                                <Ionicons name="close" size={24} color="#333"/>
                            </Pressable>
                        </View>

                        <Table
                            data={saleDetailList}
                            columns={productColumns}
                            isModal={true}
                            listHeader={renderSummaryRow}
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
