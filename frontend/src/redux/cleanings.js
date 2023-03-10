import initialState from "./initialState"
import { REQUEST_LOG_USER_OUT } from "./auth"
import apiClient from "../services/apiClient"

export const CREATE_CLEANING_JOB = "@@cleanings/CREATE_CLEANING_JOB"
export const CREATE_CLEANING_JOB_SUCCESS = "@@cleanings/CREATE_CLEANING_JOB_SUCCESS"
export const CREATE_CLEANING_JOB_FAILURE = "@@cleanings/CREATE_CLEANING_JOB_FAILURE"

export const FETCH_CLEANING_JOB_BY_ID = "@@cleanings/FETCH_CLEANING_JOB_BY_ID"
export const FETCH_CLEANING_JOB_BY_ID_SUCCESS = "@@cleanings/FETCH_CLEANING_JOB_BY_ID_SUCCESS"
export const FETCH_CLEANING_JOB_BY_ID_FAILURE = "@@cleanings/FETCH_CLEANING_JOB_BY_ID_FAILURE"
export const CLEAR_CURRENT_CLEANING_JOB = "@@cleanings/CLEAR_CURRENT_CLEANING_JOB"

export const UPDATE_CLEANING_JOB = "@@cleanings/UPDATE_CLEANING_JOB"
export const UPDATE_CLEANING_JOB_SUCCESS = "@@cleanings/UPDATE_CLEANING_JOB_SUCCESS"
export const UPDATE_CLEANING_JOB_FAILURE = "@@cleanings/UPDATE_CLEANING_JOB_FAILURE"

export const FETCH_ALL_USER_OWNED_CLEANING_JOBS = "@@cleanings/FETCH_ALL_USER_OWNED_CLEANING_JOBS"
export const FETCH_ALL_USER_OWNED_CLEANING_JOBS_SUCCESS =
  "@@cleanings/FETCH_ALL_USER_OWNED_CLEANING_JOBS_SUCCESS"
export const FETCH_ALL_USER_OWNED_CLEANING_JOBS_FAILURE =
  "@@cleanings/FETCH_ALL_USER_OWNED_CLEANING_JOBS_FAILURE"

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
    case UPDATE_CLEANING_JOB:
      return {
        ...state,
        isUpdating: true
      }
    case UPDATE_CLEANING_JOB_SUCCESS:
      return {
        ...state,
        isUpdating: false,
        error: null,
        currentCleaningJob: {
          ...state.currentCleaningJob,
          ...Object.keys(action.data).reduce((acc, key) => {
            if (key !== "owner") acc[key] = action.data[key]
            return acc
          }, {})
        }
      }
    case UPDATE_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isUpdating: false,
        error: action.error
      }
    case FETCH_ALL_USER_OWNED_CLEANING_JOBS:
      return {
        ...state,
        isLoading: true
      }
    case FETCH_ALL_USER_OWNED_CLEANING_JOBS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          ...action.data.reduce((acc, job) => {
            acc[job.id] = job
            return acc
          }, {})
        }
      }
    case FETCH_ALL_USER_OWNED_CLEANING_JOBS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error
      }
    case REQUEST_LOG_USER_OUT:
      return initialState.cleanings
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

Actions.updateCleaningJob = ({ cleaning_id, cleaning_update }) => {
  return apiClient({
    url: `/cleanings/${cleaning_id}/`,
    method: `PUT`,
    types: {
      REQUEST: UPDATE_CLEANING_JOB,
      SUCCESS: UPDATE_CLEANING_JOB_SUCCESS,
      FAILURE: UPDATE_CLEANING_JOB_FAILURE
    },
    options: {
      data: { cleaning_update },
      params: {}
    }
  })
}

Actions.fetchAllUserOwnedCleaningJobs = () => {
  return apiClient({
    url: `/cleanings/`,
    method: `GET`,
    types: {
      REQUEST: FETCH_ALL_USER_OWNED_CLEANING_JOBS,
      SUCCESS: FETCH_ALL_USER_OWNED_CLEANING_JOBS_SUCCESS,
      FAILURE: FETCH_ALL_USER_OWNED_CLEANING_JOBS_FAILURE
    },
    options: {
      data: {},
      params: {}
    }
  })
}
