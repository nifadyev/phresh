import { combineReducers } from "redux"

import authReducer from "./auth"
import cleaningsReducer from "./cleanings"

const rootReducer = combineReducers({
  auth: authReducer,
  cleanings: cleaningsReducer
})

export default rootReducer
