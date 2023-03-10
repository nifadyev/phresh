import initialState from "./initialState"
import { REQUEST_LOG_USER_OUT } from "./auth"
import apiClient from "../services/apiClient"

export const CREATE_OFFER_FOR_CLEANING_JOB = "@@offers/CREATE_OFFER_FOR_CLEANING_JOB"
export const CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS =
  "@@offers/CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS"
export const CREATE_OFFER_FOR_CLEANING_JOB_FAILURE =
  "@@offers/CREATE_OFFER_FOR_CLEANING_JOB_FAILURE"

export const FETCH_USER_OFFER_FOR_CLEANING_JOB = "@@offers/FETCH_USER_OFFER_FOR_CLEANING_JOB"
export const FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS =
  "@@offers/FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS"
export const FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE =
  "@@offers/FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE"

export const FETCH_ALL_OFFERS_FOR_CLEANING_JOB = "@@offers/FETCH_ALL_OFFERS_FOR_CLEANING_JOB"
export const FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS =
  "@@offers/FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS"
export const FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE =
  "@@offers/FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE"

export const ACCEPT_USERS_OFFER_FOR_CLEANING_JOB =
  "@@offers/ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB"
export const ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_SUCCESS =
  "@@offers/ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB_SUCCESS"
export const ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_FAILURE =
  "@@offers/ACCEPT_OFFER_FROM_USER_FOR_CLEANING_JOB_FAILURE"

function updateStateWithOffersForCleaning(state, offers) {
  const cleaningId = offers?.[0]?.cleaning_id
  const offersIndexedByUserId = offers?.reduce((acc, offer) => {
    acc[offer.user_id] = offer
    return acc
  }, {})

  return {
    ...state,
    isLoading: false,
    error: null,
    data: {
      ...state.data,
      ...(cleaningId
        ? {
            [cleaningId]: {
              ...(state.data[cleaningId] || {}),
              ...offersIndexedByUserId
            }
          }
        : {})
    }
  }
}

export default function offersReducer(state = initialState.offers, action = {}) {
  switch (action.type) {
    case CREATE_OFFER_FOR_CLEANING_JOB:
      return {
        ...state,
        isLoading: true
      }
    case CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS:
      return updateStateWithOffersForCleaning(state, [action.data])
    case CREATE_OFFER_FOR_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    case FETCH_USER_OFFER_FOR_CLEANING_JOB:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS:
      return updateStateWithOffersForCleaning(state, [action.data])
    case FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false
        // we don't really mind if this 404s
        // error: action.error,
      }
    case FETCH_ALL_OFFERS_FOR_CLEANING_JOB:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS:
      return updateStateWithOffersForCleaning(state, action.data)
    case FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    case ACCEPT_USERS_OFFER_FOR_CLEANING_JOB:
      return {
        ...state,
        isUpdating: true
      }
    case ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_SUCCESS:
      return {
        ...state,
        isUpdating: false,
        error: null
      }
    case ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isUpdating: false,
        error: action.error
      }
    case REQUEST_LOG_USER_OUT:
      return initialState.offers
    default:
      return state
  }
}

export const Actions = {}

Actions.createOfferForCleaning = ({ cleaning_id }) => {
  return apiClient({
    url: `/cleanings/${cleaning_id}/offers/`,
    method: `POST`,
    types: {
      REQUEST: CREATE_OFFER_FOR_CLEANING_JOB,
      SUCCESS: CREATE_OFFER_FOR_CLEANING_JOB_SUCCESS,
      FAILURE: CREATE_OFFER_FOR_CLEANING_JOB_FAILURE
    },
    options: {
      data: {},
      params: {}
    }
  })
}

Actions.fetchUserOfferForCleaningJob = ({ cleaning_id, username }) => {
  return apiClient({
    url: `/cleanings/${cleaning_id}/offers/${username}/`,
    method: `GET`,
    types: {
      REQUEST: FETCH_USER_OFFER_FOR_CLEANING_JOB,
      SUCCESS: FETCH_USER_OFFER_FOR_CLEANING_JOB_SUCCESS,
      FAILURE: FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE
    },
    options: {
      data: {},
      params: {}
    }
  })
}

Actions.fetchAllOffersForCleaningJob = ({ cleaning_id }) => {
  return apiClient({
    url: `/cleanings/${cleaning_id}/offers/`,
    method: `GET`,
    types: {
      REQUEST: FETCH_ALL_OFFERS_FOR_CLEANING_JOB,
      SUCCESS: FETCH_ALL_OFFERS_FOR_CLEANING_JOB_SUCCESS,
      FAILURE: FETCH_ALL_OFFERS_FOR_CLEANING_JOB_FAILURE
    },
    options: {
      data: {},
      params: {}
    }
  })
}

Actions.acceptUsersOfferForCleaningJob = ({ username, cleaning_id }) => {
  return (dispatch) => {
    return dispatch(
      apiClient({
        url: `/cleanings/${cleaning_id}/offers/${username}/`,
        method: `PUT`,
        types: {
          REQUEST: ACCEPT_USERS_OFFER_FOR_CLEANING_JOB,
          SUCCESS: ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_SUCCESS,
          FAILURE: ACCEPT_USERS_OFFER_FOR_CLEANING_JOB_FAILURE
        },
        options: {
          data: {},
          params: {}
        },
        onSuccess: (res) => {
          dispatch(Actions.fetchAllOffersForCleaningJob({ cleaning_id }))
          return { success: true, status: res.status, data: res.data }
        }
      })
    )
  }
}
