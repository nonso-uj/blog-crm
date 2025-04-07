import { combineReducers } from "@reduxjs/toolkit";
import userReducer from '../pages/Auth/_redux/userSlice'


const rootReducer = combineReducers({
    user: userReducer,
});

export default rootReducer;