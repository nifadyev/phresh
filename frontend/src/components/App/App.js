import React from "react"
import { Provider } from "react-redux"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import {
  CleaningJobsPage,
  LandingPage,
  Layout,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  ProtectedRoute,
  RegistrationPage
} from "../../components"

import configureReduxStore from "../../redux/store"

const store = configureReduxStore()

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/cleaning-jobs/*"
              element={<ProtectedRoute component={CleaningJobsPage} />}
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProtectedRoute component={ProfilePage} />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Provider>
  )
}
