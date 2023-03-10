import { combineReducers } from "redux"

import authReducer from "./auth"
import cleaningsReducer from "./cleanings"
import offersReducer from "./offers"

const rootReducer = combineReducers({
  auth: authReducer,
  cleanings: cleaningsReducer,
  offers: offersReducer
})

export default rootReducer
