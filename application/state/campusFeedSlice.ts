import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDataFromApi, postData } from '@/utils/api';

export const fetchCampusFeed = createAsyncThunk('campusFeed/fetch', async () => {
  const response = await fetchDataFromApi('/campus-feed');
  return response?.data ?? { posts: [], trending: [], contributors: [], upcomingEvents: [] };
});
export const publishCampusPost = createAsyncThunk('campusFeed/publish', async (content: string) => postData('/campus-feed/posts', { content }));
export const toggleCampusLike = createAsyncThunk('campusFeed/like', async (id: string) => postData(`/campus-feed/posts/${id}/like`, {}));
export const addCampusComment = createAsyncThunk('campusFeed/comment', async ({ id, text }: { id: string; text: string }) => postData(`/campus-feed/posts/${id}/comments`, { text }));

const slice = createSlice({
  name: 'campusFeed',
  initialState: { posts: [] as any[], trending: [] as any[], contributors: [] as any[], upcomingEvents: [] as any[], loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCampusFeed.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchCampusFeed.fulfilled, (state, action) => { state.loading = false; Object.assign(state, action.payload); });
    builder.addCase(fetchCampusFeed.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Unable to load campus feed'; });
    builder.addCase(publishCampusPost.fulfilled, (state, action) => { if (action.payload?.data) state.posts.unshift(action.payload.data); });
    builder.addCase(toggleCampusLike.fulfilled, (state, action) => { const post = state.posts.find((item) => item._id === action.meta.arg); if (post) post.likes = Array(action.payload?.data?.likes || 0).fill('like'); });
    builder.addCase(addCampusComment.fulfilled, (state, action) => { const post = state.posts.find((item) => item._id === action.meta.arg.id); if (post && action.payload?.data) post.comments.push(action.payload.data); });
  },
});

export default slice.reducer;