/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { SidebarLayout } from './components/SidebarLayout';
import { TransactionModal } from './components/TransactionModal';
import { PaisaProvider, usePaisa } from './context/PaisaContext';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BudgetPlannerPage } from './pages/BudgetPlannerPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { LandingPage } from './pages/LandingPage';
import { PaisaBotPage } from './pages/PaisaBotPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { TransactionsPage } from './pages/TransactionsPage';

function PaisaAppShell() {
  const { state, activePage, quickAddOpen, setQuickAddOpen, addTransaction } = usePaisa();

  if (!state.profile.isEntered) {
    return <LandingPage />;
  }

  return (
    <SidebarLayout>
      {activePage === 'dashboard' && <DashboardPage />}
      {activePage === 'transactions' && <TransactionsPage />}
      {activePage === 'budgets' && <BudgetPlannerPage />}
      {activePage === 'savings' && <SavingsGoalsPage />}
      {activePage === 'investments' && <InvestmentsPage />}
      {activePage === 'analytics' && <AnalyticsPage />}
      {activePage === 'subscriptions' && <SubscriptionsPage />}
      {activePage === 'paisabot' && <PaisaBotPage />}
      {activePage === 'settings' && <SettingsPage />}

      <TransactionModal
        open={quickAddOpen}
        defaultType="expense"
        onClose={() => setQuickAddOpen(false)}
        onSubmit={(data) => addTransaction(data)}
      />
    </SidebarLayout>
  );
}

export default function App() {
  return (
    <PaisaProvider>
      <PaisaAppShell />
    </PaisaProvider>
  );
}
