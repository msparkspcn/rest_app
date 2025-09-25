import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Const from "../../constants/Const";

export default function UsersScreen() {
  const [users, setUsers] = useState(
    [
      {
        id: 1,
        name: '김철수',
        email: 'kim@example.com',
        status: 'active',
        role: 'user',
        joinDate: '2024-01-15',
        departmentType: '휴게소',
      },
    ]
  );

  const currentUser = users[0];

  const [formName, setFormName] = useState(currentUser?.name ?? '');
  const [formCurrentPassword, setFormCurrentPassword] = useState('');
  const [formNewPassword, setFormNewPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');

  useEffect(() => {
    setFormName(currentUser?.name ?? '');
  }, [currentUser?.name]);

  const validateAndSave = () => {

    if (formNewPassword.length > 0) {
      if (!formCurrentPassword) {
        Alert.alert(Const.ERROR, '현재 비밀번호를 입력해주세요.');
        return;
      }
      if (formNewPassword !== formConfirmPassword) {
        Alert.alert(Const.ERROR, '변경 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (formNewPassword.length < 7 || formNewPassword.length > 20) {
        Alert.alert(Const.ERROR, '비밀번호 길이를 확인해주세요.');
        return;
      }
      const hasLetters = /[a-zA-Z]/.test(formNewPassword);
      const hasNumbers = /[0-9]/.test(formNewPassword);
      const hasSymbols = /[~!@#$%^&*()]/.test(formNewPassword);
      let charTypeCount = 0;
      if (hasLetters) charTypeCount++;
      if (hasNumbers) charTypeCount++;
      if (hasSymbols) charTypeCount++;
      if (charTypeCount < 2) {
        Alert.alert(Const.ERROR, '비밀번호 입력규칙을 확인해주세요.');
        return;
      }
    }

    // 이름 변경 반영
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, name: formName } : u));
    }

    // 실제 API 연동 위치: 현재 비밀번호 검증 및 변경 비밀번호 저장

    Alert.alert('완료', '사용자 정보가 저장되었습니다.');
    setFormCurrentPassword('');
    setFormNewPassword('');
    setFormConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
     style={styles.container}
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>소속구분</Text>
            <TextInput
              style={[styles.formInput, styles.readonlyInput]}
              value={currentUser?.departmentType ?? ''}
              editable={false}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{Const.ID}</Text>
            <TextInput
              style={[styles.formInput, styles.readonlyInput]}
              value={currentUser?.email ?? ''}
              editable={false}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>현재 비밀번호</Text>
            <TextInput
              style={styles.formInput}
              value={formCurrentPassword}
              onChangeText={setFormCurrentPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>변경 비밀번호</Text>
            <TextInput
              style={styles.formInput}
              value={formNewPassword}
              onChangeText={setFormNewPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}></Text>
            <TextInput
              style={styles.formInput}
              value={formConfirmPassword}
              onChangeText={setFormConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>사용자명</Text>
            <TextInput
              style={styles.formInput}
              value={formName}
              onChangeText={setFormName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <Pressable style={styles.saveButton} onPress={validateAndSave}>
            <Text style={styles.saveButtonText}>저장</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

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

  scrollContent: {
    // flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  form: {
    width: '100%',
  },
  formRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
    width: 110,
    marginRight: 12,
  },
  formInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    flex: 1,
  },
  readonlyInput: {
    backgroundColor: '#f7f7f7',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },

});
