import * as Blogs from 'types/blogs';
import { asyncActionCreator } from 'store/async-helper';

export enum BlogActions {
  listBlogs = 'listBlogs',
}

function listBlogs(nextToken?: string) {
  const request: Blogs.ListRequest = {};
  if (nextToken) {
    request.NextToken = nextToken;
  }

  return asyncActionCreator(
    BlogActions.listBlogs,
    fetch('https://api.healthygamerworkshop.com/blog/list', {
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

export default {
  listBlogs,
};
