import moment from "moment"
import initialState from "redux/initialState"
import { REQUEST_LOG_USER_OUT } from "redux/auth"
import apiClient from "services/apiClient"

export const FETCH_CLEANING_FEED_ITEMS = "@@feed/FETCH_CLEANING_FEED_ITEMS"
export const FETCH_CLEANING_FEED_ITEMS_SUCCESS = "@@feed/FETCH_CLEANING_FEED_ITEMS_SUCCESS"
export const FETCH_CLEANING_FEED_ITEMS_FAILURE = "@@feed/FETCH_CLEANING_FEED_ITEMS_FAILURE"

export const SET_HAS_NEXT_FOR_FEED = "@@feed/SET_HAS_NEXT_FOR_FEED"

export default function feedReducer(state = initialState.feed, action = {}) {
  switch (action.type) {
    case FETCH_CLEANING_FEED_ITEMS:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_CLEANING_FEED_ITEMS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          cleaning: [...(state.data.cleaning || []), ...action.data]
        }
      }
    case FETCH_CLEANING_FEED_ITEMS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    case SET_HAS_NEXT_FOR_FEED:
      return {
        ...state,
        hasNext: {
          ...state.hasNext,
          [action.feed]: action.hasNext
        }
      }
    case REQUEST_LOG_USER_OUT:
      return initialState.feed
    default:
      return state
  }
}

export const Actions = {}

Actions.fetchCleaningFeedItems = (starting_date = new Date(), page_chunk_size = 20) => {
  return (dispatch) => {
    return dispatch(
      apiClient({
        url: `/feed/cleanings/`,
        method: `GET`,
        types: {
          REQUEST: FETCH_CLEANING_FEED_ITEMS,
          SUCCESS: FETCH_CLEANING_FEED_ITEMS_SUCCESS,
          FAILURE: FETCH_CLEANING_FEED_ITEMS_FAILURE
        },
        options: {
          data: {},
          params: {
            starting_date: moment(starting_date).format(),
            page_chunk_size
          }
        },
        onSuccess: (res) => {
          dispatch({
            type: SET_HAS_NEXT_FOR_FEED,
            feed: "cleaning",
            hasNext: Boolean(res?.data?.length === page_chunk_size)
          })
          return { success: true, status: res.status, data: res.data }
        }
      })
    )
  }
}
