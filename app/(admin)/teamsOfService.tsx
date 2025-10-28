import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import Const from "../../constants/Const";
import {commonStyles} from "../../styles/index";

type TOSProps = {
    type: string;
    onClose: () => void;
};

export default function TeamsOfService({type, onClose}: TOSProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={commonStyles.modalTitle}>이용약관 및 개인정보처리방침</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={commonStyles.modalClose}>✕</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.termsContainer}>
                <View style={styles.termTitle}>
                    <Text style={styles.termText}>* 이용약관</Text>
                </View>

                <View style={styles.termContent}>
                    <ScrollView contentContainerStyle={{flexGrow: 1}}>
                        <Text style={styles.termContentText}>
                            {Const.TEST_TOS_CONTENTS}
                        </Text>
                    </ScrollView>
                </View>

                <View style={styles.termTitle}>
                    <Text style={styles.termText}>* 개인정보 수집 및 이용동의</Text>
                </View>

                <View style={styles.termContent}>
                    <ScrollView contentContainerStyle={{flexGrow: 1}}>
                        <Text style={styles.termContentText}>
                            1. 수집하는 개인정보 항목: 이름, 이메일 주소{'\n'}
                            2. 개인정보의 수집 및 이용목적: 회원가입 및 서비스 제공{'\n'}
                            3. 개인정보의 보유 및 이용기간: 회원탈퇴 시까지{'\n'}
                            4. 동의 거부권 및 거부에 따른 불이익: 동의 거부 시 회원가입이 제한됩니다.
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#aaa',
    },
    scrollContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        // paddingHorizontal: 24,
        // paddingVertical: 40,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    termsContainer: {
        width: '100%',
        marginBottom: 12,
    },
    termTitle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        // backgroundColor:'red'
    },
    termText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    termContent: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#aaa',
        backgroundColor: '#f8f8f8',
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        marginBottom: 15,
        minHeight: 250,
        maxHeight: 300
    },
    termContentText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    modalClose: {
        fontSize: 20,
        color: '#666',
    },
});
