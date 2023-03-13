export default {
  auth: {
    isLoading: false,
    isUpdating: false,
    isAuthenticated: false,
    error: null,
    userLoaded: false,
    user: {}
  },
  cleanings: {
    isLoading: false,
    isUpdating: false,
    error: null,
    data: {},
    activeCleaningId: null
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
  },
  ui: {
    toastList: []
  }
}
