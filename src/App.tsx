import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./layout";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import RegisterDevice from "./pages/RegisterDevice";
import Login from "./pages/Login";
import Loading from "./Laoding";
import PlaceholderEditor from "./pages/Placeholder";
import ContentEditor from "./pages/Image";
import CricketPage from "./pages/Cricket";

// Lazy load components
const Devices = lazy(() => import("./pages/Devices"));
const DeviceGroup = lazy(() => import("./pages/DeviceGroups"));
const Ads = lazy(() => import("./pages/Ads"));
const Calendar = lazy(() => import("./pages/Schedule/schedule"));
const Clients = lazy(() => import("./pages/clients"));
const AddToSchedule = lazy(() => import("./pages/AddToSchedule"));
const AdPage = lazy(() => import("./pages/AdPage"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const NewCampaignPage = lazy(() => import("./pages/Campaigns/new"));
const EditCampaignPage = lazy(() => import("./pages/Campaigns/edit"));
const CampaignInteractions = lazy(() => import("./pages/CampaignInteractions"));

// Loading Fallback Component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-device" element={<RegisterDevice />} />

        <Route element={<Layout />}>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />

            {/* Wrap each lazy-loaded route inside Suspense */}
            <Route
              path="/ads"
              element={
                <Suspense fallback={<Loading />}>
                  <Ads />
                </Suspense>
              }
            />
            <Route
              path="/ads/:ad_id"
              element={
                <Suspense fallback={<Loading />}>
                  <AdPage edit={false} />
                </Suspense>
              }
            />
            <Route
              path="/ads/:ad_id/edit"
              element={
                <Suspense fallback={<Loading />}>
                  <AdPage edit={true} />
                </Suspense>
              }
            />
            <Route
              path="/ads/clients"
              element={
                <Suspense fallback={<Loading />}>
                  <Clients />
                </Suspense>
              }
            />
            <Route
              path="/schedule"
              element={
                <Suspense fallback={<Loading />}>
                  <Schedule />
                </Suspense>
              }
            />
            <Route
              path="/schedule/calendar"
              element={
                <Suspense fallback={<Loading />}>
                  <Calendar />
                </Suspense>
              }
            />
             <Route
              path="/schedule/placeholder"
              element={
                <Suspense fallback={<Loading />}>
                  <PlaceholderEditor />
                </Suspense>
              }
            />
            <Route
              path="/schedule/add"
              element={
                <Suspense fallback={<Loading />}>
                  <AddToSchedule />
                </Suspense>
              }
            />
            <Route
              path="/devices"
              element={
                <Suspense fallback={<Loading />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="/devices/:device_id"
              element={
                <Suspense fallback={<Loading />}>
                  <Devices />
                </Suspense>
              }
            />
            <Route
              path="/devices/groups"
              element={
                <Suspense fallback={<Loading />}>
                  <DeviceGroup />
                </Suspense>
              }
            />
              <Route
              path="/devices/cricket"
              element={
                <Suspense fallback={<Loading />}>
                  <CricketPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns"
              element={
                <Suspense fallback={<Loading />}>
                  <Campaigns />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/new"
              element={
                <Suspense fallback={<Loading />}>
                  <NewCampaignPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/edit/:campaign_id"
              element={
                <Suspense fallback={<Loading />}>
                  <EditCampaignPage />
                </Suspense>
              }
            />
            <Route
              path="/campaigns/interactions"
              element={
                <Suspense fallback={<Loading />}>
                  <CampaignInteractions />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
