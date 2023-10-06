import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HomeScreen } from "../home/pages/HomeScreen";
import { LoginScreen } from "../auth/pages/LoginScreen";
import { RegisterScreen } from "../auth/pages/RegisterScreen";
import { ProductsScreen } from '../home/pages/products/ProductsScreen';
import { ClientsScreen } from '../home/pages/clients/ClientsScreen';
import { SalesScreen } from '../home/pages/sales/SalesScreen';
import { ExpensesScreen } from '../home/pages/expenses/ExpensesScreen';
import { ArqueoScreen } from '../home/pages/arqueo/ArqueoScreen';
import { ComandasScreen } from '../home/pages/comandas/ComandasScreen';
import { UsersScreen } from '../home/pages/UsersScreen';
import { NavbarMenu } from '../home/components/NavbarMenu';
import { Error404Screen } from '../Error404Screen';
import { Welcome } from '../home/components/Welcome';
import { Footer } from '../home/components/Footer';

export const AppRouter = () => {
  return (
    <>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isNavbarVisible = location.pathname !== '/error404';
  const isFooterVisible = location.pathname !== '/error404';

  return (
    <>
      {isNavbarVisible && <NavbarMenu />}
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<HomeScreen />}>
          <Route path="/home/products" element={<ProductsScreen />} />
          <Route path="/home/clients" element={<ClientsScreen />} />
          <Route path="/home/sales" element={<SalesScreen />} />
          <Route path="/home/expenses" element={<ExpensesScreen />} />
          <Route path="/home/arqueo" element={<ArqueoScreen />} />
          <Route path="/home/comandas" element={<ComandasScreen />} />
          <Route path="/home/users" element={<UsersScreen />} />
        </Route>
        <Route path="/error404" element={<Error404Screen />} />
        <Route path="/*" element={<Error404Screen />} />
      </Routes>
      {isFooterVisible && <Footer />}
    </>
  );
}; 