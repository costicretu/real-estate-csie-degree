import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateRouteAgent from "./components/PrivateRouteAgent";
import ForgotPassword from "./pages/ForgotPassword";
import Announces from "./pages/Announces";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Listing from "./pages/Listing";
import Category from "./pages/Category";
import PrivateRoute from "./components/PrivateRoute";
import SignUpAgent from "./pages/SignUpAgent";
import ProfileAgent from "./pages/ProfileAgent";
import Property from "./pages/Property";
import Offers from "./pages/Offers";
import PrivateRouteAdmin from "./components/PrivateRouteAdmin";

function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-up-agent" element={<PrivateRouteAdmin />}>
            <Route path="/sign-up-agent" element={<SignUpAgent />} />
          </Route>
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/profile-agent" element={<PrivateRouteAgent />}>
            <Route path="/profile-agent" element={<ProfileAgent />} />
          </Route>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/announces" element={<Announces />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/property/:propertyName" element={<Property />} />
          <Route path="/category/:categoryName/:listingId" element={<Listing />} />
          <Route path="/create-listing" element={<PrivateRouteAgent />}>
            <Route path="/create-listing" element={<CreateListing />} />
          </Route>
          <Route path="/edit-listing" element={<PrivateRouteAgent />}>
            <Route path="/edit-listing/:listingId" element={<EditListing />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;