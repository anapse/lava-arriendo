import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RentalsView } from './components/RentalsView';
import { WashersView } from './components/WashersView';
import { CustomersView } from './components/CustomersView';
import { PaymentsView } from './components/PaymentsView';
import { CalendarView } from './components/CalendarView';
import { DailyStatusView } from './components/DailyStatusView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { UsersAdminView } from './components/UsersAdminView';
import { RegisterRentalModal } from './components/RegisterRentalModal';
import { ReturnRentalModal } from './components/ReturnRentalModal';
import { EditRentalModal } from './components/EditRentalModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AlertsModal } from './components/AlertsModal';
import { LoginScreen } from './components/LoginScreen';

import {
  Home,
  FileText,
  Users,
  WashingMachine,
  CreditCard,
  UserCheck,
  TrendingUp,
  Settings
} from 'lucide-react';

import {
  Washer,
  Customer,
  Rental,
  Payment,
  Activity,
  NavigationTab,
  PaymentMethod
} from './types';

import {
  INITIAL_WASHERS,
  INITIAL_CUSTOMERS,
  INITIAL_RENTALS,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITIES,
  subscribeToWashers,
  subscribeToCustomers,
  subscribeToRentals,
  subscribeToPayments,
  subscribeToActivities,
  createRentalTransaction,
  returnWasherTransaction,
  saveWasher,
  deleteWasherDoc,
  saveCustomer,
  savePayment,
  seedInitialFirestoreData
} from './services/dataService';

import { initAuth, testConnection } from './firebase';

