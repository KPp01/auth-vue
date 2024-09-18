export function validateOrder(order) {
  const errors = [];

  if (!order.orderDetails.name) {
    errors.push('Nazwa zlecenia jest wymagana');
  }

  if (!order.location || !order.location.address || order.location.address === '') {
    errors.push('Adres zlecenia jest wymagany');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
