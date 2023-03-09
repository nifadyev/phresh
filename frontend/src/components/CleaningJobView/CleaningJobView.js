import React from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { connect } from "react-redux"
import { Actions as cleaningActions } from "../../redux/cleanings"
import {
  EuiAvatar,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent_Deprecated,
  EuiPageContentBody_Deprecated,
  EuiLoadingSpinner,
  EuiTitle
} from "@elastic/eui"
import {
  CleaningJobCard,
  CleaningJobEditForm,
  NotFoundPage,
  PermissionsNeeded
} from "../../components"
import { useParams } from "react-router-dom"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
`
const StyledFlexGroup = styled(EuiFlexGroup)`
  padding: 1rem;
`

function CleaningJobView({
  user,
  isLoading,
  cleaningError,
  currentCleaningJob,
  fetchCleaningJobById,
  clearCurrentCleaningJob
}) {
  const { cleaning_id } = useParams()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (cleaning_id) {
      fetchCleaningJobById({ cleaning_id })
    }

    return () => clearCurrentCleaningJob()
  }, [cleaning_id, fetchCleaningJobById, clearCurrentCleaningJob])

  if (isLoading) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob?.name) return <NotFoundPage />

  const userOwnsCleaningResource = currentCleaningJob?.owner?.id === user?.id

  const editJobButton = userOwnsCleaningResource ? (
    <EuiButtonIcon iconType="documentEdit" aria-label="edit" onClick={() => navigate(`edit`)} />
  ) : null
  const goBackButton = (
    <EuiButtonEmpty
      iconType="sortLeft"
      size="s"
      onClick={() => navigate(`/cleaning-jobs/${currentCleaningJob.id}`)}
    >
      back to job
    </EuiButtonEmpty>
  )

  const editCleaningJobElement = (
    <PermissionsNeeded
      element={<CleaningJobEditForm cleaningJob={currentCleaningJob} />}
      isAllowed={userOwnsCleaningResource}
    />
  )

  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiPageContent_Deprecated verticalPosition="center" horizontalPosition="center" paddingSize="none">
          <StyledFlexGroup alignItems="center" direction="row" responsive={false}>
            <EuiFlexItem>
              <EuiFlexGroup
                justifyContent="flexStart"
                alignItems="center"
                direction="row"
                responsive={false}
              >
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
              </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <Routes>
                <Route path="/" element={editJobButton} />
                <Route path="/edit" element={goBackButton} />
              </Routes>
            </EuiFlexItem>
          </StyledFlexGroup>

          <EuiPageContentBody_Deprecated>
            <Routes>
              <Route path="/" element={<CleaningJobCard cleaningJob={currentCleaningJob} />} />
              <Route path="/edit" element={editCleaningJobElement} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </EuiPageContentBody_Deprecated>
        </EuiPageContent_Deprecated>
      </EuiPageBody>
    </StyledEuiPage>
  )
}

export default connect(
  (state) => ({
    user: state.auth.user,
    isLoading: state.cleanings.isLoading,
    cleaningError: state.cleanings.cleaningsError,
    currentCleaningJob: state.cleanings.currentCleaningJob
  }),
  {
    fetchCleaningJobById: cleaningActions.fetchCleaningJobById,
    clearCurrentCleaningJob: cleaningActions.clearCurrentCleaningJob
  }
)(CleaningJobView)
