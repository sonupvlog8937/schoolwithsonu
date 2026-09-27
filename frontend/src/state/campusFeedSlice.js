import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseUrl } from "../environment";

const config = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: token?.startsWith("Bearer ") ? token : `Bearer ${token || ""}` } };
};

export const fetchCampusFeed = createAsyncThunk("campusFeed/fetch", async (_, { rejectWithValue }) => {
  try { return (await axios.get(`${baseUrl}/campus-feed`, config())).data.data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to load campus feed"); }
});
export const publishCampusPost = createAsyncThunk("campusFeed/publish", async (payload, { rejectWithValue }) => {
  try { return (await axios.post(`${baseUrl}/campus-feed/posts`, payload, config())).data.data; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to publish post"); }
});
export const toggleCampusLike = createAsyncThunk("campusFeed/like", async (id, { rejectWithValue }) => {
  try { return { id, ...(await axios.post(`${baseUrl}/campus-feed/posts/${id}/like`, {}, config())).data.data }; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to update like"); }
});
export const addCampusComment = createAsyncThunk("campusFeed/comment", async ({ id, text }, { rejectWithValue }) => {
  try { return { id, comment: (await axios.post(`${baseUrl}/campus-feed/posts/${id}/comments`, { text }, config())).data.data }; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to add comment"); }
});
export const removeCampusPost = createAsyncThunk("campusFeed/remove", async (id, { rejectWithValue }) => {
  try { await axios.delete(`${baseUrl}/campus-feed/posts/${id}`, config()); return id; }
  catch (error) { return rejectWithValue(error.response?.data?.message || "Unable to remove post"); }
});

const slice = createSlice({
  name: "campusFeed",
  initialState: { posts: [], trending: [], contributors: [], upcomingEvents: [], loading: false, saving: false, error: null, success: null },
  reducers: { clearCampusFeedNotice: (state) => { state.error = null; state.success = null; } },
  extraReducers: (builder) => {
    builder.addCase(fetchCampusFeed.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCampusFeed.fulfilled, (state, action) => { state.loading = false; Object.assign(state, action.payload); })
      .addCase(fetchCampusFeed.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(publishCampusPost.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(publishCampusPost.fulfilled, (state, action) => { state.saving = false; state.posts.unshift(action.payload); state.success = "Post published"; })
      .addCase(publishCampusPost.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(toggleCampusLike.fulfilled, (state, action) => { const post = state.posts.find((item) => item._id === action.payload.id); if (post) post.likes = Array(action.payload.likes).fill("like"); })
      .addCase(addCampusComment.fulfilled, (state, action) => { const post = state.posts.find((item) => item._id === action.payload.id); if (post) post.comments.push(action.payload.comment); })
      .addCase(removeCampusPost.fulfilled, (state, action) => { state.posts = state.posts.filter((item) => item._id !== action.payload); state.success = "Post removed"; });
  },
});

export const { clearCampusFeedNotice } = slice.actions;
export default slice.reducer;