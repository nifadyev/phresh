export default {
  auth: {
    isLoading: false,
    isUpdating: false,
    isAuthenticated: false,
    error: false,
    user: {}
  },
  cleanings: {
    isLoading: false,
    isUpdating: false,
    error: null,
    data: {},
    currentCleaningJob: null
  },
  offers: {
    isLoading: false,
    isUpdating: false,
    error: null,
    data: {}
  },
  feed: {
    isLoading: false,
    error: null,
    data: {},
    hasNext: {}
  }
}
