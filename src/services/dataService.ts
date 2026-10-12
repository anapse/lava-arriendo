import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Washer, Customer, Rental, Payment, Activity } from '../types';
export { testConnection } from '../firebase';

// Default initial dataset in Colombian Pesos (COP)
export const INITIAL_WASHERS: Washer[] = [
  { id: '01', model: 'LG 12kg (01)', brand: 'LG', capacityKg: 12, type: 'Carga frontal', serialNumber: 'LG-12-001', status: 'alquilada', pricePerDay: 35000, totalRentalsCount: 14, totalEarnings: 490000 },
  { id: '02', model: 'Samsung 10kg (02)', brand: 'Samsung', capacityKg: 10, type: 'Carga frontal', serialNumber: 'SM-10-002', status: 'disponible', pricePerDay: 30000, totalRentalsCount: 18, totalEarnings: 540000 },
  { id: '03', model: 'Daewoo 8kg (03)', brand: 'Daewoo', capacityKg: 8, type: 'Carga superior', serialNumber: 'DW-08-003', status: 'alquilada', pricePerDay: 25000, totalRentalsCount: 22, totalEarnings: 550000 },
  { id: '04', model: 'LG 15kg (04)', brand: 'LG', capacityKg: 15, type: 'Carga frontal', serialNumber: 'LG-15-004', status: 'disponible', pricePerDay: 40000, totalRentalsCount: 11, totalEarnings: 440000 },
  { id: '05', model: 'Samsung 12kg (05)', brand: 'Samsung', capacityKg: 12, type: 'Carga frontal', serialNumber: 'SM-12-005', status: 'disponible', pricePerDay: 35000, totalRentalsCount: 16, totalEarnings: 560000 },
  { id: '06', model: 'Daewoo 10kg (06)', brand: 'Daewoo', capacityKg: 10, type: 'Carga superior', serialNumber: 'DW-10-006', status: 'alquilada', pricePerDay: 30000, totalRentalsCount: 19, totalEarnings: 570000 },
  { id: '07', model: 'LG 8kg (07)', brand: 'LG', capacityKg: 8, type: 'Carga frontal', serialNumber: 'LG-08-007', status: 'disponible', pricePerDay: 25000, totalRentalsCount: 25, totalEarnings: 625000 },
  { id: '08', model: 'Samsung 15kg (08)', brand: 'Samsung', capacityKg: 15, type: 'Carga frontal', serialNumber: 'SM-15-008', status: 'disponible', pricePerDay: 40000, totalRentalsCount: 9, totalEarnings: 360000 },
  { id: '09', model: 'Daewoo 12kg (09)', brand: 'Daewoo', capacityKg: 12, type: 'Carga superior', serialNumber: 'DW-12-009', status: 'alquilada', pricePerDay: 35000, totalRentalsCount: 15, totalEarnings: 525000 },
  { id: '10', model: 'LG 10kg (10)', brand: 'LG', capacityKg: 10, type: 'Carga frontal', serialNumber: 'LG-10-010', status: 'disponible', pricePerDay: 30000, totalRentalsCount: 21, totalEarnings: 630000 },
  { id: '11', model: 'Samsung 8kg (11)', brand: 'Samsung', capacityKg: 8, type: 'Carga superior', serialNumber: 'SM-08-011', status: 'disponible', pricePerDay: 25000, totalRentalsCount: 17, totalEarnings: 425000 },
  { id: '12', model: 'Daewoo 15kg (12)', brand: 'Daewoo', capacityKg: 15, type: 'Carga frontal', serialNumber: 'DW-15-012', status: 'alquilada', pricePerDay: 40000, totalRentalsCount: 13, totalEarnings: 520000 },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'Juan Pérez', documentId: '1023456789', phone: '311 987 6543', address: 'Carrera 15 # 45-20, Apto 301', referenceLocation: 'Frente al parque Simón Bolívar', status: 'Activo' },
  { id: 'C002', name: 'María López', documentId: '52876543', phone: '315 912 3456', address: 'Calle 72 # 11-23', referenceLocation: 'Cerca a la estación de TransMilenio', status: 'Activo' },
  { id: 'C003', name: 'Carlos Gómez', documentId: '79112233', phone: '310 998 8776', address: 'Av. Boyacá # 68-15', referenceLocation: 'Casa de dos pisos reja blanca', status: 'Activo' },
  { id: 'C004', name: 'Ana Torres', documentId: '1032556677', phone: '312 900 1122', address: 'Transversal 28 # 53-40', referenceLocation: 'Edificio Los Olivos, Apto 204', status: 'Activo' },
  { id: 'C005', name: 'Luis Ramírez', documentId: '80443322', phone: '317 955 6677', address: 'Calle 100 # 19-61', referenceLocation: 'Diagonal al supermercado Éxito', status: 'Activo' },
  { id: 'C006', name: 'Sofía Castillo', documentId: '53778899', phone: '318 944 5566', address: 'Calle 127 # 49-10', referenceLocation: 'Conjunto Residencial El Sauce', status: 'Activo' },
  { id: 'C007', name: 'Pedro Díaz', documentId: '19667788', phone: '320 933 2211', address: 'Diagonal 45 # 14-80', referenceLocation: 'Barrio Teusaquillo', status: 'Activo' },
  { id: 'C008', name: 'Valeria Ruiz', documentId: '1015990011', phone: '314 922 3344', address: 'Carrera 7 # 140-12', referenceLocation: 'Piso 4, timbre 402', status: 'Activo' },
];

