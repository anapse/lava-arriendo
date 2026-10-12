export type WasherStatus = 'disponible' | 'alquilada' | 'mantenimiento';

export interface Washer {
  id: string; // e.g. "01", "02"
  model: string; // e.g. "LG 12kg", "Samsung 10kg"
  brand: string; // "LG", "Samsung", "Daewoo", "Whirlpool", "Mabe"
  capacityKg: number; // e.g. 12, 10, 8, 15
  type: 'Carga frontal' | 'Carga superior';
  serialNumber?: string;
  status: WasherStatus;
  pricePerDay: number; // in COP (e.g. 35000)
  notes?: string;
  totalRentalsCount?: number;
  totalEarnings?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomerStatus = 'Activo' | 'Inactivo' | 'Moroso';

export interface Customer {
  id: string; // e.g. "C001"
  name: string;
  documentId: string; // Cédula de ciudadanía / DNI
  phone: string;
  address: string;
  referenceLocation?: string;
  status: CustomerStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type RentalStatus = 'en_curso' | 'entregado' | 'por_vencer' | 'vencido' | 'finalizado' | 'cancelado';

export interface Rental {
  id: string; // e.g. "A001"
  customerId: string;
  customerName: string;
  customerDoc: string;
  customerPhone: string;
  customerAddress: string;
  washerId: string;
  washerModel: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  days: number;
  pricePerDay: number; // in COP
  totalAmount: number; // in COP (days * pricePerDay + deliveryFee)
  advancePayment: number; // Adelanto pagado
  balanceDue: number; // Saldo pendiente
  deliveryType: 'En tienda / Local' | 'A domicilio';
  deliveryFee: number;
  status: RentalStatus;
  returnDate?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'Efectivo' | 'Nequi' | 'Daviplata' | 'Transferencia Bancaria' | 'Tarjeta';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Anulado';

export interface Payment {
  id: string; // e.g. "P001"
  rentalId?: string;
  customerId: string;
  customerName: string;
  amount: number; // in COP
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  referenceOrVoucher?: string;
  notes?: string;
  createdAt?: string;
}

export interface Activity {
  id: string;
  type: 'nuevo_alquiler' | 'pago_registrado' | 'devolucion' | 'nuevo_cliente' | 'mantenimiento' | 'usuario_admin';
  description: string;
  timestamp: string;
  relatedId?: string;
}

export interface UserAdmin {
  id: string;
  name: string;
  email: string;
  role: 'Super Administrador' | 'Administrador' | 'Operador';
  passwordHint?: string;
  lastLogin?: string;
  createdAt: string;
}

export type NavigationTab = 
  | 'inicio' 
  | 'lavadoras' 
  | 'clientes' 
  | 'alquileres' 
  | 'pagos' 
  | 'calendario' 
  | 'estado' 
  | 'reportes'
  | 'usuarios'
  | 'configuracion';
