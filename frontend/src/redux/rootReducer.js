import { combineReducers } from "redux"

import authReducer from "./auth"
import cleaningsReducer from "./cleanings"
import offersReducer from "./offers"
import feedReducer from "./feed"
import uiReducer from "./ui"

const rootReducer = combineReducers({
  auth: authReducer,
  cleanings: cleaningsReducer,
  offers: offersReducer,
  feed: feedReducer,
  ui: uiReducer
})

export default rootReducer
