import initialState from "./initialState"
import apiClient from "../services/apiClient"

export const CREATE_CLEANING_JOB = "@@cleanings/CREATE_CLEANING_JOB"
export const CREATE_CLEANING_JOB_SUCCESS = "@@cleanings/CREATE_CLEANING_JOB_SUCCESS"
export const CREATE_CLEANING_JOB_FAILURE = "@@cleanings/CREATE_CLEANING_JOB_FAILURE"

export const FETCH_CLEANING_JOB_BY_ID = "@@cleanings/FETCH_CLEANING_JOB_BY_ID"
export const FETCH_CLEANING_JOB_BY_ID_SUCCESS = "@@cleanings/FETCH_CLEANING_JOB_BY_ID_SUCCESS"
export const FETCH_CLEANING_JOB_BY_ID_FAILURE = "@@cleanings/FETCH_CLEANING_JOB_BY_ID_FAILURE"
export const CLEAR_CURRENT_CLEANING_JOB = "@@cleanings/CLEAR_CURRENT_CLEANING_JOB"

export default function cleaningsReducer(state = initialState.cleanings, action = {}) {
  switch (action.type) {
    case FETCH_CLEANING_JOB_BY_ID:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_CLEANING_JOB_BY_ID_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        currentCleaningJob: action.data
      }
    case FETCH_CLEANING_JOB_BY_ID_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        currentCleaningJob: {}
      }
    case CLEAR_CURRENT_CLEANING_JOB:
      return {
        ...state,
        currentCleaningJob: null
      }
    case CREATE_CLEANING_JOB:
      return {
        ...state,
        isLoading: true
      }
    case CREATE_CLEANING_JOB_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          [action.data.id]: action.data
        }
      }
    case CREATE_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    default:
      return state
  }
}

export const Actions = {}

Actions.clearCurrentCleaningJob = () => ({ type: CLEAR_CURRENT_CLEANING_JOB })

Actions.createCleaningJob = ({ new_cleaning }) => {
  return apiClient({
    url: `/cleanings/`,
    method: `POST`,
    types: {
      REQUEST: CREATE_CLEANING_JOB,
      SUCCESS: CREATE_CLEANING_JOB_SUCCESS,
      FAILURE: CREATE_CLEANING_JOB_FAILURE
    },
    options: {
      data: { new_cleaning },
      params: {}
    }
  })
}

Actions.fetchCleaningJobById = ({ cleaning_id }) => {
  return apiClient({
    url: `/cleanings/${cleaning_id}/`,
    method: `GET`,
    types: {
      REQUEST: FETCH_CLEANING_JOB_BY_ID,
      SUCCESS: FETCH_CLEANING_JOB_BY_ID_SUCCESS,
      FAILURE: FETCH_CLEANING_JOB_BY_ID_FAILURE
    },
    options: {
      data: {},
      params: {}
    }
  })
}
