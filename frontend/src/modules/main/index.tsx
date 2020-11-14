import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { Store } from 'store';
import { AsyncThunkDispatch, bindAsyncActionCreator, unwrapAsyncState, unwrapAsyncError } from 'store/async-helper';
import BlogActions from 'store/async-actions';
import * as Actions from './actions';
import * as Blog from 'types/blogs';

interface StateProps {
  reduxProps: number;
  blogs: Blog.BlogSummary[];
  blogsError?: string;
}

interface DispatchProps {
  propAction: typeof Actions.propsActions;
  listBlogs: (nextToken?: string) => Promise<any>;
  createBlog: () => Promise<any>;
}

interface OwnProps {}

interface State {
  count: number;
}

type Props = StateProps & DispatchProps & OwnProps;
class Main extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      count: 0
    }
  }

  async componentDidMount() {
    if (this.props.propAction) {
      this.props.propAction(42);
    }

    try {
      this.props.listBlogs();
    } catch (e) {
      console.log('fail');
    }
  }

  private incrementCount = () => {
    this.setState({...this.state, count: this.state.count + 1});
  };

  private setCount = () => {
    this.props.propAction(this.state.count);
  };

  private createBlog = () => {
    this.props.createBlog();
  };

  render() {
    return (
      <React.Fragment>
        <p>{this.props.reduxProps}</p>
        <button onClick={this.setCount}>HITMEGACHIBASS</button>
        <button onClick={this.incrementCount}>{this.state.count}</button>
        <br />
        <button onClick={this.createBlog}>{'Please don\'t press this'}</button>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (store: Store): StateProps => {
  const blogs = store.blog.listBlogs
    ? unwrapAsyncState<Blog.BlogSummary[]>(store.blog.listBlogs)
    : [];
  const blogsError = unwrapAsyncError(store.blog.listBlogs);

  return {
    reduxProps: store.main ? store.main.count: 0,
    blogs: blogs || [],
    blogsError,
  }
}

const mapDispatchToProps = (dispatch: AsyncThunkDispatch): DispatchProps => {
  return {
    ...bindActionCreators({ propAction: Actions.propsActions }, dispatch),
    listBlogs: bindAsyncActionCreator(BlogActions.listBlogs, dispatch),
    createBlog: bindAsyncActionCreator(BlogActions.createBlog, dispatch),
  }
}

export default connect<StateProps, DispatchProps, OwnProps, Store>(mapStateToProps, mapDispatchToProps)(Main);