export const INITIAL_RENTALS: Rental[] = [
  {
    id: 'A001',
    customerId: 'C001',
    customerName: 'Juan Pérez',
    customerDoc: '1023456789',
    customerPhone: '311 987 6543',
    customerAddress: 'Carrera 15 # 45-20, Apto 301',
    washerId: '01',
    washerModel: 'LG 12kg (01)',
    startDate: '2026-10-10',
    startTime: '09:00',
    endDate: '2026-10-12',
    endTime: '18:00',
    days: 2,
    pricePerDay: 35000,
    totalAmount: 70000,
    advancePayment: 70000,
    balanceDue: 0,
    deliveryType: 'En tienda / Local',
    deliveryFee: 0,
    status: 'en_curso',
    observations: 'Cliente habitual, todo en orden',
  },
  {
    id: 'A002',
    customerId: 'C003',
    customerName: 'Carlos Gómez',
    customerDoc: '79112233',
    customerPhone: '310 998 8776',
    customerAddress: 'Av. Boyacá # 68-15',
    washerId: '03',
    washerModel: 'Daewoo 8kg (03)',
    startDate: '2026-10-10',
    startTime: '10:30',
    endDate: '2026-10-11',
    endTime: '10:30',
    days: 1,
    pricePerDay: 25000,
    totalAmount: 25000,
    advancePayment: 25000,
    balanceDue: 0,
    deliveryType: 'En tienda / Local',
    deliveryFee: 0,
    status: 'entregado',
    observations: 'Entrega puntual en mostrador',
  },
  {
    id: 'A003',
    customerId: 'C004',
    customerName: 'Ana Torres',
    customerDoc: '1032556677',
    customerPhone: '312 900 1122',
    customerAddress: 'Transversal 28 # 53-40',
    washerId: '05',
    washerModel: 'Samsung 12kg (05)',
    startDate: '2026-10-09',
    startTime: '11:00',
    endDate: '2026-10-12',
    endTime: '11:00',
    days: 3,
    pricePerDay: 35000,
    totalAmount: 105000,
    advancePayment: 50000,
    balanceDue: 55000,
    deliveryType: 'A domicilio',
    deliveryFee: 0,
    status: 'en_curso',
    observations: 'Paga saldo restante contra entrega',
  },
  {
    id: 'A004',
    customerId: 'C005',
    customerName: 'Luis Ramírez',
    customerDoc: '80443322',
    customerPhone: '317 955 6677',
    customerAddress: 'Calle 100 # 19-61',
    washerId: '06',
    washerModel: 'Daewoo 10kg (06)',
    startDate: '2026-10-08',
    startTime: '09:00',
    endDate: '2026-10-11',
    endTime: '12:00',
    days: 3,
    pricePerDay: 30000,
    totalAmount: 90000,
    advancePayment: 90000,
    balanceDue: 0,
    deliveryType: 'En tienda / Local',
    deliveryFee: 0,
    status: 'por_vencer',
    observations: 'Vence hoy a mediodía',
  },
  {
    id: 'A005',
    customerId: 'C006',
    customerName: 'Sofía Castillo',
    customerDoc: '53778899',
    customerPhone: '318 944 5566',
    customerAddress: 'Calle 127 # 49-10',
    washerId: '07',
    washerModel: 'LG 8kg (07)',
    startDate: '2026-10-09',
    startTime: '14:00',
    endDate: '2026-10-12',
    endTime: '14:00',
    days: 3,
    pricePerDay: 25000,
    totalAmount: 75000,
    advancePayment: 75000,
    balanceDue: 0,
    deliveryType: 'A domicilio',
    deliveryFee: 0,
    status: 'en_curso',
  },
  {
    id: 'A006',
    customerId: 'C007',
    customerName: 'Pedro Díaz',
    customerDoc: '19667788',
    customerPhone: '320 933 2211',
    customerAddress: 'Diagonal 45 # 14-80',
    washerId: '08',
    washerModel: 'Samsung 15kg (08)',
    startDate: '2026-10-10',
    startTime: '16:00',
    endDate: '2026-10-13',
    endTime: '16:00',
    days: 3,
    pricePerDay: 40000,
    totalAmount: 120000,
    advancePayment: 60000,
    balanceDue: 60000,
    deliveryType: 'A domicilio',
    deliveryFee: 0,
    status: 'en_curso',
  },
  {
    id: 'A007',
    customerId: 'C008',
    customerName: 'Valeria Ruiz',
    customerDoc: '1015990011',
    customerPhone: '314 922 3344',
    customerAddress: 'Carrera 7 # 140-12',
    washerId: '09',
    washerModel: 'Daewoo 12kg (09)',
    startDate: '2026-10-11',
    startTime: '08:30',
    endDate: '2026-10-14',
    endTime: '08:30',
    days: 3,
    pricePerDay: 35000,
    totalAmount: 105000,
    advancePayment: 50000,
    balanceDue: 55000,
    deliveryType: 'En tienda / Local',
    deliveryFee: 0,
    status: 'en_curso',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { id: 'P001', rentalId: 'A001', customerId: 'C001', customerName: 'Juan Pérez', amount: 70000, date: '2026-10-10', time: '09:05', paymentMethod: 'Nequi', status: 'Pagado', referenceOrVoucher: 'NQ-88231' },
  { id: 'P002', rentalId: 'A002', customerId: 'C003', customerName: 'Carlos Gómez', amount: 25000, date: '2026-10-10', time: '10:35', paymentMethod: 'Daviplata', status: 'Pagado', referenceOrVoucher: 'DP-99104' },
  { id: 'P003', rentalId: 'A003', customerId: 'C004', customerName: 'Ana Torres', amount: 50000, date: '2026-10-09', time: '11:15', paymentMethod: 'Efectivo', status: 'Pagado', referenceOrVoucher: 'RC-1049' },
  { id: 'P004', rentalId: 'A004', customerId: 'C005', customerName: 'Luis Ramírez', amount: 90000, date: '2026-10-08', time: '09:12', paymentMethod: 'Transferencia Bancaria', status: 'Pagado', referenceOrVoucher: 'BAN-4912' },
  { id: 'P005', rentalId: 'A005', customerId: 'C006', customerName: 'Sofía Castillo', amount: 75000, date: '2026-10-09', time: '14:10', paymentMethod: 'Nequi', status: 'Pagado', referenceOrVoucher: 'NQ-11029' },
  { id: 'P006', rentalId: 'A006', customerId: 'C007', customerName: 'Pedro Díaz', amount: 60000, date: '2026-10-10', time: '16:15', paymentMethod: 'Efectivo', status: 'Pagado', referenceOrVoucher: 'RC-1050' },
  { id: 'P007', rentalId: 'A007', customerId: 'C008', customerName: 'Valeria Ruiz', amount: 50000, date: '2026-10-11', time: '08:45', paymentMethod: 'Daviplata', status: 'Pagado', referenceOrVoucher: 'DP-33102' },
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: 'ACT-01', type: 'nuevo_alquiler', description: 'Nuevo alquiler - Juan Pérez (A001) - LG 12kg', timestamp: '10/10/2026 09:00', relatedId: 'A001' },
  { id: 'ACT-02', type: 'pago_registrado', description: 'Pago registrado por Nequi - $ 70.000 (P001)', timestamp: '10/10/2026 09:05', relatedId: 'P001' },
  { id: 'ACT-03', type: 'nuevo_cliente', description: 'Nuevo cliente registrado - Ana Torres (C004)', timestamp: '09/10/2026 10:45', relatedId: 'C004' },
  { id: 'ACT-04', type: 'devolucion', description: 'Devolución de lavadora Samsung 10kg (02) - C002', timestamp: '09/10/2026 17:30', relatedId: '02' },
  { id: 'ACT-05', type: 'nuevo_alquiler', description: 'Nuevo alquiler - Valeria Ruiz (A007) - Daewoo 12kg', timestamp: '11/10/2026 08:30', relatedId: 'A007' },
];

