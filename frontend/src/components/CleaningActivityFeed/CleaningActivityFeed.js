import React from "react"
import moment from "moment"
import { useNavigate } from "react-router-dom"
import {
  EuiBadge,
  EuiButton,
  EuiButtonIcon,
  EuiCommentList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
  EuiMarkdownFormat,
  EuiText
} from "@elastic/eui"
import { useCleaningFeed } from "hooks/useCleaningFeed"
import { UserAvatar } from "components"
import { formatPrice, truncate } from "utils/format"
import styled from "styled-components"

const Wrapper = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
`
const DescriptionWrapper = styled.div`
  margin-bottom: 1rem;
`

const cleaningTypeToDisplayNameMapping = {
  dust_up: "Dust Up",
  spot_clean: "Spot Clean",
  full_clean: "Full Clean"
}

const renderFeedItemBody = (feedItem) => (
  <EuiText size="s">
    <h3>{feedItem.name}</h3>

    <DescriptionWrapper>
      <EuiMarkdownFormat>{truncate(feedItem.description, 300, true)}</EuiMarkdownFormat>
    </DescriptionWrapper>

    <p>
      Rate: <strong>{formatPrice(feedItem.price)}</strong>
    </p>
  </EuiText>
)
const renderUpdateEvent = (feedItem) => (
  <EuiFlexGroup responsive={false} alignItems="center" gutterSize="s">
    <EuiFlexItem grow={false}>
      <span>
        updated <strong>{feedItem.name}</strong>
      </span>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge className="hide-mobile" color="primary">
        {cleaningTypeToDisplayNameMapping[feedItem.cleaning_type]}
      </EuiBadge>
    </EuiFlexItem>
    <EuiFlexItem grow={false}>
      <EuiBadge className="hide-mobile" color="secondary">
        {formatPrice(feedItem.price)}
      </EuiBadge>
    </EuiFlexItem>
  </EuiFlexGroup>
)

const renderFeedItemAction = (feedItem, navigate) => (
  <EuiButtonIcon
    title="Navigate to cleaning job"
    aria-label="Navigate to cleaning job"
    color="subdued"
    iconType="popout"
    onClick={() => navigate(`/cleaning-jobs/${feedItem.id}`)}
  />
)

const renderTimelineIcon = (feedItem) => <UserAvatar user={feedItem.owner} size="l" />

const renderTimestamp = (feedItem) => `on ${moment(feedItem.created_at).format("MMM Do YYYY")}`

const createUiElementFromFeedItem = (feedItem, navigate) => {
  const isCreateEvent = feedItem["event_type"] === "is_create"

  return {
    username: feedItem.owner?.username,
    timestamp: renderTimestamp(feedItem),
    actions: renderFeedItemAction(feedItem, navigate),
    event: isCreateEvent ? `created a new job` : renderUpdateEvent(feedItem),
    type: isCreateEvent ? "regular" : "update",
    timelineIcon: isCreateEvent ? renderTimelineIcon(feedItem) : null,
    children: isCreateEvent ? renderFeedItemBody(feedItem) : null
  }
}

export default function CleaningActivityFeed() {
  const navigate = useNavigate()
  const { hasNext, isLoading, feedItems, fetchFeedItems } = useCleaningFeed()

  const feedItemElements = React.useMemo(
    () =>
      feedItems ? feedItems.map((feedItem) => createUiElementFromFeedItem(feedItem, navigate)) : [],
    [feedItems, navigate]
  )

  const handleLoadMore = () => {
    const startingDate = feedItems[feedItems.length - 1].event_timestamp
    fetchFeedItems(startingDate)
  }

  const renderHasNextButton = () => {
    return Boolean(hasNext) ? (
      <EuiButton onClick={handleLoadMore}>Load More</EuiButton>
    ) : (
      <EuiButton onClick={() => {}} isLoading={false} isDisabled={true}>
        {isLoading ? `Loading...` : `Nothing else here yet...`}
      </EuiButton>
    )
  }

  return (
    <Wrapper>
      <EuiCommentList comments={feedItemElements} />
      {isLoading ? <EuiLoadingSpinner size="xl" /> : null}
      {renderHasNextButton()}
    </Wrapper>
  )
}
