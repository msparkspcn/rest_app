import {StatusBar} from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import {Alert, Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {commonStyles} from '@/styles';
import {Table} from "../../components/Table";
import Const from "../../constants/Const";
import ListModal from "../../components/ListModal";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {Corner, User} from "../../types";
import {ColumnDef} from "../../types/table";
import LoadingOverlay from "../../components/LoadingOverlay";

type ProductRow = {
    cornerCd: string;
    storCd: string;
    itemNm: string;
    itemCd: string;
    soldoutYn: '0' | '1';
    sortOrder: number;
};

export default function KioskSoldOutScreen() {
    const [cornerList, setCornerList] = useState<Corner[]>([]);

    const [selectedCornerCd, setSelectedCornerCd] = useState<string>('');
    const [showCornerModal, setShowCornerModal] = useState(false);
    const {user}:User = useUser();
    const [selectedCorner, setSelectedCorner] = useState<Corner>({"cornerCd":"", "storCd":""});
    const [loading, setLoading] = useState(false);
    const [itemList, setItemList] = useState<ProductRow[]>([]);

    useEffect(() => {
        console.log('user:'+JSON.stringify(user.cmpCd));
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
    },[])

    const onSearch = (storCd: string, cornerCd: string) => {
        console.log('조회 클릭 storCd:'+storCd+", cornerCd:"+cornerCd);
        //getKioskItemList
        if (!cornerCd) {
            Alert.alert(Const.ERROR, Const.NO_SALES_ORG_MSG);
            return;
        }

        const request = {
            cmpCd: user.cmpCd,
            cornerCd: cornerCd,
            salesOrgCd: user.salesOrgCd,
            storCd: storCd
        }
        console.log("request:"+JSON.stringify(request))
        setLoading(true);
        api.getKioskItemList(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const itemList = result.data.responseBody;
                    console.log('itemList:' + JSON.stringify(itemList))
                    setItemList(itemList);
                }
                setLoading(false);
            })
            .catch(error => {
                console.log("getKioskItemList error:" + error);
                setLoading(false);
            });
    };

    const mainColumns: ColumnDef<ProductRow>[] = useMemo(() => ([
        {
            key: 'no', title: Const.NO, flex: 0.3,
            renderCell: (_item, index) => (
                <Text style={[commonStyles.cell, {textAlign: 'center'}]}>{index + 1}</Text>
            ),
        },
        {key: 'itemNm', title: '상품명', flex: 2, align: 'left'},
        {
            key: 'soldoutYn', title: '사용여부', flex: 0.5, align: 'center',
            renderCell: (item) => (
                <Pressable style={commonStyles.columnPressable} onPress={() => updateSoldoutYn(item)}>
                    <Text style={[commonStyles.cell, commonStyles.linkText, {textAlign: 'center'}]}>
                        {item.soldoutYn === '0' ? '출력' : '품절'}
                    </Text>
                </Pressable>
            ),
        },
    ]), []);

    const updateSoldoutYn = (item: ProductRow) => {
        const request = [{
            cmpCd: user.cmpCd,
            salesOrgCd: user.salesOrgCd,
            cornerCd: item.cornerCd,
            itemCd: item.itemCd.slice(0, 10),
            itemSeq: item.itemCd.slice(10),
            soldoutYn: item.soldoutYn === "1" ? "0" : "1",
            storCd: item.storCd
        }];
        console.log('item:'+JSON.stringify(item));
        console.log('request:'+JSON.stringify(request));

        api.updateSoldoutYn(request)
            .then(result => {
                if (result.data.responseBody != null) {
                    const res = result.data.responseBody;
                    console.log('res:' + JSON.stringify(res));
                    onSearch(item.storCd, item.cornerCd);
                    // Alert.alert('완료', '완료되었습니다.');
                }
            })
            .catch(error => {
                console.log("updateSoldoutYn error:" + error)
            });
    }

    return (
        <SafeAreaView style={commonStyles.container}>
            <StatusBar style="dark"/>

            <View style={commonStyles.topBar}>
                <View style={commonStyles.filterRow}>
                    <Text style={commonStyles.filterLabel}>매장</Text>
                    <TouchableOpacity
                        style={commonStyles.selectInput}
                        onPress={() => setShowCornerModal(true)}
                    >
                        <Text style={[commonStyles.selectText, !selectedCornerCd && styles.placeholderText]}>
                            {cornerList.find((s) => s.cornerCd === selectedCornerCd)?.cornerNm || Const.SELECT}
                        </Text>
                        <Text style={commonStyles.selectArrow}>▼</Text>
                    </TouchableOpacity>
                    <Pressable style={commonStyles.searchButton} onPress={() => onSearch(selectedCorner.storCd, selectedCorner.cornerCd)}>
                        <Text style={commonStyles.searchButtonText}>{Const.SEARCH}</Text>
                    </Pressable>
                </View>
            </View>
            <View style={commonStyles.sectionDivider}/>

            <Table data={itemList} columns={mainColumns}/>

            <ListModal
                visible={showCornerModal}
                title="매장 선택"
                data={cornerList}
                keyField="cornerCd"
                labelField="cornerNm"
                onClose={() => setShowCornerModal(false)}
                onSelect={(item) => {
                    setSelectedCorner(item);
                    setSelectedCornerCd(item.cornerCd)
                    setShowCornerModal(false);
                }}
            />
            {loading && (<LoadingOverlay />)}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    placeholderText: {
        color: '#999',
    }
});
