import { useEffect, useCallback } from "react"
import { useDispatch, useSelector, shallowEqual } from "react-redux"
import { Actions as feedActions } from "redux/feed"

export function useCleaningFeed() {
  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.feed.isLoading)
  const error = useSelector((state) => state.feed.error, shallowEqual)
  const hasNext = useSelector((state) => Boolean(state.feed.hasNext?.cleaning))
  const feedItems = useSelector((state) => state.feed.data?.cleaning, shallowEqual)

  const fetchFeedItems = useCallback(
    (starting_date, page_chunk_size) =>
      dispatch(feedActions.fetchCleaningFeedItems(starting_date, page_chunk_size)),
    [dispatch]
  )

  useEffect(() => {
    fetchFeedItems()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isLoading, error, hasNext, feedItems, fetchFeedItems }
}
