import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity } from 'react-native';
import {commonStyles} from "../styles/index";

type ListModalItem = {
    id: string | number;
    name: string;
};

type ListModalProps = {
    visible: boolean;
    title: string;
    data: ListModalItem[];
    onClose: () => void;
    onSelect: (item: ListModalItem) => void;
};

const ListModal: React.FC<ListModalProps> = ({ visible, title, data, onClose, onSelect }) => {
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
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={commonStyles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={commonStyles.modalItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ListModal;
