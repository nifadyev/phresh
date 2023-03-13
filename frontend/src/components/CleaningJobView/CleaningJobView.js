import React from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { useSingleCleaningJob } from "hooks/cleanings/useSingleCleaningJob"
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiLoadingSpinner,
  EuiTitle
} from "@elastic/eui"
import {
  CleaningJobCard,
  CleaningJobEditForm,
  CleaningJobOffersTable,
  NotFoundPage,
  PermissionsNeeded,
  UserAvatar
} from "components"
import { useParams } from "react-router-dom"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
  display: flex;
  flex-direction: column;
`
const StyledFlexGroup = styled(EuiFlexGroup)`
  padding: 1rem;
`

export default function CleaningJobView() {
  const navigate = useNavigate()
  const { cleaningId } = useParams()
  const {
    error,
    cleaningJob,
    isLoading,
    isUpdating,
    activeCleaningId,
    userIsOwner
  } = useSingleCleaningJob(cleaningId)

  if (isLoading) return <EuiLoadingSpinner size="xl" />
  if (!cleaningJob && activeCleaningId !== cleaningId) return <NotFoundPage />

  const editJobButton = userIsOwner ? (
    <EuiButtonIcon iconType="documentEdit" aria-label="edit" onClick={() => navigate(`edit`)} />
  ) : null
  const goBackButton = (
    <EuiButtonEmpty
      iconType="sortLeft"
      size="s"
      onClick={() => navigate(`/cleaning-jobs/${cleaningJob.id}`)}
    >
      back to job
    </EuiButtonEmpty>
  )

  const viewCleaningJobElement = (
    <CleaningJobCard
      offersIsLoading={null}
      cleaningJob={cleaningJob}
      isOwner={userIsOwner}
      createOfferForCleaning={null}
      userOfferForCleaningJob={null}
    />
  )
  const editCleaningJobElement = (
    <PermissionsNeeded
      element={<CleaningJobEditForm cleaningId={cleaningId} />}
      isAllowed={userIsOwner}
    />
  )

  const cleaningJobOffersTableElement = userIsOwner ? (
    <CleaningJobOffersTable offers={[]} handleAcceptOffer={null} offersIsLoading={null} />
  ) : null

  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <EuiPageContent verticalPosition="center" horizontalPosition="center" paddingSize="none">
          <StyledFlexGroup alignItems="center" direction="row" responsive={false}>
            <EuiFlexItem>
              <EuiFlexGroup
                justifyContent="flexStart"
                alignItems="center"
                direction="row"
                responsive={false}
              >
                <EuiFlexItem grow={false}>
                  <UserAvatar size="xl" user={cleaningJob.owner} initialsLength={2} />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiTitle>
                    <p>@{cleaningJob.owner?.username}</p>
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

          <EuiPageContentBody>
            <Routes>
              <Route path="/" element={viewCleaningJobElement} />
              <Route path="/edit" element={editCleaningJobElement} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </EuiPageContentBody>
        </EuiPageContent>

        <Routes>
          <Route path="/" element={cleaningJobOffersTableElement} />
        </Routes>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
