import initialState from "./initialState"
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

function updateStateWithOfferForCleaning(state, offer) {
  return {
    ...state,
    isLoading: false,
    error: null,
    data: {
      ...state.data,
      [offer.cleaning_id]: {
        ...(state.data[offer.cleaning_id] || {}),
        [offer.user_id]: offer
      }
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
      return updateStateWithOfferForCleaning(state, action.data)
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
      return updateStateWithOfferForCleaning(state, action.data)
    case FETCH_USER_OFFER_FOR_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false,
        // we don't really mind if this 404s
        // error: action.error
      }
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
