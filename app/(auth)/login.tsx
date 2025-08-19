import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
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

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  const handleLogin = () => {
    if (!id) {
      Alert.alert('오류', '아이디를 입력해주세요.');
      return;
    } 
    if (!password) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 여기에 실제 로그인 로직을 구현하세요
    console.log('로그인 시도:', { id, password, autoLogin });
    
    // 자동로그인 설정 저장
    if (autoLogin) {
      // AsyncStorage나 다른 저장소에 자동로그인 정보 저장
      console.log('자동로그인 설정 저장됨');
    }
    
    // 로그인 성공 시 홈화면으로 이동
    router.replace('/(admin)');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  const toggleAutoLogin = () => {
    setAutoLogin(!autoLogin);
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
              onPress={toggleAutoLogin}
            >
              <View style={[styles.checkbox, autoLogin && styles.checkboxChecked]}>
                {autoLogin && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={styles.autoLoginText}>자동로그인</Text>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>계정이 없으신가요? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>회원가입</Text>
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
  autoLoginText: {
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
});
