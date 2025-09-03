import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {commonStyles} from "../../styles/index";

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  // 회원가입 폼 데이터
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  // 선택 목록 관련 상태
  const [showDepartmentTypeModal, setShowDepartmentTypeModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [selectedDepartmentType, setSelectedDepartmentType] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // 선택 목록 데이터
  const departmentTypes = ['휴게소', '주유소', '운영업체'];
  const departments = ['경영진', '영업팀', '마케팅팀', '개발팀', '인사팀', '재무팀', '기타'];

  const handleTermsToggle = () => {
    setTermsAgreed(!termsAgreed);
  };

  const handlePrivacyToggle = () => {
    setPrivacyAgreed(!privacyAgreed);
  };

  const handleNextStep = () => {
    if (!termsAgreed || !privacyAgreed) {
      Alert.alert('오류', '모든 약관에 동의해주세요.');
      return;
    }
    setStep(2);
  };

  const handleRegister = () => {
    if (!name || !id || !password || !confirmPassword) {
      Alert.alert('오류', '모든 필드를 입력해주세요.');
      return;
    }

    if (!isIdChecked) {
      Alert.alert('오류', '아이디 중복체크를 완료해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 7 || password.length >20) {
      Alert.alert('오류', '비밀번호 길이를 확인해주세요.');
      return;
    }

  const hasLetters = /[a-zA-Z]/.test(password); // 영문 포함 여부
  const hasNumbers = /[0-9]/.test(password); // 숫자 포함 여부
  const hasSymbols = /[~!@#$%^&*()]/.test(password); // 특수문자 포함 여부

  // 3. 포함된 문자 종류의 개수 확인
  let charTypeCount = 0;
  if (hasLetters) charTypeCount++;
  if (hasNumbers) charTypeCount++;
  if (hasSymbols) charTypeCount++;

  if(charTypeCount <2) {
    Alert.alert('오류', '비밀번호 입력규칙을 확인해주세요.');
    return;
  }


    // 여기에 실제 회원가입 로직을 구현하세요
    console.log('회원가입 시도:', { name, id, password, termsAgreed, privacyAgreed });

    Alert.alert(
      '회원가입 완료',
      '회원가입이 완료되었습니다. 로그인해주세요.',
      [
        {
          text: '확인',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleBackToTerms = () => {
    setStep(1);
  };

  // 선택 목록 핸들러
  const handleSelectDepartmentType = (type: string) => {
    setSelectedDepartmentType(type);
    setShowDepartmentTypeModal(false);
  };

  const handleSelectDepartment = (department: string) => {
    setSelectedDepartment(department);
    setShowDepartmentModal(false);
  };


  const handleIdCheck = () => {
    if (!id.trim()) {
      Alert.alert('오류', '아이디를 입력해주세요.');
      return;
    }

    // 여기에 실제 아이디 중복체크 로직을 구현하세요
    console.log('아이디 중복체크:', id);

    // 임시로 성공으로 처리
    setIsIdChecked(true);
    Alert.alert('확인', '사용 가능한 아이디입니다.');
  };

  // 약관동의 화면
  if (step === 1) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="dark" />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>이용약관 동의</Text>
              <Text style={styles.subtitle}>회원가입을 위해 약관에 동의해주세요</Text>
            </View>

            <View style={styles.termsContainer}>
              <View style={styles.termItem}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handleTermsToggle}
                >
                  <View style={[styles.checkbox, termsAgreed && styles.checkboxChecked]}>
                    {termsAgreed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termText}>이용약관에 동의합니다 (필수)</Text>
              </View>

              <View style={styles.termContent}>
                <Text style={styles.termContentText}>
                  제1조 (목적) 이 약관은 SR Mobile(이하 &lsquo;회사&rsquo;)이 제공하는 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </Text>
              </View>

              <View style={styles.termItem}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={handlePrivacyToggle}
                >
                  <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
                    {privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
                <Text style={styles.termText}>개인정보 수집 및 이용에 동의합니다 (필수)</Text>
              </View>

              <View style={styles.termContent}>
                <Text style={styles.termContentText}>
                  1. 수집하는 개인정보 항목: 이름, 이메일 주소{'\n'}
                  2. 개인정보의 수집 및 이용목적: 회원가입 및 서비스 제공{'\n'}
                  3. 개인정보의 보유 및 이용기간: 회원탈퇴 시까지{'\n'}
                  4. 동의 거부권 및 거부에 따른 불이익: 동의 거부 시 회원가입이 제한됩니다.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.nextButton, (!termsAgreed || !privacyAgreed) && styles.nextButtonDisabled]}
              onPress={handleNextStep}
              disabled={!termsAgreed || !privacyAgreed}
            >
              <Text style={styles.nextButtonText}>다음</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
              <Text style={styles.backButtonText}>로그인으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // 회원가입 폼 화면
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>관리자 회원가입</Text>
            <Text style={styles.subtitle}>새로운 관리자 계정을 생성하세요</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>소속구분</Text>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowDepartmentTypeModal(true)}
                >
                    <Text style={[styles.selectText, !selectedDepartmentType && styles.placeholderText]}>
                        {selectedDepartmentType || '선택'}
                    </Text>
                    <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>소속</Text>
                <TouchableOpacity
                    style={styles.selectInput}
                    onPress={() => setShowDepartmentModal(true)}
                >
                    <Text style={[styles.selectText, !selectedDepartment && styles.placeholderText]}>
                        {selectedDepartment || '선택'}
                    </Text>
                    <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>아이디</Text>
                <View style={styles.idInputContainer}>
                    <TextInput
                        style={styles.idInput}
                        value={id}
                        onChangeText={(text) => {
                            setId(text);
                            setIsIdChecked(false); // 아이디 변경 시 중복체크 상태 초기화
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity
                        style={[styles.checkButton, isIdChecked && styles.checkButtonSuccess]}
                        onPress={handleIdCheck}
                    >
                        <Text style={[styles.checkButtonText, isIdChecked && styles.checkButtonTextSuccess]}>
                            {isIdChecked ? '사용가능' : '중복체크'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>


            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                key="passwordInput"
                defaultValue={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (!showConfirm && text.length > 0) setShowConfirm(true);
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>

            {showConfirm && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>비밀번호 확인</Text>
                <TextInput
                  style={styles.input}
                  key="confirmPasswordInput"
                  defaultValue={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  textContentType="none"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>


            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>회원가입</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToTermsButton} onPress={handleBackToTerms}>
              <Text style={styles.backToTermsText}>약관으로 돌아가기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 소속구분 선택 Modal */}
      <Modal
        visible={showDepartmentTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartmentTypeModal(false)}
      >
        <View style={commonStyles.modalOverlay}>
          <View style={commonStyles.modalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>소속구분 선택</Text>
              <TouchableOpacity onPress={() => setShowDepartmentTypeModal(false)}>
                <Text style={commonStyles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {departmentTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => handleSelectDepartmentType(type)}
                >
                  <Text style={styles.modalItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 소속 선택 Modal */}
      <Modal
        visible={showDepartmentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDepartmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={commonStyles.modalHeader}>
              <Text style={commonStyles.modalTitle}>소속 선택</Text>
              <TouchableOpacity onPress={() => setShowDepartmentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {departments.map((department, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => handleSelectDepartment(department)}
                >
                  <Text style={styles.modalItemText}>{department}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
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
  termsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
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
  termText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  termContent: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    marginLeft: 32,
  },
  termContentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 0,
    width: 110,
    marginRight: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backToTermsButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToTermsText: {
    fontSize: 16,
    color: '#007AFF',
  },
  selectInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  selectArrow: {
    fontSize: 12,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: '70%',
  },
  modalClose: {
    fontSize: 20,
    color: '#666',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  idInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  idInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  checkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  checkButtonSuccess: {
    backgroundColor: '#34C759',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkButtonTextSuccess: {
    color: '#fff',
  },
});
