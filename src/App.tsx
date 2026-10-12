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
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { RegisterRentalModal } from './components/RegisterRentalModal';
import { ReturnRentalModal } from './components/ReturnRentalModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AlertsModal } from './components/AlertsModal';

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
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<NavigationTab>('inicio');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

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
        // Seed initial data if collections empty
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

  // Handlers for Rentals
  const handleSaveRental = async (
    rental: Rental,
    advancePaymentDetails?: { amount: number; paymentMethod: PaymentMethod; reference?: string }
  ) => {
    // 1. Optimistic local update
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
        notes: `Adelanto contrato #${rental.id}`,
      };
      setPayments((prev) => [p, ...prev]);
    }

    // 2. Cloud Firestore sync
    await createRentalTransaction(rental, advancePaymentDetails);
  };

  const handleConfirmReturn = async (
    rentalId: string,
    washerId: string,
    customerName: string,
    finalBalancePaid?: number,
    paymentMethod?: PaymentMethod
  ) => {
    // 1. Optimistic local update
    const returnDate = new Date().toISOString().split('T')[0];
    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId ? { ...r, status: 'finalizado', returnDate, balanceDue: 0 } : r
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

    // 2. Cloud Firestore sync
    await returnWasherTransaction(
      rentalId,
      washerId,
      customerName,
      finalBalancePaid,
      paymentMethod
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
    await savePayment(payment);
  };

  const activeRentalsCount = rentals.filter(
    (r) => r.status !== 'finalizado' && r.status !== 'cancelado'
  ).length;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar (hidden on mobile simulator if wanted, or persistent) */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            washersCount={washers.length}
            activeRentalsCount={activeRentalsCount}
            firebaseConnected={firebaseConnected}
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
            viewMode={viewMode}
            setViewMode={setViewMode}
            rentals={rentals}
            onOpenAlertsModal={() => setIsAlertsOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* If Mobile Simulator view is selected */}
            {viewMode === 'mobile' ? (
              <MobileAppSimulator
                washers={washers}
                customers={customers}
                rentals={rentals}
                payments={payments}
                activities={activities}
                onOpenNewRental={() => {
                  setPreselectedWasherId('');
                  setIsNewRentalOpen(true);
                }}
                onOpenReturnModal={(r) => setRentalToReturn(r)}
                onSelectCustomer={(c) => setSelectedCustomer(c)}
                onOpenNewCustomer={() => setActiveTab('clientes')}
                onOpenNewPayment={() => setActiveTab('pagos')}
              />
            ) : (
              <>
                {/* Desktop Tab Routing */}
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
                    onStartRentalForCustomer={(cid) => {
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

                {activeTab === 'configuracion' && <SettingsView />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
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
