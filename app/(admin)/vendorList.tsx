import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import {Table} from "../../components/Table";
import {ColumnDef} from "../../types/table";
import Const from "../../constants/Const";

type VendorRow = {
  vendor: string;
  status: '등록' | '취소';
};

type RegisterFilter = '전체' | '등록' | '취소';

export default function VendorListScreen() {
  const [vendorQuery, setVendorQuery] = useState('');
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('전체');
  const [submitted, setSubmitted] = useState<{ q: string; f: RegisterFilter }>({ q: '', f: '전체' });
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorRow | null>(null);

  const baseData: VendorRow[] = useMemo(() => {
    return Array.from({ length: 20 }).map((_, index) => ({
      vendor: `거래처 ${String(index + 1).padStart(2, '0')}`,
      status: index % 2 === 0 ? '등록' : '취소',
    }));
  }, []);

  const filteredData = useMemo(() => {
    const { q, f } = submitted;
    return baseData
      .filter((row) => (f === '전체' ? true : row.status === f))
      .filter((row) => (q.trim().length === 0 ? true : row.vendor.includes(q.trim())));
  }, [baseData, submitted]);

  const onSearch = () => {
    setSubmitted({ q: vendorQuery, f: registerFilter });
  };

  const openDetail = (vendor: VendorRow) => {
    setSelectedVendor(vendor);
    setIsDetailVisible(true);
  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  type VendorDetailRow = { itemCd: string; itemNm: string };
  const detailData: VendorDetailRow[] = useMemo(
    () =>
      Array.from({ length: 120 }).map((_, index) => ({
        itemCd: `C${1000 + index}`,
        itemNm: `명칭 ${index + 1}`,
      })),
    []
  );

  const vendorColumns: ColumnDef<VendorDetailRow>[] = useMemo(() => ([
    { key: 'no', title: Const.NO,     flex: 0.7, align: 'center',
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'itemCd', title: '상품코드',  flex: 1.4, align: 'left' },
    { key: 'itemNm', title: '상품명',   flex: 2.2, align: 'left'   },
  ]), []);

  const mainColumns: ColumnDef<VendorRow>[] = useMemo(() => ([
    { key: 'no',       title: Const.NO,     flex: 0.3, align: 'center' ,
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'vendor',     title: '거래처',   flex: 2,   align: 'left',
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
            <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.vendor}</Text>
          </Pressable>
      ),   },
    { key: 'status',     title: '상태',    flex: 0.8, align: 'center' },
  ]), []);

  const VendorNmRow = () => {
    return (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
          <Text style={styles.modalStoreName}>{selectedVendor?.vendor}</Text>
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
            style={styles.input}
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
            {(['전체', '등록', '취소'] as RegisterFilter[]).map((option) => (
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

      <Table data={filteredData} columns={mainColumns}/>

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>거래처 상세</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={20} color="#333" />
              </Pressable>
            </View>

            <Table
                data={detailData}
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
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#333',
  },

  tableList: {
    flex: 1,
    backgroundColor: '#fff'
  },

  modalStoreName: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});


