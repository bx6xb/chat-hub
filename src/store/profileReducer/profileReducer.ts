import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { Photos, ProfileData, ProfileDomain, profileAPI } from "../../api/api"
import { AppRootState } from "../store"
import { errorHandler, networkErrorHandler } from "../../utils/errorHandler"

// thunks
export const getUserProfile = createAsyncThunk(
  "profile/getUserProfile",
  async (userId: number, { rejectWithValue, dispatch }) => {
    try {
      const response = await profileAPI.getUserProfile(userId)
      return response.data
    } catch {
      networkErrorHandler(dispatch)
      return rejectWithValue({})
    }
  }
)
export const getProfileStatus = createAsyncThunk(
  "profile/getProfileStatus",
  async (userId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileAPI.getProfileStatus(userId)
      return response.data
    } catch {
      networkErrorHandler(dispatch)
      return rejectWithValue({})
    }
  }
)
export const setProfileStatus = createAsyncThunk<string, string, { state: AppRootState }>( // fix this: if request was rejected thunk returns old status
  "profile/setProfileStatus",
  async (status: string, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileAPI.setProfileStatus(status)
      if (response.data.resultCode === 0) {
        return status
      } else {
        errorHandler(dispatch, "Error while set profile status")
        return rejectWithValue({})
      }
    } catch {
      networkErrorHandler(dispatch)
      return rejectWithValue({})
    }
  }
)
export const setProfilePhoto = createAsyncThunk<Photos, File>(
  "profile/setProfilePhoto",
  async (photo, { dispatch, rejectWithValue }) => {
    try {
      const response = await profileAPI.setProfilePhoto(photo)
      if (response.data.resultCode === 0) {
        return response.data.data.photos
      } else {
        errorHandler(dispatch, "Error while set profile photo")
        return rejectWithValue({})
      }
    } catch {
      networkErrorHandler(dispatch)
      return rejectWithValue({})
    }
  }
)
export const setProfileData = createAsyncThunk<void, ProfileData, { state: AppRootState }>(
  "profile/setProfileData",
  async (profileData: ProfileData, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await profileAPI.setProfileData(profileData)
      if (response.data.resultCode === 0) {
        const userId = getState().auth.id!
        dispatch(getUserProfile(userId))
      } else {
        errorHandler(dispatch, "Error while set profile data")
        return rejectWithValue({})
      }
    } catch {
      networkErrorHandler(dispatch)
      return rejectWithValue({})
    }
  }
)

const slice = createSlice({
  name: "profile",
  initialState: {
    posts: [
      { id: 1, message: "Hi, how are you?", likesCount: 12 },
      { id: 2, message: "It's my first post", likesCount: 11 },
      { id: 3, message: "Blabla", likesCount: 10 },
      { id: 4, message: "Dada", likesCount: 9 },
    ],
    userProfile: null,
    profileStatus: "",
  } as ProfileState,
  reducers: {
    addPost(state, action: PayloadAction<{ message: string }>) {
      return {
        ...state,
        posts: [
          {
            id: state.posts.length + 1,
            message: action.payload.message,
            likesCount: 0,
          },
          ...state.posts,
        ],
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.fulfilled, (state, action) => {
        return {
          ...state,
          userProfile: action.payload,
        }
      })
      .addCase(getProfileStatus.fulfilled, (state, action) => {
        return {
          ...state,
          profileStatus: action.payload,
        }
      })
      .addCase(setProfileStatus.fulfilled, (state, action) => {
        return {
          ...state,
          profileStatus: action.payload,
        }
      })
      .addCase(setProfilePhoto.fulfilled, (state, action) => {
        if (state.userProfile) {
          return {
            ...state,
            userProfile: {
              ...state.userProfile,
              photos: {
                ...action.payload,
              },
            },
          }
        }
      })
  },
})

export const profileReducer = slice.reducer
export const { addPost } = slice.actions

// types
export type Post = {
  id: number
  message: string
  likesCount: number
}
export type ProfileState = {
  posts: Post[]
  userProfile: ProfileDomain | null
  profileStatus: string
}
export type ProfileReducerAction = ReturnType<typeof addPost>