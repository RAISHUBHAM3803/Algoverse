import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import AppRoutes from "./routes/AppRoutes";
import { loadUser } from "./features/auth/authSlice";
import { getToken } from "./utils/tokenStorage";
import { ThemeProvider } from "./context/ThemeContext";
import ScrollToTop from "./components/common/ScrollToTop";

const AppInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (getToken()) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return <AppRoutes />;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppInit />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-slate-800 dark:text-slate-100 bg-white text-slate-900 border border-slate-200 dark:border-slate-700 shadow-glass',
              style: {
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",  // Emerald 500
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444", // Red 500
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
