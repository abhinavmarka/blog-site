import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api';

// Async Thunks
export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAll',
  async (params = {}, thunkAPI) => {
    try {
      const { page = 1, limit = 10, tag = '', search = '', author_id = '' } = params;
      let queryStr = `?page=${page}&limit=${limit}`;
      if (tag) queryStr += `&tag=${encodeURIComponent(tag)}`;
      if (search) queryStr += `&search=${encodeURIComponent(search)}`;
      if (author_id) queryStr += `&author_id=${author_id}`;

      const response = await fetch(`${API_URL}/posts${queryStr}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to fetch posts');
      }
      return data; // { success, data, pagination }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchBySlug',
  async (slug, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/posts/${slug}`, { headers });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Post not found');
      }
      return data; // { success, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const createNewPost = createAsyncThunk(
  'posts/create',
  async (postData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to create post');
      }
      return data; // { success, message, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const updateExistingPost = createAsyncThunk(
  'posts/update',
  async ({ id, postData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to update post');
      }
      return data; // { success, message, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const deleteExistingPost = createAsyncThunk(
  'posts/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to delete post');
      }
      return { id, message: data.message };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const fetchMyPosts = createAsyncThunk(
  'posts/fetchMy',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/posts/my`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to fetch your posts');
      }
      return data; // { success, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const fetchBookmarks = createAsyncThunk(
  'posts/fetchBookmarks',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/posts/bookmarks`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to fetch bookmarks');
      }
      return data; // { success, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId, isLiked }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to like/unlike post');
      }
      return { postId, isLiked: !isLiked, likes_count: data.likes_count };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const toggleBookmarkPost = createAsyncThunk(
  'posts/toggleBookmark',
  async ({ postId, isBookmarked }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/posts/${postId}/bookmark`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to bookmark/unbookmark post');
      }
      return { postId, isBookmarked: !isBookmarked };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    myPosts: [],
    bookmarks: [],
    currentPost: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Post By Slug
      .addCase(fetchPostBySlug.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPost = action.payload.data;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Post
      .addCase(createNewPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts.unshift(action.payload.data);
      })
      .addCase(createNewPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update Post
      .addCase(updateExistingPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.currentPost && state.currentPost.id === action.payload.data.id) {
          state.currentPost = { ...state.currentPost, ...action.payload.data };
        }
        state.posts = state.posts.map(post => 
          post.id === action.payload.data.id ? { ...post, ...action.payload.data } : post
        );
      })

      // Delete Post
      .addCase(deleteExistingPost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload.id);
        state.myPosts = state.myPosts.filter(p => p.id !== action.payload.id);
        if (state.currentPost && state.currentPost.id === action.payload.id) {
          state.currentPost = null;
        }
      })

      // Fetch My Posts
      .addCase(fetchMyPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myPosts = action.payload.data;
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Bookmarks
      .addCase(fetchBookmarks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookmarks = action.payload.data;
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Toggle Like
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, isLiked, likes_count } = action.payload;
        // Update current post details if it's the one liked
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_liked = isLiked;
          state.currentPost.likes_count = likes_count;
        }
        // Update list feed if present
        state.posts = state.posts.map(p => 
          p.id === postId ? { ...p, likes_count } : p
        );
      })

      // Toggle Bookmark
      .addCase(toggleBookmarkPost.fulfilled, (state, action) => {
        const { postId, isBookmarked } = action.payload;
        if (state.currentPost && state.currentPost.id === postId) {
          state.currentPost.is_bookmarked = isBookmarked;
        }
        // Remove from bookmarks list if unbookmarked
        if (!isBookmarked) {
          state.bookmarks = state.bookmarks.filter(b => b.id !== postId);
        }
      });
  },
});

export const { clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;
