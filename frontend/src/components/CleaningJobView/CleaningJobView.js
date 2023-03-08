import React from "react"
import { connect } from "react-redux"
import { Actions as cleaningActions } from "../../redux/cleanings"
import {
  EuiAvatar,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent_Deprecated,
  EuiPageContentBody_Deprecated,
  EuiLoadingSpinner,
  EuiTitle
} from "@elastic/eui"
import { CleaningJobCard, NotFoundPage } from "../../components"
import { useParams } from "react-router-dom"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
`
const StyledFlexGroup = styled(EuiFlexGroup)`
  padding: 1rem;
`

function CleaningJobView({
  isLoading,
  cleaningError,
  currentCleaningJob,
  fetchCleaningJobById,
  clearCurrentCleaningJob
}) {
  const { cleaning_id } = useParams()

  React.useEffect(() => {
    if (cleaning_id) {
      fetchCleaningJobById({ cleaning_id })
    }

    return () => clearCurrentCleaningJob()
  }, [cleaning_id, fetchCleaningJobById, clearCurrentCleaningJob])

  if (isLoading) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob?.name) return <NotFoundPage />

  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiPageContent_Deprecated verticalPosition="center" horizontalPosition="center" paddingSize="none">
          <StyledFlexGroup justifyContent="flex-start" alignItems="center">
            <EuiFlexItem grow={false}>
              <EuiAvatar
                size="xl"
                name={
                  currentCleaningJob.owner?.profile?.full_name ||
                  currentCleaningJob.owner?.username ||
                  "Anonymous"
                }
                initialsLength={2}
                imageUrl={currentCleaningJob.owner?.profile?.image}
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiTitle>
                <p>@{currentCleaningJob.owner?.username}</p>
              </EuiTitle>
            </EuiFlexItem>
          </StyledFlexGroup>

          <EuiPageContentBody_Deprecated>
            <CleaningJobCard cleaningJob={currentCleaningJob} />
          </EuiPageContentBody_Deprecated>
        </EuiPageContent_Deprecated>
      </EuiPageBody>
    </StyledEuiPage>
  )
}

export default connect(
  (state) => ({
    isLoading: state.cleanings.isLoading,
    cleaningError: state.cleanings.cleaningsError,
    currentCleaningJob: state.cleanings.currentCleaningJob
  }),
  {
    fetchCleaningJobById: cleaningActions.fetchCleaningJobById,
    clearCurrentCleaningJob: cleaningActions.clearCurrentCleaningJob
  }
)(CleaningJobView)
