
import { createSlice } from "@reduxjs/toolkit";

export const loginSlice = createSlice({
    name:"login",
    initialState:{
        isLogin:false,
        isAdmin:false,
        user: null
    },
    reducers:{
        login:(state, action)=>{
            const user = action.payload;

            if(user === "ADMIN"){
                return {isLogin:true, isAdmin:true, user:null};
            }
            if(user === "USER"){
                return {isLogin:true, isAdmin:false, user:null};
            }

            return {
                isLogin: true,
                isAdmin: Boolean(user?.isAdmin || user?.role === "ADMIN" || user?.role === "admin"),
                user: user || null
            };
        },
        logout:(state)=>{
            return {isLogin:false, isAdmin:false, user:null}
        }
    }
})

export const {login, logout} = loginSlice.actions;
const loginReducer = loginSlice.reducer;
export default loginReducer;