/**
 * Seed initial data to Firestore if collections are empty
 */
export async function seedInitialFirestoreData(): Promise<void> {
  try {
    const washersSnap = await getDocs(collection(db, 'washers'));
    if (washersSnap.empty) {
      console.log('Seeding initial washers to Firestore...');
      for (const w of INITIAL_WASHERS) {
        await setDoc(doc(db, 'washers', w.id), w);
      }
    }

    const customersSnap = await getDocs(collection(db, 'customers'));
    if (customersSnap.empty) {
      console.log('Seeding initial customers to Firestore...');
      for (const c of INITIAL_CUSTOMERS) {
        await setDoc(doc(db, 'customers', c.id), c);
      }
    }

    const rentalsSnap = await getDocs(collection(db, 'rentals'));
    if (rentalsSnap.empty) {
      console.log('Seeding initial rentals to Firestore...');
      for (const r of INITIAL_RENTALS) {
        await setDoc(doc(db, 'rentals', r.id), r);
      }
    }

    const paymentsSnap = await getDocs(collection(db, 'payments'));
    if (paymentsSnap.empty) {
      console.log('Seeding initial payments to Firestore...');
      for (const p of INITIAL_PAYMENTS) {
        await setDoc(doc(db, 'payments', p.id), p);
      }
    }

    const activitiesSnap = await getDocs(collection(db, 'activities'));
    if (activitiesSnap.empty) {
      console.log('Seeding initial activities to Firestore...');
      for (const a of INITIAL_ACTIVITIES) {
        await setDoc(doc(db, 'activities', a.id), a);
      }
    }
  } catch (error) {
    console.warn('Seed operation error (will continue with local fallback):', error);
  }
}

