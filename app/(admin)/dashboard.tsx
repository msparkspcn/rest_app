import { commonStyles } from '@/styles';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as api from "../../services/api/api";
import {Table} from "../../components/Table";
import Const from "../../constants/Const";
import {useUser} from "../../contexts/UserContext";
import {User, Corner} from "../../types";

type OperateFilter = {
  key: string;
  name: string;
}

export default function DashboardScreen() {
  const operateOptions: OperateFilter[] = [
    { key: "", name: "전체" },
    { key: "1", name: "운영" },
    { key: "0", name: "폐점" },
  ];
  const [operateFilter, setOperateFilter] = useState<OperateFilter>(operateOptions[0]);

  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [selectedCorner, setSelectedCorner] = useState<Corner | null>(null);
  const {user}:User = useUser();
  const [cornerList, setCornerList] = useState<Corner[]>([]);
  const [cornerItemList, setCornerItemList] = useState(null);

  const onSearch = () => {
    console.log('user:'+JSON.stringify(user.cmpCd));
    const request = {
      cmpCd: user.cmpCd,
      salesOrgCd: user.salesOrgCd,
      useYn: operateFilter.key
    }
    api.getCornerList(request)
        .then(result => {
          if (result.data.responseBody != null) {
            const cornerList = result.data.responseBody;
            console.log('cornerList:' + JSON.stringify(cornerList))
            setCornerList(cornerList);
          }
        })
        .catch(error => {
          console.log("getCornerList error:" + error)
        });
  };

  const openDetail = (corner: Corner) => {
    console.log('corner:'+JSON.stringify(corner))
    const request = {
      cmpCd: corner.cmpCd,
      salesOrgCd: corner.salesOrgCd,
      itemValue:"",
      offset:"",
      page:"1",
      registered:true,
      size:1000,
      storCd: corner.storCd,
      cornerCd: corner.cornerCd
    }
    api.getCornerHandleItems(request)
        .then(result => {
          if (result.data.responseBody != null) {
            const itemList = result.data.responseBody.items;
            console.log('itemList:' + JSON.stringify(itemList))
            setCornerItemList(itemList);
            setSelectedCorner(corner);
            setIsDetailVisible(true);
          }
        })
        .catch(error => {
          console.log("getCornerHandleItems error:" + error)
        });
  };

  const closeDetail = () => {
    setIsDetailVisible(false);
  };

  type Align = 'left' | 'center' | 'right';
  type ColumnDef<T> = {
    key: keyof T | string;
    title: string;
    flex: number;
    align?: Align;
    headerAlign?: Align;
    cellAlign?: Align;
  };

  const mainColumns: ColumnDef<Corner>[] = useMemo(() => ([
    { key: 'no', title: Const.NO, flex: 0.6,
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'cornerNm', title: Const.CORNER_NM, flex: 2,
      renderCell: (item) => (
          <Pressable style={commonStyles.columnPressable} onPress={() => openDetail(item)}>
            <Text style={[commonStyles.cell, commonStyles.linkText,{paddingLeft:10}]}>{item.cornerNm}</Text>
          </Pressable>
      ),   },
    { key: 'cornerCd', title: '코드', flex: 1.2, align: 'center'},
    { key: 'storNm', title: '포스그룹', flex: 1.5, align: 'left',
      renderCell: (item) => (
          <Text style={[commonStyles.cell,{paddingLeft:10}]}>
            {item.storNm}
          </Text>
      )
    },
    { key: 'useYn', title: Const.USE_YN, flex: 1,
      renderCell: (item) => (
          <Text style={[commonStyles.cell, {textAlign:'center'}]}>
            {item.useYn ==='1' ? '운영' : '폐점'}
          </Text>
      )
    },
  ]), []);

  type ItemRow = { itemCd: string; itemNm: string };

  const itemColumns: ColumnDef<ItemRow>[] = useMemo(() => ([
    { key: 'no',          title: Const.NO,     flex: 0.4,
      renderCell: (_item, index) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>{index + 1}</Text>
      ),
    },
    { key: 'itemCd', title: Const.ITEM_CD,  flex: 1.8, align: 'left',
      renderCell: (_item) => (
          <Text style={[commonStyles.cell, { textAlign: 'center' }]}>
            {_item.itemCd} {_item.itemSeq}
          </Text>
      ),
    },
    { key: 'itemNm', title: Const.ITEM_NM,   flex: 2.2, align: 'left'},
  ]), []);

  const CornerNmRow = () => {
    return (
        <View style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: '#aaa' }}>
          <Text style={styles.modalCornerNm}>{selectedCorner?.cornerNm}</Text>
        </View>
    );
  };
  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar style="dark" />

      <View style={commonStyles.topBar}>
        <View style={commonStyles.filterRow}>
          <Text style={commonStyles.filterLabel}>운영여부</Text>
          <View style={commonStyles.segmented}>
            {operateOptions.map(option => (
              <Pressable
                key={option.key}
                onPress={() => setOperateFilter(option)}
                style={[commonStyles.segmentItem, operateFilter.key === option.key && commonStyles.segmentItemActive]}
              >
                <Text style={[commonStyles.segmentText,
                  operateFilter.key === option.key && commonStyles.segmentTextActive]}>
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

      <Table data={cornerList} columns={mainColumns}/>

      <View style={commonStyles.sectionDivider} />

      <Modal visible={isDetailVisible} animationType="fade" transparent>
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalCard}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>{Const.CORNER_ITEM_NM}</Text>
              <Pressable onPress={closeDetail} hitSlop={8}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <Table
                data={cornerItemList}
                columns={itemColumns}
                isModal={true}
                listHeader={CornerNmRow}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalCornerNm: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
