import { asyncActionCreator } from 'store/async-helper';
import * as Blogs from 'types/blogs';
import * as utils from 'modules/utils';
import { LoginStorage } from 'modules/login';

export enum BlogActions {
  listBlogs = 'listBlogs',
  createBlog = 'createBlog',
}

const apiDomain = 'https://api.healthygamerworkshop.com/blog/';

function listBlogs(nextToken?: string) {
  const request: Blogs.ListRequest = {};
  if (nextToken) {
    request.NextToken = nextToken;
  }

  return asyncActionCreator(
    BlogActions.listBlogs,
    fetch(`${apiDomain}list`, {
        method: 'POST',
        body: JSON.stringify(request),
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(response => response.json()),
      {}
  )
}

function createBlog() {
  const request: Blogs.CreateRequest = {
    Title: 'My title yyoo',
    CreationTime: Date.now(),
    Author: 'meee',
    Markdown: 'i love dr k',
  };

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const authCookie = utils.getCookie(LoginStorage.StorageKey);
  if (authCookie) {
    headers.append('Authorization', authCookie);
  }

  return asyncActionCreator(
    BlogActions.createBlog,
    fetch(`${apiDomain}create`, {
      method: 'POST',
      body: JSON.stringify(request),
      mode: 'cors',
      headers
    }).then(response => response.json()),
    {}
  );
}

export default {
  listBlogs,
  createBlog,
};