export default function App() {
  // Authentication State: Always require login upon entering the app
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string } | null>(null);

  // Navigation & Active Tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');

  // Application Data State
  const [washers, setWashers] = useState<Washer[]>(INITIAL_WASHERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [rentals, setRentals] = useState<Rental[]>(INITIAL_RENTALS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);

  // Selected entities & Modals
  const [isNewRentalOpen, setIsNewRentalOpen] = useState<boolean>(false);
  const [preselectedWasherId, setPreselectedWasherId] = useState<string>('');
  const [rentalToReturn, setRentalToReturn] = useState<Rental | null>(null);
  const [rentalToEdit, setRentalToEdit] = useState<Rental | null>(null);
  const [rentalForReceipt, setRentalForReceipt] = useState<Rental | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Firebase Realtime Initialization
  useEffect(() => {
    let unsubWashers: () => void;
    let unsubCustomers: () => void;
    let unsubRentals: () => void;
    let unsubPayments: () => void;
    let unsubActivities: () => void;

    async function setupFirebase() {
      try {
        await initAuth();
        await testConnection();
        await seedInitialFirestoreData();

        unsubWashers = subscribeToWashers((items) => {
          if (items && items.length > 0) setWashers(items);
        });

        unsubCustomers = subscribeToCustomers((items) => {
          if (items && items.length > 0) setCustomers(items);
        });

        unsubRentals = subscribeToRentals((items) => {
          if (items && items.length > 0) setRentals(items);
        });

        unsubPayments = subscribeToPayments((items) => {
          if (items && items.length > 0) setPayments(items);
        });

        unsubActivities = subscribeToActivities((items) => {
          if (items && items.length > 0) setActivities(items);
        });

        setFirebaseConnected(true);
      } catch (err) {
        console.warn('Firebase sync initialized with local state:', err);
      }
    }

    setupFirebase();

    return () => {
      if (unsubWashers) unsubWashers();
      if (unsubCustomers) unsubCustomers();
      if (unsubRentals) unsubRentals();
      if (unsubPayments) unsubPayments();
      if (unsubActivities) unsubActivities();
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lavarrienda_auth_user');
    sessionStorage.removeItem('lavarrienda_session_user');
    setCurrentUser(null);
  };

  // If user is not logged in, render owner login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // Handlers for Rentals
  const handleSaveRental = async (
    rental: Rental,
    advancePaymentDetails?: { amount: number; paymentMethod: PaymentMethod; reference?: string }
  ) => {
    setRentals((prev) => [rental, ...prev]);
    setWashers((prev) =>
      prev.map((w) => (w.id === rental.washerId ? { ...w, status: 'alquilada' } : w))
    );

    if (advancePaymentDetails && advancePaymentDetails.amount > 0) {
      const p: Payment = {
        id: 'P' + Math.floor(100 + Math.random() * 900),
        rentalId: rental.id,
        customerId: rental.customerId,
        customerName: rental.customerName,
        amount: advancePaymentDetails.amount,
        date: rental.startDate,
        time: rental.startTime,
        paymentMethod: advancePaymentDetails.paymentMethod,
        status: 'Pagado',
        referenceOrVoucher: advancePaymentDetails.reference,
        notes: `Adelanto en efectivo contrato #${rental.id}`,
      };
      setPayments((prev) => [p, ...prev]);
    }

    await createRentalTransaction(rental, advancePaymentDetails);
  };

  const handleConfirmReturn = async (
    rentalId: string,
    washerId: string,
    customerName: string,
    finalBalancePaid?: number,
    paymentMethod?: PaymentMethod,
    returnDate: string = new Date().toISOString().split('T')[0],
    actualDays: number = 1,
    skipRefund: boolean = false,
    refundAmount: number = 0
  ) => {
    const targetRental = rentals.find((r) => r.id === rentalId);
    const originalDays = targetRental ? targetRental.days : 1;
    const pricePerDay = targetRental ? targetRental.pricePerDay : 35000;
    const deliveryFee = targetRental ? targetRental.deliveryFee : 0;
    const isEarly = actualDays < originalDays;
    const proportionalTotal = (actualDays * pricePerDay) + deliveryFee;

    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? {
              ...r,
              status: 'finalizado',
              returnDate,
              days: actualDays,
              totalAmount: isEarly ? proportionalTotal : r.totalAmount,
              balanceDue: 0,
            }
          : r
      )
    );
    setWashers((prev) =>
      prev.map((w) => (w.id === washerId ? { ...w, status: 'disponible' } : w))
    );

    if (finalBalancePaid && finalBalancePaid > 0 && paymentMethod) {
      const p: Payment = {
        id: 'P' + Math.floor(100 + Math.random() * 900),
        rentalId,
        customerId: 'C-RET',
        customerName,
        amount: finalBalancePaid,
        date: returnDate,
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod,
        status: 'Pagado',
        referenceOrVoucher: `LIQ-${rentalId}`,
        notes: `Liquidación final lavadora #${washerId}`,
      };
      setPayments((prev) => [p, ...prev]);
    }

    if (refundAmount > 0 && !skipRefund) {
      const refundP: Payment = {
        id: 'P' + Math.floor(100 + Math.random() * 900),
        rentalId,
        customerId: 'C-REF',
        customerName,
        amount: -refundAmount,
        date: returnDate,
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod: paymentMethod || 'Efectivo',
        status: 'Pagado',
        referenceOrVoucher: `DEV-${rentalId}`,
        notes: `Devolución de dinero por días no usados (${rentalId})`,
      };
      setPayments((prev) => [refundP, ...prev]);
    }

    await returnWasherTransaction(
      rentalId,
      washerId,
      customerName,
      finalBalancePaid,
      paymentMethod,
      returnDate,
      actualDays,
      skipRefund,
      refundAmount,
      proportionalTotal,
      originalDays
    );
  };

  const handleSaveEditRental = async (updatedRental: Rental) => {
    setRentals((prev) => prev.map((r) => (r.id === updatedRental.id ? updatedRental : r)));
  };

  const handleCancelRental = async (rentalId: string, washerId: string) => {
    setRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: 'cancelado', balanceDue: 0 } : r))
    );
    setWashers((prev) =>
      prev.map((w) => (w.id === washerId ? { ...w, status: 'disponible' } : w))
    );
    setPayments((prev) =>
      prev.map((p) => (p.rentalId === rentalId ? { ...p, status: 'Anulado' } : p))
    );
  };

  // Handlers for Washers
  const handleSaveWasher = async (washer: Washer) => {
    setWashers((prev) => {
      const exists = prev.some((w) => w.id === washer.id);
      return exists ? prev.map((w) => (w.id === washer.id ? washer : w)) : [...prev, washer];
    });
    await saveWasher(washer);
  };

  const handleDeleteWasher = async (id: string) => {
    setWashers((prev) => prev.filter((w) => w.id !== id));
    await deleteWasherDoc(id);
  };

  // Handlers for Customers
  const handleSaveCustomer = async (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      return exists ? prev.map((c) => (c.id === customer.id ? customer : c)) : [...prev, customer];
    });
    await saveCustomer(customer);
  };

  // Handlers for Payments
  const handleSavePayment = async (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
    if (payment.rentalId) {
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id === payment.rentalId) {
            const adv = r.advancePayment + payment.amount;
            const bal = Math.max(0, r.totalAmount - adv);
            return { ...r, advancePayment: adv, balanceDue: bal, updatedAt: new Date().toISOString() };
          }
          return r;
        })
      );
    }
    await savePayment(payment);
  };

  const activeRentalsCount = rentals.filter(
    (r) => r.status !== 'finalizado' && r.status !== 'cancelado'
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col antialiased selection:bg-blue-600 selection:text-white pb-24 md:pb-0">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            washersCount={washers.length}
            activeRentalsCount={activeRentalsCount}
            firebaseConnected={firebaseConnected}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onOpenNewRental={() => {
              setPreselectedWasherId('');
              setIsNewRentalOpen(true);
            }}
            onOpenNewPayment={() => setActiveTab('pagos')}
            rentals={rentals}
            onOpenAlertsModal={() => setIsAlertsOpen(true)}
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigateTab={setActiveTab}
          />

          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeTab === 'inicio' && (
              <DashboardView
                washers={washers}
                customers={customers}
                rentals={rentals}
                payments={payments}
                activities={activities}
                onOpenNewRental={() => {
                  setPreselectedWasherId('');
                  setIsNewRentalOpen(true);
                }}
                onOpenNewPayment={() => setActiveTab('pagos')}
                onOpenNewCustomer={() => setActiveTab('clientes')}
                onOpenNewWasher={() => setActiveTab('lavadoras')}
                onOpenReturnModal={(r) => setRentalToReturn(r)}
                onSelectCustomer={(c) => {
                  setSelectedCustomer(c);
                  setActiveTab('clientes');
                }}
                onNavigateTab={setActiveTab}
                onSaveQuickRental={handleSaveRental}
              />
            )}

            {activeTab === 'lavadoras' && (
              <WashersView
                washers={washers}
                onSaveWasher={handleSaveWasher}
                onDeleteWasher={handleDeleteWasher}
                onStartRentalForWasher={(wid) => {
                  setPreselectedWasherId(wid);
                  setIsNewRentalOpen(true);
                }}
              />
            )}

            {activeTab === 'clientes' && (
              <CustomersView
                customers={customers}
                rentals={rentals}
                payments={payments}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
                onSaveCustomer={handleSaveCustomer}
                onStartRentalForCustomer={() => {
                  setIsNewRentalOpen(true);
                }}
              />
            )}

            {activeTab === 'alquileres' && (
              <RentalsView
                rentals={rentals}
                onOpenNewRental={() => {
                  setPreselectedWasherId('');
                  setIsNewRentalOpen(true);
                }}
                onOpenReturnModal={(r) => setRentalToReturn(r)}
                onOpenReceiptModal={(r) => setRentalForReceipt(r)}
                onOpenEditModal={(r) => setRentalToEdit(r)}
              />
            )}

            {activeTab === 'pagos' && (
              <PaymentsView
                payments={payments}
                rentals={rentals}
                customers={customers}
                onSavePayment={handleSavePayment}
                onOpenReceiptModalForPayment={() => {}}
              />
            )}

            {activeTab === 'calendario' && (
              <CalendarView
                rentals={rentals}
                onOpenReturnModal={(r) => setRentalToReturn(r)}
              />
            )}

            {activeTab === 'estado' && (
              <DailyStatusView
                washers={washers}
                customers={customers}
                rentals={rentals}
                payments={payments}
                onOpenReturnModal={(r) => setRentalToReturn(r)}
              />
            )}

            {activeTab === 'reportes' && (
              <ReportsView
                washers={washers}
                customers={customers}
                rentals={rentals}
                payments={payments}
              />
            )}

            {activeTab === 'usuarios' && (
              <UsersAdminView
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            )}

            {activeTab === 'configuracion' && (
              <SettingsView
                washers={washers}
                onSaveWasher={handleSaveWasher}
              />
            )}
          </main>
        </div>
      </div>

      {/* Native Mobile Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-40 shadow-lg text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'inicio' ? 'text-blue-600 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'clientes' ? 'text-blue-600 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Usuarios</span>
        </button>

        <button
          onClick={() => {
            setPreselectedWasherId('');
            setIsNewRentalOpen(true);
          }}
          className="flex flex-col items-center justify-center -mt-5 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
          title="Nuevo Alquiler"
        >
          <span className="text-2xl font-light leading-none">+</span>
        </button>

        <button
          onClick={() => setActiveTab('estado')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'estado' ? 'text-blue-600 font-extrabold' : 'text-slate-500'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Estadísticas</span>
        </button>

        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'pagos' ? 'text-blue-600 font-extrabold' : 'text-slate-500'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span>Pagos</span>
        </button>

        <button
          onClick={() => setActiveTab('configuracion')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg ${
            activeTab === 'configuracion' ? 'text-blue-600 font-extrabold' : 'text-slate-500'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Config</span>
        </button>
      </nav>

      {/* Global Modals for All Operations */}
      <RegisterRentalModal
        isOpen={isNewRentalOpen}
        onClose={() => setIsNewRentalOpen(false)}
        washers={washers}
        customers={customers}
        onSaveRental={handleSaveRental}
        preselectedWasherId={preselectedWasherId}
        onQuickAddCustomer={() => {
          setIsNewRentalOpen(false);
          setActiveTab('clientes');
        }}
      />

      <ReturnRentalModal
        rental={rentalToReturn}
        isOpen={Boolean(rentalToReturn)}
        onClose={() => setRentalToReturn(null)}
        onConfirmReturn={handleConfirmReturn}
      />

      <EditRentalModal
        rental={rentalToEdit}
        isOpen={Boolean(rentalToEdit)}
        onClose={() => setRentalToEdit(null)}
        onSaveEdit={handleSaveEditRental}
        onCancelRental={handleCancelRental}
      />

      <ReceiptModal
        rental={rentalForReceipt}
        isOpen={Boolean(rentalForReceipt)}
        onClose={() => setRentalForReceipt(null)}
      />

      <AlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        rentals={rentals}
        washers={washers}
        onOpenReturnModal={(r) => setRentalToReturn(r)}
      />
    </div>
  );
}
