import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  user: any;
  token: any;
  blogList: any;
}

const initialState: UserState = {
  user: null,
  token: null,
  blogList: null
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateBlogList: (state, action: PayloadAction<any>) => {
      state.blogList = action.payload.blog_list;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, updateBlogList, logoutUser } = userSlice.actions;

export default userSlice.reducer;
