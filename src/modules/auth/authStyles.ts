import { StyleSheet } from 'react-native';
import { Colors } from '../../assets/Colors';
import { Fonts } from '../../assets/Fonts';

export const sx = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  wrap: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  logo: { alignSelf: 'center', width: 130, height: 62, resizeMode: 'contain', marginTop: 14, marginBottom: 10 },

  segment: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 4,
    alignSelf: 'center',
    width: '90%',
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    height: 35,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: Colors.blue,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: {
    color: Colors.blue,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: Fonts.fontSize[14],
  },
  segmentTextActive: {
    color: Colors.white,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontSize: Fonts.fontSize[14],
  },

  form: { marginTop: 2 },
  label: {
    color: Colors.black,
    fontFamily: Fonts.fontFamily.LexendMedium,
    fontSize: Fonts.fontSize[12],
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundlogin,
    borderWidth: 1.5,
    borderColor: '#E5EEF5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 45,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: Fonts.fontSize[13],
    fontFamily: Fonts.fontFamily.LexendRegular,
    color: Colors.black,
  },
  eyeBtn: { paddingLeft: 6, paddingVertical: 6, minWidth: 36, alignItems: 'center' },
  eyeTxt: { color: Colors.blue, fontFamily: Fonts.fontFamily.LexendSemiBold },

  errorText: {
    color: '#F04438',
    marginTop: 6,
    marginBottom: 2,
    fontSize: Fonts.fontSize[12],
    fontFamily: Fonts.fontFamily.LexendRegular,
  },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
 
  
  rememberText: { color: Colors.black, fontSize: Fonts.fontSize[12], fontFamily: Fonts.fontFamily.LexendRegular },
  forgot: { color: Colors.blue, fontSize: Fonts.fontSize[12], fontFamily: Fonts.fontFamily.LexendSemiBold },
  checkbox: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.blue,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {  borderColor: Colors.blue ,width: 18, height: 18  },
  checkmark: {
    color: '#fff', fontSize: 12, lineHeight: 12, fontWeight: '700',
  },
  checkboxWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  loginBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginBtnDisabled: { backgroundColor: Colors.mainLight },
  loginBtnText: {
    color: Colors.white,
    fontSize: Fonts.fontSize[16],
    fontFamily: Fonts.fontFamily.LexendSemiBold,
  },
  loginBtnTextDisabled: { color: '#F2F6FC' },

  dividerWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.grayDark },
  dividerText: {
    marginHorizontal: 14,
    color: Colors.grayDark,
    fontFamily: Fonts.fontFamily.LexendRegular,
    fontSize: Fonts.fontSize[14],
  },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 50 },
});


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logo: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: Fonts.fontSize[24],
    fontFamily: Fonts.fontFamily.LexendBold,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  titleBold: {
    fontSize: 18,
    fontFamily: Fonts.fontFamily.LexendBold,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
    gap: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#101010',
    fontFamily: Fonts.fontFamily.LexendRegular,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    fontWeight: 'bold',
    color: 'black',
  },
  forgotPassword: {
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 11,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
    color: Colors.main,
  },
  input: {
    fontFamily: Fonts.fontFamily.LexendRegular,
    flex: 1,
    color: Colors.black,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkboxText: {
    fontSize: 11,
    fontFamily: Fonts.fontFamily.LexendRegular,
  },
  loginButton: {
    backgroundColor: Colors.main,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Fonts.fontFamily.LexendSemiBold,
  },
  loginButtonTextDisabled: {
    color: Colors.black,
    fontSize: 16,
    fontFamily: Fonts.fontFamily.LexendSemiBold,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    color: '#666666',
  },
  registerLink: {
    color: Colors.main,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#666666',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 32,
  },
  socialButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  errorText: {
    color: Colors.red,
    fontSize: 12,
    fontFamily: Fonts.fontFamily.LexendRegular,
    position: 'relative',
    top: -1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoApp: {},
});
