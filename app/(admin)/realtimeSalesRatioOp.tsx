import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from "../../styles/index";
import {dateToYmd, formattedDate, getTodayYmd} from "../../utils/DateUtils";
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import {DatePickerModal} from "../../components/DatePickerModal";
import Const from "../../constants/Const";
import {User, SalesOrg} from "../../types";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import ListModal from "../../components/ListModal";
import {AntDesign} from "@expo/vector-icons";
import LoadingOverlay from "../../components/LoadingOverlay";

type SaleRow = {
    salesOrgNm: string;
    salesOrgCd: string;
    lastWeekActualSaleRatio: number;
    yesterdayActualSaleRatio: string;
    actualSaleAmt: number
};

export default function RealtimeSalesRatio() {
    const [saleDate, setSaleDate] = useState(getTodayYmd());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);

    const [showSalesOrgListModal, setShowSalesOrgListModal] = useState(false);

    const {user}: User = useUser();
    const [salesOrgList, setSalesOrgList] = useState<SalesOrg[]>([]);

    const [vatExcludedChecked, setVatExcludedChecked] = useState(false);
    const [appliedVatChecked, setAppliedVatChecked] = useState(false);
    const [dcIncludedChecked, setDcIncludedChecked] = useState(true);
    const [appliedDcChecked, setAppliedDcChecked] = useState(false);

    const [selectedSalesOrgCd, setSelectedSalesOrgCd] = useState<string>('');
    const [saleList, setSaleList] = useState<SaleRow[]>([]);
    const [saleStatList ,setSaleStatList] = useState<[] | null>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getSalesOrgList();
    },[]);

    const getSalesOrgList = () => {
        const request = { cmpCd: user.cmpCd }
        api.getSalsOrgList(request)
            .then(result => {
                console.log("result:"+JSON.stringify(result))
                if (result.data.responseBody != null) {
                    const salesOrgList = result.data.responseBody;
                    setSalesOrgList([{salesOrgCd:'', salesOrgNm: '전체'}, ...salesOrgList]);
                }
            })
            .catch(error => {
                console.log("getSalsOrgList error:" + error)
            });
    }

    const onSearch = () => {
        console.log("조회 클릭");
        setAppliedDcChecked(dcIncludedChecked);
        setAppliedVatChecked(vatExcludedChecked);

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: saleDate
        }
        console.log('request:'+JSON.stringify(request));
        setLoading(true);

        api.mobOperRealTimeSaleRatio(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleList = result.data.responseBody;
                    console.log('saleList:' + JSON.stringify(saleList))
                    setSaleList(saleList);
                    if(saleList.length > 0) {
                        mobOperRealTimeSaleStat();
                    }
                    else {
                        setLoading(false);
                    }
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperRealTimeSaleRatio error:" + error)
            });
    };

    const mobOperRealTimeSaleStat = () => {
        console.log("실적 조회")

        const request = {
            cmpCd: user.cmpCd,
            fromSaleDt: saleDate,
            salesOrgCd: selectedSalesOrgCd,
            storCd: "",
            toSaleDt: ""
        }
        console.log('request:'+JSON.stringify(request));
        // setLoading(true);
        api.mobOperRealTimeSaleStat(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const saleStatList = result.data.responseBody;
                    console.log('saleStatList:' + JSON.stringify(saleStatList))
                    setSaleStatList(saleStatList);
                    setLoading(false);
                }
            })
            .catch(error => {
                setLoading(false);
                console.log("mobOperRealTimeSaleStat error:" + error)
            });
    };

    const openDatePicker = () => {
        setTempDate(new Date());
        setShowDatePicker(true);
    };

    const mainColumns: ColumnDef<SaleRow>[] = useMemo(() => ([
        {key: 'no', title: Const.NO, flex: 0.4,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
            ),
        },
        {
            key: 'salesOrgNm', title: '사업소', flex: 1.5,
            renderCell: (item) => (
                <Text style={[commonStyles.cell, {paddingLeft: 10}]}>
                    {item.salesOrgNm}
                </Text>
            ),
        },
        {key: 'lastWeekActualSaleRatio', title: '전주대비', flex: 1,
            renderCell: (item) => {
                const value = item.lastWeekActualSaleRatio;
                const isUp = value > 0;
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end'}}>
                        <Text style={commonStyles.numberCell}>
                            {item.lastWeekActualSaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={isUp ? 'caretup' : 'caretdown'}
                            size={12}
                            color={isUp ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                )
            }
        },
        {
            key: 'yesterdayActualSaleRatio', title: '전일대비', flex: 1,
            renderCell: (item) => {
                const value = item.yesterdayActualSaleRatio;
                const isUp = value > 0;
                return (
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'flex-end'}}>
                        <Text style={commonStyles.numberCell}>
                            {item.yesterdayActualSaleRatio.toLocaleString()}
                        </Text>
                        <AntDesign
                            name={isUp ? 'caretup' : 'caretdown'}
                            size={12}
                            color={isUp ? 'red' : 'blue'}
                            style={{marginRight: 2}}
                        />
                    </View>
                )
            }
        },
        {key: 'actualSaleAmt', title: '총매출', flex: 1.3,
            renderCell: (item) => (
                    <Text style={commonStyles.numberCell}>
                        {item.actualSaleAmt.toLocaleString()}
                    </Text>
                )
        },
    ]), []);

    const tableData = useMemo(() => {
        if (!saleList) return []; // null 방지

        const result: (SaleRow & { isSummary?: boolean })[] = [];

        const grouped: Record<string, SaleRow[]> = {};
        saleList.forEach(item => {
            if (!grouped[item.operDiv]) grouped[item.operDiv] = [];
            grouped[item.operDiv].push(item);
        });

        let no = 0;
        let sumNo = 0;
        Object.keys(grouped)
            .sort()
            .forEach(operDiv => {
                const rows = grouped[operDiv];
                let storSum = 0;
                let netSaleSum = 0;
                rows.forEach((item) => {
                    if (appliedVatChecked && appliedDcChecked) storSum += item.saleAmt - item.vatAmt; //부가세 적용, DC적용 X
                    else if (appliedVatChecked && !appliedDcChecked) storSum += item.netSaleAmt; //부가세 적용, DC적용
                    else if (!appliedVatChecked && appliedDcChecked) storSum += item.saleAmt; //부가세 적용X, DC적용 X 총 매출
                    else if (!appliedVatChecked && !appliedDcChecked) storSum += item.actualSaleAmt; //부가세 적용X, DC적용 -> 기본값
                    no += 1;
                    result.push({
                        ...item,
                        no: no
                    });
                });
                if(!selectedSalesOrgCd) {
                    let summaryName = '';
                    if (operDiv === '01') summaryName = '휴게소 소계';
                    else if (operDiv === '02') summaryName = '주유소 소계';
                    sumNo -= 1;
                    result.push({
                        no: sumNo,
                        salesOrgCd: '',
                        orgNm: summaryName,
                        saleAmt: 0,
                        actualSaleAmt: 0,
                        totalSaleAmt: storSum,
                        operDiv:'',
                        isSummary: true,
                        vatAmt: 1, netSaleAmt: 0
                    });
                }
            });
        // console.log("result:"+JSON.stringify(result));

        return result;
    }, [saleList]);

    const handleVatExcludedToggle = () => {
        setVatExcludedChecked(!vatExcludedChecked);
    };
    const handleDcIncludedToggle = () => {
        setDcIncludedChecked(!dcIncludedChecked)
    }

    const renderHeader = () => {
        if (saleList.length == 0) return null;
        return (
            <View>
                {saleStatList.map(row => {
                    let saleValue1;
                    let saleValue2;
                    console.log('row:' + JSON.stringify(row));

                    if (appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1 - row.vatAmt1;
                        saleValue2 = row.saleAmt2 - row.vatAmt2;

                    } //부가세 적용, DC적용 X
                    if (appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.netSaleAmt1;
                        saleValue2 = row.netSaleAmt2;
                    } //부가세 적용, DC적용
                    if (!appliedVatChecked && appliedDcChecked) {
                        saleValue1 = row.saleAmt1;
                        saleValue2 = row.saleAmt2;
                    } //부가세 적용X, DC적용 X 총 매출
                    if (!appliedVatChecked && !appliedDcChecked) {
                        saleValue1 = row.actualSaleAmt1;
                        saleValue2 = row.actualSaleAmt2;
                    }
                    let lastWeekIsUp = saleValue1 > 0;
                    let yesDayIsUp = saleValue2 > 0;
                    console.log('saleValue1:' + saleValue1 + ', saleValue2:' + saleValue2);
                    return (
                        <View
                            key={row.sortOrder}
                            style={[commonStyles.tableRow, commonStyles.summaryRow,
                                {
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 0,
                                    width: '100%'
                                },
                            ]}
                        >
                            <View style={[{flex: 1.9, justifyContent: 'center'}, commonStyles.tableRightBorder]}>
                                <Text style={[{textAlign:'center'}, commonStyles.cell, commonStyles.summaryLabelText]}>
                                    {row.label}
                                </Text>
                            </View>
                            <View style={[{
                                flex: 3.3,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                            }]}>
                                {(row.sortOrder === '1') && (
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue1.toLocaleString()} / </Text>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue2.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                                {(row.sortOrder === '2') && (
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{fontSize: 12}}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={lastWeekIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={lastWeekIsUp ? 'red' : 'blue'}
                                            style={{paddingHorizontal: 5}}
                                        />
                                        <Text style={{fontSize: 12}}> / {saleValue2.toLocaleString()}
                                        </Text>
                                        <AntDesign
                                            name={yesDayIsUp ? 'caretup' : 'caretdown'}
                                            size={13}
                                            color={yesDayIsUp ? 'red' : 'blue'}
                                            style={{paddingHorizontal: 5}}
                                        />
                                    </View>
                                )}
                                {(row.sortOrder === '3') && (
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={{fontSize: 12, paddingRight: 5}}>
                                            {saleValue1.toLocaleString()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        )
    }



    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>사업장</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={() => setShowSalesOrgListModal(true)}>
                        <Text style={commonStyles.selectText}>
                            {salesOrgList.find(g => g.salesOrgCd === selectedSalesOrgCd)?.salesOrgNm || Const.ALL}
                        </Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={[commonStyles.filterRowFront]}>
                    <Text style={commonStyles.filterLabel}>조회일자</Text>
                    <TouchableOpacity style={commonStyles.selectInput} onPress={openDatePicker}>
                        <Text style={commonStyles.selectText}>{formattedDate(saleDate)}</Text>
                        <Text style={commonStyles.selectArrow}> ▼</Text>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRowFront}>
                    <Text style={commonStyles.filterLabel}>부가세별도</Text>
                    <TouchableOpacity
                        style={commonStyles.checkboxContainer}
                        onPress={handleVatExcludedToggle}
                    >
                        <View style={[commonStyles.checkbox, vatExcludedChecked && commonStyles.checkboxChecked]}>
                            {vatExcludedChecked && <Text style={commonStyles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>DC금액포함</Text>
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
                listHeader={renderHeader}
            />

            <DatePickerModal
                visible={showDatePicker}
                initialDate={tempDate}
                onClose={() => setShowDatePicker(false)}
                onConfirm={(date) => setSaleDate(dateToYmd(date))}
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
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}


