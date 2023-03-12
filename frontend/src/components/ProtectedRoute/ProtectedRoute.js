import React from "react"
import { useProtectedRoute } from "hooks/auth/useProtectedRoute"
import { EuiLoadingSpinner } from "@elastic/eui"
import { LoginPage } from "components"

export default function ProtectedRoute({ component: Component, ...props }) {
  const { isAuthenticated, userLoaded } = useProtectedRoute()

  if (!userLoaded) return <EuiLoadingSpinner size="xl" />

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
      </>
    )
  }

  return <Component {...props} />
}
