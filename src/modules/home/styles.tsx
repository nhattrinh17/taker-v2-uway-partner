import { StyleSheet } from 'react-native';
import { Colors } from '../../assets/Colors';
import { Fonts } from '../../assets/Fonts';
import { scale } from '../../ultils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    marginLeft: scale(16),
    marginBottom: scale(8),
    marginTop: scale(8),
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    padding: scale(12),
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: scale(5),
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceIconContainer: {
    backgroundColor: '#e6f0ff',
    padding: scale(8),
    borderRadius: scale(40),
    marginRight: scale(10),
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: scale(14),
    fontWeight: '600',
    marginBottom: scale(4),
  },
  serviceLocation: {
    fontSize: scale(12),
    color: '#555',
    flexShrink: 1,
    flex: 1,
  },
  customerInfo: {
    fontSize: scale(12),
    color: '#555',
    marginTop: scale(2),
  },
  priceInfo: {
    fontSize: scale(12),
    color: '#2AA7FF',
    marginTop: scale(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scale(2),
  },
  timeContainer: {
    justifyContent: 'flex-start',
    flex: 1,
  },
  timeText: {
    fontSize: scale(12),
    color: '#555',
    marginLeft: 'auto',
  },
  clockWrapper: {
  marginLeft: 'auto',      // đẩy icon ra sát bên phải
  justifyContent: 'center',
  alignItems: 'center',
},
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: scale(10),
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: Colors.red,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    marginRight: scale(10),
  },
  rejectText: {
    color: Colors.red,
    fontSize: scale(12),
  },
  acceptButton: {
    backgroundColor: Colors.main,
    borderRadius: scale(8),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
  },
  acceptText: {
    color: '#fff',
    fontSize: scale(12),
  },
  footer: {
    padding: scale(16),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scale(14),
    color: '#555',
    textAlign: 'center',
    marginVertical: scale(20),
  },
});