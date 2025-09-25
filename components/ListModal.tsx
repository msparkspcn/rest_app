import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity } from 'react-native';
import {commonStyles} from "../styles/index";

type ListModalItem = {
    id: string | number;
    name: string;
};

type ListModalProps<T> = {
    visible: boolean;
    title: string;
    data: T[];
    keyField?: keyof T;
    labelField?: keyof T;
    renderItem?: (item: T, onSelect: (item: T) => void) => React.ReactNode;
    onClose: () => void;
    onSelect: (item: T) => void;
};

function ListModal<T>({
                          visible,
                          title,
                          data,
                          keyField,
                          labelField,
                          renderItem,
                          onClose,
                          onSelect,
                      }: ListModalProps<T>) {

    console.log('ListModal data:'+JSON.stringify(data));
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={commonStyles.modalOverlay}>
                <View style={commonStyles.modalContent}>
                    <View style={commonStyles.listModalHeader}>
                        <Text style={commonStyles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={commonStyles.modalClose}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={data}
                        keyExtractor={(item, index) =>
                            keyField ? String(item[keyField]) : String(index)
                        }
                        renderItem={({ item }) =>
                            renderItem ? (
                                renderItem(item, onSelect)
                            ) : (
                                <TouchableOpacity
                                    style={commonStyles.modalItem}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <Text style={commonStyles.modalItemText}>
                                        {labelField ? String(item[labelField]) : JSON.stringify(item)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        }
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ListModal;
