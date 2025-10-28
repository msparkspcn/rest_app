import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import Const from "../../constants/Const";
import {useUser} from "../../contexts/UserContext";
import * as api from "../../services/api/api";
import {User} from "../../types";
import LoadingOverlay from "../../components/LoadingOverlay";
type VendorRow = {
  cmpCd: string;
  outSdCmpNm: string;
  useYn: '등록' | '취소';
};

type RegisterFilter = { key: string; name: string; }

type VendorDetailRow = { itemCd: string; itemNm: string };

export default function VendorListScreen() {
  const [vendorQuery, setVendorQuery] = useState('');
  const registerOptions: RegisterFilter[] = [
    { key: "", name: "전체"},
    { key: "1", name: "등록"},
    { key: "0", name: "취소"},
  ];
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>(registerOptions[0]);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);
  const [vendorList, setVendorList] = useState(null);
  const [vendorItemList, setVendorItemList] = useState(null);
  const {user}:User = useUser();
  const [loading, setLoading] = useState(false);

  const onSearch = () => {
    const request = {
      cmpCd: user.cmpCd,
      salesOrgCd: user.salesOrgCd,
      schValue: vendorQuery,
      useYn: registerFilter.key
    }
    setLoading(true);

    api.getVendorList(request)
        .then(result => {
          if (result.data.responseBody != null) {
            const vendorList = result.data.responseBody;
            setVendorList(vendorList);
          }
        })
        .catch(error => {
          console.log("getVendorList error:" + error)
        }).finally(() => setLoading(false));
  };

  const openDetail = (vendor: VendorRow) => {
    const request = {
      cmpCd: vendor.cmpCd,
      salesOrgCd: user.salesOrgCd,
      outSdCmpCd: vendor.outSdCmpCd,
      registered: true
    }
    console.log('request:'+JSON.stringify(request))
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
    <SafeAreaView style={commonStyles.container} edges={[]}>
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
            {registerOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setRegisterFilter(option)}
                style={[commonStyles.segmentItem, registerFilter.key === option.key && commonStyles.segmentItemActive]}
              >
                <Text style={[commonStyles.segmentText, registerFilter.key === option.key && commonStyles.segmentTextActive]}>
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

      <Table data={vendorList} columns={mainColumns}/>

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>거래처 취급상품</Text>
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
      {loading && (<LoadingOverlay />)}
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


