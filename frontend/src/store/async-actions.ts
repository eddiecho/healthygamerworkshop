import { LoginCookie } from 'modules/login';
import * as utils from 'modules/utils';
import { asyncActionCreator } from 'store/async-helper';
import * as Blogs from 'types/blogs';

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
      }).then(response => <unknown>response.json() as Blogs.ListResponse),
      {}
  );
}

function createBlog(title: string, author: string, markdown: string) {
  const request: Blogs.CreateRequest = {
    Title: title,
    Author: author,
    Markdown: markdown,
  };

  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const clientToken = utils.getCookie(LoginCookie.StorageKey);
  if (clientToken) {
    headers.append('Authorization', clientToken);
  }

  return asyncActionCreator(
    BlogActions.createBlog,
    fetch(`${apiDomain}create`, {
      method: 'POST',
      body: JSON.stringify(request),
      mode: 'cors',
      headers,
    }).then(response => <unknown>response.json() as Blogs.CreateResponse),
    {}
  );
}

export default {
  listBlogs,
  createBlog,
};

