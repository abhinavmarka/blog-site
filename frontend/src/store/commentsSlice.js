import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = 'http://localhost:5000/api';

// Async Thunks
export const fetchPostComments = createAsyncThunk(
  'comments/fetchByPost',
  async (postId, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/comments/post/${postId}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to load comments');
      }
      return data; // { success, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const addComment = createAsyncThunk(
  'comments/add',
  async ({ post_id, parent_id, content }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id, parent_id, content }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to submit comment');
      }
      return data; // { success, message, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const updateCommentContent = createAsyncThunk(
  'comments/update',
  async ({ commentId, content }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to edit comment');
      }
      return data; // { success, message, data }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

export const removeComment = createAsyncThunk(
  'comments/delete',
  async (commentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      if (!token) return thunkAPI.rejectWithValue('Unauthenticated');

      const response = await fetch(`${API_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || 'Failed to delete comment');
      }
      return { commentId };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message || 'Network error');
    }
  }
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearComments: (state) => {
      state.comments = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Post Comments
      .addCase(fetchPostComments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.comments = action.payload.data;
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload.data);
      })

      // Update Comment
      .addCase(updateCommentContent.fulfilled, (state, action) => {
        const updatedComment = action.payload.data;
        state.comments = state.comments.map(c => 
          c.id === updatedComment.id ? updatedComment : c
        );
      })

      // Delete Comment
      .addCase(removeComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        // In hierarchical deletion, the backend DB schema is ON DELETE CASCADE, which means nested replies will be
        // deleted by the database itself. However, to keep it simple in the UI, we delete the comment and its sub-replies from the flat list
        
        // Find all comments to delete (itself + recursive descendants)
        const getDescendants = (parentId) => {
          let list = [parentId];
          const children = state.comments.filter(c => c.parent_id === parentId);
          for (const child of children) {
            list = [...list, ...getDescendants(child.id)];
          }
          return list;
        };

        const idsToDelete = getDescendants(commentId);
        state.comments = state.comments.filter(c => !idsToDelete.includes(c.id));
      });
  },
});

export const { clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
