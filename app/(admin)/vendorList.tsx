import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useMemo, useState} from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import Const from "../../constants/Const";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {User} from "../../types";
type VendorRow = {
  cmpCd: string;
  outSdCmpNm: string;
  useYn: '등록' | '취소';
};

type RegisterFilter = Const.ALL | '등록' | '취소';

export default function VendorListScreen() {
  const [vendorQuery, setVendorQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>(Const.ALL);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);
  const [vendorList, setVendorList] = useState(null);
  const [vendorItemList, setVendorItemList] = useState(null);
  const {user}:User = useUser();

  useEffect(() => {
    console.log('api 테스트1')
  })

  const onSearch = () => {
    console.log('user:'+JSON.stringify(user.cmpCd));
    const request = {
      cmpCd: user.cmpCd,
      salesOrgCd: user.salesOrgCd,
      schValue: vendorQuery,
    }
    api.getVendorList(request)
        .then(result => {
          if (result.data.responseBody != null) {
            const vendorList = result.data.responseBody;
            console.log('List:' + JSON.stringify(vendorList))
            setVendorList(vendorList);
          }
        })
        .catch(error => {
          console.log("getVendorList error:" + error)
        });
  };

  const openDetail = (vendor: VendorRow) => {
    const request = {
      cmpCd: vendor.cmpCd,
      salesOrgCd: user.salesOrgCd,
      itemCd: "",
      itemNm: "",
      outSdCmpCd: vendor.outSdCmpCd,
      page:0,
      size: 100000,
    }
    api.getVendorItemList(request)
        .then(result => {
          if (result.data.responseBody != null) {
            const vendorItemList = result.data.responseBody.items;
            // console.log('List:' + JSON.stringify(vendorItemList))
            console.log('size:'+result.data.responseBody.totalCount);
            setVendorItemList(vendorItemList);

            setSelectedVendor(vendor);
            setIsDetailVisible(true);
          }
        })
        .catch(error => {
          console.log("getVendorList error:" + error)
        });

  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  type VendorDetailRow = { itemCd: string; itemNm: string };

  const vendorColumns: ColumnDef<VendorDetailRow>[] = useMemo(() => ([
    { key: 'no', title: Const.NO,     flex: 0.5, align: 'center',
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'itemCd', title: '상품코드',  flex: 1.5, align: 'left',
      renderCell: (_item) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>
            {_item.itemCd} {_item.itemSeq}
          </Text>
      )
    },
    { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left'},
  ]), []);

  const mainColumns: ColumnDef<VendorRow>[] = useMemo(() => ([
    { key: 'no',       title: Const.NO,     flex: 0.3, align: 'center' ,
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'outSdCmpNm',     title: '거래처',   flex: 2,   align: 'left',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
            <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.outSdCmpNm}</Text>
          </Pressable>
      ),   },
    { key: 'useYn',     title: '상태',    flex: 0.5,
      renderCell: (item) => (
          <Text style={[commonStyles.cell, {textAlign:'center'}]}>
            {item.useYn ==='1' ? '등록' : '취소'}
          </Text>
      )
    },
  ]), []);

  const VendorNmRow = () => {
    return (
        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#aaa' }}>
          <Text style={styles.modalStoreName}>{selectedVendor?.outSdCmpNm}</Text>
        </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={commonStyles.filterRowFront}>
          <Text style={commonStyles.filterLabel}>거래처</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="거래처 입력"
            placeholderTextColor="#999"
            value={vendorQuery}
            onChangeText={setVendorQuery}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>

        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>등록여부</Text>
          <View style={commonStyles.segmented}>
            {([Const.ALL, '등록', '취소'] as RegisterFilter[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => setRegisterFilter(option)}
                style={[commonStyles.segmentItem, registerFilter === option && commonStyles.segmentItemActive]}
              >
                <Text style={[commonStyles.segmentText, registerFilter === option && commonStyles.segmentTextActive]}>
                  {option}
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

      <Table data={vendorList} columns={mainColumns}/>

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>거래처 상세</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <Table
                data={vendorItemList}
                columns={vendorColumns}
                isModal={true}
                listHeader={VendorNmRow}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalStoreName: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});