/**
 * Listeners for real-time Firestore collections with error handlers
 */
export function subscribeToWashers(callback: (washers: Washer[]) => void) {
  const colRef = collection(db, 'washers');
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Washer));
      callback(items);
    } else {
      callback(INITIAL_WASHERS);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'washers');
  });
}

export function subscribeToCustomers(callback: (customers: Customer[]) => void) {
  const colRef = collection(db, 'customers');
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Customer));
      callback(items);
    } else {
      callback(INITIAL_CUSTOMERS);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'customers');
  });
}

export function subscribeToRentals(callback: (rentals: Rental[]) => void) {
  const colRef = collection(db, 'rentals');
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Rental));
      callback(items);
    } else {
      callback(INITIAL_RENTALS);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'rentals');
  });
}

export function subscribeToPayments(callback: (payments: Payment[]) => void) {
  const colRef = collection(db, 'payments');
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Payment));
      callback(items);
    } else {
      callback(INITIAL_PAYMENTS);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  });
}

export function subscribeToActivities(callback: (activities: Activity[]) => void) {
  const colRef = collection(db, 'activities');
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Activity));
      callback(items);
    } else {
      callback(INITIAL_ACTIVITIES);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'activities');
  });
}

/**
 * Register a new rental with automatic washer lock and optional advance payment
 */
