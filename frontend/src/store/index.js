import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import postsReducer from './postsSlice.js';
import commentsReducer from './commentsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
  },
});

export default store;
