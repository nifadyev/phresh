import React from "react"
import { connect } from "react-redux"
import {
  EuiAccordion,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiSpacer
} from "@elastic/eui"
import { CleaningActivityFeed, CleaningJobCreateForm } from "components"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;

  & .create-new-job-button {
    display: flex;
    justify-content: center;
    text-decoration: none;

    & > span {
      font-size: 1.2rem;
      font-weight: bold;
    }

    &:hover {
      & > span {
        color: dodgerblue;
      }
    }
  }
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

function CleaningJobsHome({ user }) {
  const newJobButtonContent = (
    <>
      <EuiIcon type="broom" size="l" /> Post A New Cleaning Job
    </>
  )

  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <StyledEuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Cleaning Jobs</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </StyledEuiPageHeader>
        <EuiPageContent horizontalPosition="center">
          <EuiPageContentBody>
            <EuiAccordion
              id="create-new-job-button"
              arrowDisplay="none"
              buttonContent={newJobButtonContent}
              paddingSize="m"
              buttonClassName="create-new-job-button"
            >
              <CleaningJobCreateForm />
            </EuiAccordion>
          </EuiPageContentBody>
        </EuiPageContent>

        <EuiSpacer />

        <CleaningActivityFeed />
      </EuiPageBody>
    </StyledEuiPage>
  )
}

export default connect((state) => ({ user: state.auth.user }))(CleaningJobsHome)
