import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Modal, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import MyRadioGroup from "../../components/ui/RadioGroup";
import {User, SalesOrg, Corner} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import ListModal from "../../components/ListModal";
import LoadingOverlay from "../../components/LoadingOverlay";
type SaleRow = {
    storCd: string;
    cornerCd: string;
    cornerNm: string;
    saleAmt: number; // DC 포함 금액
    monthlySaleAmt: number; // DC 포함 금액
    actualSaleAmt: number; // DC 미포함 금액
    monthlyActualSaleAmt: number; // DC 미포함 금액
    dailySaleRatio: number; // DC 포함 비율
    monthlySaleRatio: number // DC 포함 비율
    dailyActualSaleRatio: number; // DC 포함 비율
    monthlyActualSaleRatio: number // DC 미포함 비율

};
type SaleDetailRow = {
    no: number;
    itemNm: string;
    saleQty: number;
    saleAmt: number; // DC 포함 금액
    actualSaleAmt: number;  // DC 미포함 금액
    saleRatio: number; // DC 포함 비율
    actualSaleRatio: number;    // DC 미포함 비율
}

export default function RealtimeSalesByCornerOp() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(true);
    const [appliedDcChecked, setAppliedDcChecked] = useState(true);
    const [sortOrder, setSortOrder] = useState('0');
    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);
    const [cornerList, setCornerList] = useState<Corner[]>([]);
    const [showCornerModal, setShowCornerModal] = useState(false);
    const [selectedCornerCd, setSelectedCornerCd] = useState<string>('');
    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string | null>('');
    const [saleList, setSaleList] = useState<[] | null>(null);
    const [saleDetailList, setSaleDetailList] = useState<[] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    useEffect(() => {
        getCornerList(selectedSalesOrgCd)
    },[selectedSalesOrgCd])

    const getSalesOrgList = () => {
        const request = {
            cmpCd: user.cmpCd,
            operDiv: '01',
            restValue: '',
        }
        console.log("request:"+JSON.stringify(request))
        api.getSalsOrgList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    console.log('salesOrgList:' + JSON.stringify(salesOrgList))
                    setSalesOrgList(salesOrgList);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const getCornerList = (salesOrgCd: string) => {
        console.log("getCornerList selectedSalesOrgCd:"+salesOrgCd+",cmpCd:"+user.cmpCd)
        const request = {
            cmpCd: user.cmpCd,
            salesOrgCd: selectedSalesOrgCd
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
    };

    const onSearch = () => {
        console.log("조회 클릭")
        if(selectedSalesOrgCd=='') {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }

        setAppliedDcChecked(dcIncludedChecked);

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: selectedCornerCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);

        api.mobRestRealTimeSaleNews(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    // console.log('saleList:' + JSON.stringify(saleList));

                    const sortedList = [...saleList].sort((a, b) =>
                        a.cornerNm.localeCompare(b.cornerNm, 'ko', {
                            numeric: true,
                            sensitivity: 'base'
                        })
                    );
                    if(sortOrder == '0') {
                        setSaleList(sortedList);
                    }
                    else {
                        setSaleList(saleList);
                    }
                    setLoading(false);
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobRestRealTimeSaleNews error:" + error)
            });
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const openDetail = (sale: SaleRow) => {
        console.log("매출금액 클릭 item:"+JSON.stringify(sale)+",saleDate:"+saleDate);
        // console.log('dc포함여부:'+appliedDcChecked);
        setSelectedSale(sale);

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: sale.cornerCd,
            fromSaleDt: saleDate,
            salesOrgCd: user.salesOrgCd,
            storCd: sale.storCd,
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        api.mobRestRealTimeItemSale(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleDetailList = result.data.responseBody;
                    console.log('saleDetailList:' + JSON.stringify(saleDetailList))
                    setSaleDetailList(saleDetailList);
                    setIsDetailVisible(true);
                }
            })
            .catch(error => {
                console.log("mobRestRealTimeItemSale error:" + error)
            });
    }

    const handleDcIncludedToggle = () => {
        setDcIncludedChecked(!dcIncludedChecked)
    }
    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {
            key: 'cornerNm', title: Const.CORNER_NM, flex: 1, align: 'center',
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 5}]}>
                    {item.cornerNm}
                </Text>
            ),
        },
        {
            key: 'saleAmt', title: Const.SALE_AMT, flex: 0.9, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.numberSmallCell, commonStyles.linkText]}>
                        {appliedDcChecked
                            ? item.saleAmt.toLocaleString()
                            : item.actualSaleAmt.toLocaleString()}
                    </Text>
                </Pressable>
            )
        },
        {
            key: 'dailySaleRatio', title: Const.COMP_RATIO, flex: 0.8, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {appliedDcChecked
                        ? item.dailySaleRatio.toFixed(1)
                        :item.dailyActualSaleRatio.toFixed(1)
                    }%
                </Text>
            )
        },
        {
            key: 'monthlySaleAmt', title: Const.MONTH_TOTAL_AMT, flex: 1.2, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {appliedDcChecked
                        ? item.monthlySaleAmt.toLocaleString()
                        : item.monthlyActualSaleAmt.toLocaleString()}
                </Text>
            )
        },
        {
            key: 'monthlySaleRatio', title: Const.COMP_RATIO, flex: 0.8, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberCell}>
                    {appliedDcChecked
                        ? item.monthlySaleRatio.toFixed(1)
                        : item.monthlyActualSaleRatio.toFixed(1)
                    }%
                </Text>
            )
        },
    ]), [saleDate, appliedDcChecked])

    const totalSaleAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.saleAmt, 0), [saleList]);
    const totalMonthSaleAmt = useMemo(() => (saleList ?? []).reduce((acc, r) => acc + r.monthlySaleAmt, 0), [saleList]);
    const totalActualSaleAmt = useMemo(
        () => (saleList ?? []).reduce((acc, r) => acc + r.actualSaleAmt, 0), [saleList]);
    const totalActualMonthSaleAmt = useMemo(() => (saleList ?? []).reduce((acc, r) => acc + r.monthlyActualSaleAmt, 0), [saleList]);

    const renderFooter = () => (
        <View style={[commonStyles.tableRow, commonStyles.summaryRow]}>
            <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, commonStyles.alignCenter, styles.totalText,
                    {fontSize: 13, fontWeight: 'bold'}]}>{Const.TOTAL_AMT}</Text>
            </View>
            <View style={[{flex: 1.7}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.totalText, commonStyles.numberCell]}>
                    {appliedDcChecked
                        ? totalSaleAmt.toLocaleString()
                        : totalActualSaleAmt.toLocaleString()}
                </Text>
            </View>
            <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                <Text style={[commonStyles.cell, styles.totalText, commonStyles.numberCell]}>
                    {appliedDcChecked
                        ? totalMonthSaleAmt.toLocaleString()
                        : totalActualMonthSaleAmt.toLocaleString()
                    }
                </Text>
            </View>
        </View>
    );

    const summaryRow = useMemo(() => {
        if(saleDetailList) {
            const totalSaleAmt = saleDetailList.reduce((sum, item) => sum + item.actualSaleAmt, 0);
            const totalQty = saleDetailList.reduce((sum, item) => sum + item.saleQty, 0);
            const totalCompRatio = saleDetailList.reduce((sum, item) => sum + item.saleRatio, 0.0+'%');
            return {
                totalQty: totalQty,
                totalSaleAmt: totalSaleAmt,
                totalCompRatio: totalCompRatio
            };
        }
    }, [saleDetailList]);

    const saleDetailColumns: ColumnDef<SaleDetailRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.5,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: Const.ITEM_NM, flex: 1.5,
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
                    <Text style={[commonStyles.cell,{paddingLeft: 5}]}>
                        {item.itemNm}
                    </Text>
                </Pressable>
            ),
        },
        {
            key: 'saleQty', title: Const.QTY, flex: 0.6, align: 'center',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>{item.saleQty.toLocaleString()}</Text>
            )
        },
        {
            key: 'actualSaleAmt', title: '금액', flex: 1, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {appliedDcChecked
                        ? item.saleAmt.toLocaleString()
                        : item.actualSaleAmt.toLocaleString()
                    }
                </Text>
            )
        },
        {
            key: 'saleRatio', title: Const.COMP_RATIO, flex: 0.6, align: 'right',
            renderCell: (item) => (
                <Text style={commonStyles.numberSmallCell}>
                    {appliedDcChecked
                        ? item.saleRatio.toFixed(1)
                        : item.actualSaleRatio.toFixed(1)
                    }%

                </Text>
            )
        },
    ]), []);

    const renderDetailFooterRow = () => {
        return (
            <View style={[commonStyles.modalTableRow, commonStyles.summaryRow]}>
                <View style={[{flex: 2}, commonStyles.tableRightBorder]}>
                    <Text
                        style={[commonStyles.modalCell,
                            {
                                textAlign: 'center',
                                fontSize: 13,
                                fontWeight: 'bold'
                            }
                        ]}>합계</Text>
                </View>
                <View style={[{flex: 0.6}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalQty.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 1}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        {summaryRow.totalSaleAmt.toLocaleString()}
                    </Text>
                </View>
                <View style={[{flex: 0.6}, commonStyles.tableRightBorder]}>
                    <Text style={[commonStyles.modalCell, commonStyles.numberSmallCell]}>
                        100%
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장명</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowCornerModal(true)}>
                        <Text
                            style={commonStyles.selectText}>{cornerList.find(g => g.cornerCd === selectedCornerCd)?.cornerNm || Const.ALL}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>출력순서</Text>
                    <MyRadioGroup
                        options={[
                            { label: '매장명', value: '0' },
                            { label: '매장순서', value: '1' },
                        ]}
                        selected={sortOrder}
                        onChange={setSortOrder}
                    />
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>DC포함</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleDcIncludedToggle}
                    >
                        <View style={[commonStyles.checkbox, dcIncludedChecked && commonStyles.checkboxChecked]}>
                            {dcIncludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={onSearch}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>

            <View style={commonStyles.sectionDivider}/>

            <Table
                data={saleList}
                columns={mainColumns}
                listFooter={renderFooter}
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
                visible={showSalesOrgListModal}
                title="사업장 선택"
                data={salesOrgList}
                keyField="salesOrgCd"
                labelField="salesOrgNm"
                onClose={() => setShowSalesOrgListModal(false)}
                onSelect={(item) => {
                    setSelectedSalesOrgCd(item.salesOrgCd);
                    setShowSalesOrgListModal(false);
                }}
            />

            <Modal
                visible={isDetailVisible}
                transparent animationType="fade"
                onRequestClose={() => setIsDetailVisible(false)}
            >
                <View style={commonStyles.modalOverlay}>
                    <View style={commonStyles.modalCard}>
                        <View style={commonStyles.modalHeader}>
                            <Text style={commonStyles.modalTitle}>{selectedSale?.cornerNm}</Text>
                            <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                                <Text style={commonStyles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Table
                            data={saleDetailList}
                            columns={saleDetailColumns}
                            isModal={true}
                            listFooter={renderDetailFooterRow}
                        />
                    </View>
                </View>
            </Modal>
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    totalText: {fontWeight: '700', color: '#222'},
});
