import Layout from "./layout"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Devices from "./pages/Devices"
import DeviceGroup from "./pages/DeviceGroups"
import Ads from "./pages/Ads"
import Calendar from "./pages/Schedule/schedule"
import Clients from "./pages/clients"
import AddToSchedule from "./pages/AddToSchedule"
import Dashboard from "./pages/Dashboard"
import AdPage from "./pages/AdPage"
import Schedule from "./pages/Schedule"
import Login from "./pages/Login"
import PrivateRoute from "./routes/PrivateRoute"
import Campaigns from "./pages/Campaigns"
import NewCampaignPage from "./pages/Campaigns/new"
import EditCampaignPage from "./pages/Campaigns/edit"
import CampaignInteractions from "./pages/CampaignInteractions"
import RegisterDevice from "./pages/RegisterDevice"


function App() {

  return (
  <Router>
    
    <Routes>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register-device" element={<RegisterDevice/>}/>

      <Route element = {<Layout/>}>
      <Route element = {<PrivateRoute/>}>


      <Route path="/" element={<Dashboard/>}/>
      <Route path="/ads" element={<Ads/>}/>
      <Route path="/ads/:ad_id" element={<AdPage edit={false}/>}/>
      <Route path="/ads/:ad_id/edit" element={<AdPage edit={true}/>}/>


      <Route path="/ads/clients" element={<Clients/>}/>
      <Route path="/schedule" element={<Schedule  />}/>
      <Route path="/schedule/calendar" element={<Calendar/>}/>

      <Route path="/schedule/add" element={<AddToSchedule/>}/>

      <Route path="/devices" element={<Devices/>}/>
      <Route path="/devices/:device_id" element={<Devices/>}/>

      <Route path="/devices/groups" element={<DeviceGroup/>}/>

      <Route path="/campaigns" element={<Campaigns/>}/>
      <Route path="/campaigns/new" element={<NewCampaignPage/>}/>

      <Route path="/campaigns/edit/:campaign_id" element={<EditCampaignPage/>}/>

      <Route path="/campaigns/interactions" element={<CampaignInteractions/>}/>


      <Route path="/devices/:device_id" element={<Devices/>}/>

      <Route path="/devices/groups" element={<DeviceGroup/>}/>

      </Route>
      </Route>

    </Routes>
  </Router>
  )
}

export default App
