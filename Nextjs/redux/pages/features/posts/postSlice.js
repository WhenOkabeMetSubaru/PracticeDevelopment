import { createSlice, nanoid,createAsyncThunk } from '@reduxjs/toolkit';
import {sub} from 'date-fns'
import axios from 'axios'
const POSTS_URL = 'https://jsonplaceholder.typicode.com/posts'
// const initialState = [
//     { id: '1', title: 'Learning Redux Toolkit', content: "I've heard good things.",date:sub(new Date(),{minutes:10}).toISOString(),
//     reactions:{
//         thumpsUp:0,
//         wow:0,
//         heart:0,
//         rocket:0,
//         coffee:0
//     }
// },
//     { id: '2', title: 'Slices....', content: 'The more I say slice,the more I want pizza.',date:sub(new Date(),{minutes:5}).toISOString(),reactions:{
//         thumpsUp:0,
//         wow:0,
//         heart:0,
//         rocket:0,
//         coffee:0
//     } }
// ]
const initialState={
    posts:[],
    status:'idle',
    error:null
}

export const fetchPosts = createAsyncThunk('posts/fetchposts',async()=>{
    try{
        const response = await axios.get(POSTS_URL);
        return [...response.data]
    }catch(error){
        return error.message;
    }
})


const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postAdded: {
            reducer(state, action) {
                state.posts.push(action.payload)
            },
            prepare(title,content,userId){
                return{
                    payload:{
                        id:nanoid(),
                        title,
                        content,
                        date : sub(new Date(),{minutes:5}).toISOString(),
                        userId,
                        reactions:{
                            thumpsUp:0,
                            wow:0,
                            heart:0,
                            rocket:0,
                            coffee:0
                        }
                    }
                }
            }
        },
        reactionAdded(state,action){
            const{postId,reaction} = action.payload;
            const existingPost = state.posts.find(post=>post.id===postId);
            if(existingPost){
                existingPost.reactions[reaction]++;
            }
        },
        extraReducers(builder){
            builder 
                .addCase(fetchPosts.pending,(state,action)=>{
                    state.status = 'loading'
                })
                .addCase(fetchPosts.fulfilled,(state,action)=>{
                    state.status = 'succeeded'
                    let min = 1;
                    const loadedPosts = action.payload.map(post=>{
                        post.date = sub(new Date(),{minute:min++}).toISOString()
                        post.reactions = {
                            thumbsUp:0,
                            hooray:0,
                            heart:0,
                            rocket:0,
                            eyes:0
                        }
                        return post;
                    })
                    state.posts = state.posts.concat(loadedPosts);
                })
                .addCase(fetchPosts.rejected,(state,action)=>{
                    state.status = 'failed'
                    state.error = action.error.message;
                })

        }
    }
})

export const selectAllPosts = (state) => state.posts.posts;

export const { postAdded,reactionAdded } = postSlice.actions;

export default postSlice.reducer