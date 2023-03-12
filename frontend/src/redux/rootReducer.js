import { combineReducers } from "redux"

import authReducer from "redux/auth"
import cleaningsReducer from "redux/cleanings"
import offersReducer from "redux/offers"
import feedReducer from "redux/feed"

const rootReducer = combineReducers({
  auth: authReducer,
  cleanings: cleaningsReducer,
  feed: feedReducer,
  offers: offersReducer
})

export default rootReducer
