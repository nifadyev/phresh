import React from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { connect, useSelector, shallowEqual } from "react-redux"
import { Actions as cleaningActions } from "../../redux/cleanings"
import { Actions as offersActions } from "../../redux/offers"
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
  CleaningJobOffersTable,
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
  offersError,
  cleaningError,
  offersIsLoading,
  offersIsUpdating,
  currentCleaningJob,
  fetchCleaningJobById,
  createOfferForCleaning,
  clearCurrentCleaningJob,
  fetchUserOfferForCleaningJob,
  fetchAllOffersForCleaningJob,
  acceptUsersOfferForCleaningJob
}) {
  const { cleaning_id } = useParams()
  const navigate = useNavigate()
  const userOwnsCleaningResource = useSelector(
    (state) => state.cleanings.data?.[cleaning_id]?.owner === user?.id,
    shallowEqual
  )
  const allOffersForCleaningJob = useSelector(
    (state) => state.offers.data?.[cleaning_id],
    shallowEqual
  )

  React.useEffect(() => {
    if (cleaning_id && user?.username) {
      fetchCleaningJobById({ cleaning_id })

      if (userOwnsCleaningResource) {
        fetchAllOffersForCleaningJob({ cleaning_id })
      } else {
        fetchUserOfferForCleaningJob({ cleaning_id, username: user.username })
      }
    }

    return () => clearCurrentCleaningJob()
  }, [
    cleaning_id,
    fetchCleaningJobById,
    clearCurrentCleaningJob,
    userOwnsCleaningResource,
    fetchUserOfferForCleaningJob,
    fetchAllOffersForCleaningJob,
    user
  ])

  if (isLoading) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob) return <EuiLoadingSpinner size="xl" />
  if (!currentCleaningJob?.name) return <NotFoundPage />

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

  const viewCleaningJobElement = (
    <CleaningJobCard
      user={user}
      offersError={offersError}
      offersIsLoading={offersIsLoading}
      cleaningJob={currentCleaningJob}
      isOwner={userOwnsCleaningResource}
      createOfferForCleaning={createOfferForCleaning}
    />
  )
  const editCleaningJobElement = (
    <PermissionsNeeded
      element={<CleaningJobEditForm cleaningJob={currentCleaningJob} />}
      isAllowed={userOwnsCleaningResource}
    />
  )
  const cleaningJobOffersTableElement = userOwnsCleaningResource ? (
    <CleaningJobOffersTable
      offers={allOffersForCleaningJob ? Object.values(allOffersForCleaningJob) : []}
      offersIsUpdating={offersIsUpdating}
      offersIsLoading={offersIsLoading}
      handleAcceptOffer={acceptUsersOfferForCleaningJob}
    />
  ) : null

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
              <Route path="/" element={viewCleaningJobElement} />
              <Route path="/edit" element={editCleaningJobElement} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </EuiPageContentBody_Deprecated>
        </EuiPageContent_Deprecated>

        <Routes>
          <Route path="/" element={cleaningJobOffersTableElement} />
        </Routes>
      </EuiPageBody>
    </StyledEuiPage>
  )
}

export default connect(
  (state) => ({
    user: state.auth.user,
    isLoading: state.cleanings.isLoading,
    offersIsLoading: state.offers.isLoading,
    offersIsUpdating: state.offers.isUpdating,
    offersError: state.offers.error,
    cleaningError: state.cleanings.cleaningsError,
    currentCleaningJob: state.cleanings.currentCleaningJob
  }),
  {
    fetchCleaningJobById: cleaningActions.fetchCleaningJobById,
    clearCurrentCleaningJob: cleaningActions.clearCurrentCleaningJob,
    fetchUserOfferForCleaningJob: offersActions.fetchUserOfferForCleaningJob,
    fetchAllOffersForCleaningJob: offersActions.fetchAllOffersForCleaningJob,
    createOfferForCleaning: offersActions.createOfferForCleaning,
    acceptUsersOfferForCleaningJob: offersActions.acceptUsersOfferForCleaningJob
  }
)(CleaningJobView)
