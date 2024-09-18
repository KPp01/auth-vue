import { db } from '@/main';

export default {
  async saveOrder(order) {
    try {
      await db.collection('orders').add(order);
      console.log('Order saved successfully');
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }
};
