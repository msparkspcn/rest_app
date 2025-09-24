import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../../contexts/UserContext';
import * as api from "../../services/api/api"
import Const from "../../constants/Const";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface User {
  userId: string;
  userNm: string;
  userRoleType: string; // '001': 운영업체, '002': 휴게소, '004': 주유소
}
export default function LoginScreen() {
  const { login } = useUser();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [checkedLoginSave, setCheckedLoginSave] = useState(false);

  useEffect(() => {
    const loadSavedLogin = async () => {
      const savedLoginSaveYn = await AsyncStorage.getItem('savedLoginSaveYn');
      if(savedLoginSaveYn=='Y') {
        const savedId = await AsyncStorage.getItem('userId');
        const savedPassword = await AsyncStorage.getItem('password');
        setCheckedLoginSave(true);
        console.log('저장된 id, pw:'+savedId+", "+savedPassword)
        if (savedId) setId(savedId);
        if (savedPassword) setPassword(savedPassword);
      }
    };
    loadSavedLogin();
  }, []);

  const handleLogin = () => {
    if (!id) {
      Alert.alert(Const.ERROR, Const.ID_INPUT_MSG);
      return;
    }
    if (!password) {
      Alert.alert(Const.ERROR, Const.PW_INPUT_MSG);
      return;
    }

    console.log('로그인 시도:', { id, password });

    api.login(id, password)
        .then(response => {
          if(response.data.responseBody!=null) {
            // console.log("response:"+JSON.stringify(response.data.responseBody));
            if(response.data.responseCode=="200") {
              console.log("getStoreInfo success data:"+JSON.stringify(response.data));
              login(response.data.responseBody)
              router.replace('/(admin)');
            }
            else {
              console.log(Const.ERROR, response.data.responseMessage);
              if(response.data.responseMessage) {
                Alert.alert(Const.ERROR, response.data.responseMessage);
              }
              else {
                Alert.alert(Const.ERROR, '비밀번호를 확인해주세요');
              }

            }
          }
          else {
            console.log("failed :"+JSON.stringify(response.data));
            Alert.alert(Const.ERROR, response.data.responseMessage);
          }
        })
        .catch(error => console.log("error:"+error))
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const saveLoginInfo = async () => {
    if(!checkedLoginSave) {
      await AsyncStorage.setItem('savedLoginSaveYn', 'Y');
      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('password', password);
    }
    else {
      await AsyncStorage.setItem('savedLoginSaveYn', 'N');
      await AsyncStorage.setItem('userId', '');
      await AsyncStorage.setItem('password', '');
    }
    setCheckedLoginSave(!checkedLoginSave);

  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>SR Mobile</Text>
          <Text style={styles.subtitle}>MEMBER LOGIN</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={id}
              onChangeText={setId}
              placeholder="ID"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="PASSWORD"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.autoLoginContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={saveLoginInfo}
            >
              <View style={[styles.checkbox, checkedLoginSave && styles.checkboxChecked]}>
                {checkedLoginSave && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={styles.saveLoginInfo}>{Const.ID_PW_SAVE}</Text>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>{Const.LOGIN}</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>{Const.NO_ID_MSG}</Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}> {Const.SIGN_UP}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
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
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  autoLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  saveLoginInfo: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
  registerLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
});
