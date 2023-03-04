import React from "react"
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent_Deprecated,
  EuiPageContentBody_Deprecated,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle
} from "@elastic/eui"
import { RegistrationForm } from "../../components"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
`
const StyledEuiPageHeader = styled(EuiPageHeader)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;

  & h1 {
    font-size: 3.5rem;
  }
`

export default function RegistrationPage() {
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <StyledEuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Sign Up</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </StyledEuiPageHeader>
        <EuiPageContent_Deprecated verticalPosition="center" horizontalPosition="center">
          <EuiPageContentBody_Deprecated>
            <RegistrationForm />
          </EuiPageContentBody_Deprecated>
        </EuiPageContent_Deprecated>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