export async function createRentalTransaction(
  rental: Rental,
  paymentDetails?: { amount: number; paymentMethod: Payment['paymentMethod']; reference?: string }
): Promise<void> {
  const rentalRef = doc(db, 'rentals', rental.id);
  const washerRef = doc(db, 'washers', rental.washerId);

  try {
    // 1. Create rental document
    await setDoc(rentalRef, rental);

    // 2. Mark washer as alquilada
    await updateDoc(washerRef, {
      status: 'alquilada',
      updatedAt: new Date().toISOString(),
    });

    // 3. Register advance payment if greater than 0
    if (paymentDetails && paymentDetails.amount > 0) {
      const paymentId = 'P' + Math.floor(1000 + Math.random() * 9000);
      const now = new Date();
      const payment: Payment = {
        id: paymentId,
        rentalId: rental.id,
        customerId: rental.customerId,
        customerName: rental.customerName,
        amount: paymentDetails.amount,
        date: rental.startDate,
        time: rental.startTime || now.toTimeString().slice(0, 5),
        paymentMethod: paymentDetails.paymentMethod,
        status: 'Pagado',
        referenceOrVoucher: paymentDetails.reference || `REC-${rental.id}`,
        notes: `Adelanto de alquiler #${rental.id}`,
        createdAt: now.toISOString(),
      };
      await setDoc(doc(db, 'payments', paymentId), payment);
    }

    // 4. Log activity
    const actId = 'ACT-' + Date.now();
    const activity: Activity = {
      id: actId,
      type: 'nuevo_alquiler',
      description: `Nuevo alquiler - ${rental.customerName} (${rental.id}) - Lavadora ${rental.washerModel}`,
      timestamp: new Date().toLocaleString('es-CO'),
      relatedId: rental.id,
    };
    await setDoc(doc(db, 'activities', actId), activity);

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rentals/${rental.id}`);
  }
}

/**
 * Register a return: frees the washer back to "disponible", marks rental as finalizado
 */
export async function returnWasherTransaction(
  rentalId: string,
  washerId: string,
  customerName: string,
  finalBalancePaid?: number,
  paymentMethod?: Payment['paymentMethod'],
  returnDate: string = new Date().toISOString().split('T')[0],
  actualDays: number = 1,
  skipRefund: boolean = false,
  refundAmount: number = 0,
  proportionalTotal: number = 0,
  originalDays: number = 1
): Promise<void> {
  const rentalRef = doc(db, 'rentals', rentalId);
  const washerRef = doc(db, 'washers', washerId);
  const now = new Date();

  try {
    const isEarly = actualDays < originalDays;

    const updatePayload: any = {
      status: 'finalizado',
      returnDate: returnDate,
      days: actualDays,
      balanceDue: 0,
      updatedAt: now.toISOString(),
    };
    if (isEarly) {
      updatePayload.totalAmount = proportionalTotal;
    }

    // 1. Complete rental
    await updateDoc(rentalRef, updatePayload);

    // 2. Return washer to disponible
    await updateDoc(washerRef, {
      status: 'disponible',
      updatedAt: now.toISOString(),
    });

    // 3. If there was a pending balance settled at return
    if (finalBalancePaid && finalBalancePaid > 0 && paymentMethod) {
      const paymentId = 'P' + Math.floor(1000 + Math.random() * 9000);
      const payment: Payment = {
        id: paymentId,
        rentalId: rentalId,
        customerId: 'C-RET',
        customerName: customerName,
        amount: finalBalancePaid,
        date: returnDate,
        time: now.toTimeString().slice(0, 5),
        paymentMethod: paymentMethod,
        status: 'Pagado',
        referenceOrVoucher: `LIQ-${rentalId}`,
        notes: `Liquidación final al devolver lavadora #${washerId}`,
        createdAt: now.toISOString(),
      };
      await setDoc(doc(db, 'payments', paymentId), payment);
    }

    // 4. If there is a refund and skipRefund is false
    if (refundAmount > 0 && !skipRefund) {
      const refundPaymentId = 'P' + Math.floor(1000 + Math.random() * 9000);
      const refundPayment: Payment = {
        id: refundPaymentId,
        rentalId: rentalId,
        customerId: 'C-REF',
        customerName: customerName,
        amount: -refundAmount,
        date: returnDate,
        time: now.toTimeString().slice(0, 5),
        paymentMethod: paymentMethod || 'Efectivo',
        status: 'Pagado',
        referenceOrVoucher: `DEV-${rentalId}`,
        notes: `Devolución de dinero por días no usados (${rentalId})`,
        createdAt: now.toISOString(),
      };
      await setDoc(doc(db, 'payments', refundPaymentId), refundPayment);
    }

    // 5. Log activity
    const actId = 'ACT-' + Date.now();
    const activity: Activity = {
      id: actId,
      type: 'devolucion',
      description: `Devolución completada - Lavadora #${washerId} recibida de ${customerName} (${actualDays} días)${skipRefund ? ' [Sin reembolso]' : refundAmount > 0 ? ` [Reembolso: $${refundAmount}]` : ''}`,
      timestamp: now.toLocaleString('es-CO'),
      relatedId: rentalId,
    };
    await setDoc(doc(db, 'activities', actId), activity);

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rentals/${rentalId}`);
  }
}

/**
 * Washer CRUD helpers
 */
export async function saveWasher(washer: Washer): Promise<void> {
  try {
    await setDoc(doc(db, 'washers', washer.id), washer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `washers/${washer.id}`);
  }
}

export async function deleteWasherDoc(washerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'washers', washerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `washers/${washerId}`);
  }
}

/**
 * Customer CRUD helpers
 */
export async function saveCustomer(customer: Customer): Promise<void> {
  try {
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customers/${customer.id}`);
  }
}

/**
 * Payment CRUD helpers
 */
export async function savePayment(payment: Payment): Promise<void> {
  try {
    await setDoc(doc(db, 'payments', payment.id), payment);
    
    // Log payment activity
    const actId = 'ACT-' + Date.now();
    const activity: Activity = {
      id: actId,
      type: 'pago_registrado',
      description: `Pago registrado: $ ${payment.amount.toLocaleString('es-CO')} (${payment.paymentMethod}) de ${payment.customerName}`,
      timestamp: new Date().toLocaleString('es-CO'),
      relatedId: payment.id,
    };
    await setDoc(doc(db, 'activities', actId), activity);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `payments/${payment.id}`);
  }
}
