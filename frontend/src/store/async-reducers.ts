import { combineReducers } from 'redux';

import { BlogActions } from 'store/async-actions';
import { AsyncReducerType, asyncReducerCreator } from 'store/async-helper';
import * as Blogs from 'types/blogs';

export type BlogReducers = AsyncReducerType<typeof BlogActions>;

export default combineReducers<BlogReducers>({
  [BlogActions.listBlogs]: asyncReducerCreator<Blogs.ListResponse>(BlogActions.listBlogs),
  [BlogActions.createBlog]: asyncReducerCreator<Blogs.CreateResponse>(BlogActions.createBlog),
});
