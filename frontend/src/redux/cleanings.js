import initialState from "./initialState"
import apiClient from "../services/apiClient"

export const CREATE_CLEANING_JOB = "@@cleanings/CREATE_CLEANING_JOB"
export const CREATE_CLEANING_JOB_SUCCESS = "@@cleanings/CREATE_CLEANING_JOB_SUCCESS"
export const CREATE_CLEANING_JOB_FAILURE = "@@cleanings/CREATE_CLEANING_JOB_FAILURE"

export default function cleaningsReducer(state = initialState.cleanings, action = {}) {
  switch (action.type) {
    case CREATE_CLEANING_JOB:
      return {
        ...state,
        isLoading: true,
      }
    case CREATE_CLEANING_JOB_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: null,
        data: {
          ...state.data,
          [action.data.id]: action.data,
        },
      }
    case CREATE_CLEANING_JOB_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
      }
    default:
      return state
  }
}

export const Actions = {}

Actions.createCleaningJob = ({ new_cleaning }) => {
  return apiClient({
    url: `/cleanings/`,
    method: `POST`,
    types: {
      REQUEST: CREATE_CLEANING_JOB,
      SUCCESS: CREATE_CLEANING_JOB_SUCCESS,
      FAILURE: CREATE_CLEANING_JOB_FAILURE,
    },
    options: {
      data: { new_cleaning },
      params: {},
    },
  })
}
