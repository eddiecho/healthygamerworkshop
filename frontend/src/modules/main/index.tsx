import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Store } from 'store';
import { AsyncThunkDispatch, bindAsyncActionCreator } from 'store/async-helper';
import BlogActions from 'store/async-actions';
import * as Blogs from 'types/blogs';
import * as Actions from './actions';

interface StateProps {
  reduxProps: number;
}

interface DispatchProps {
  propAction: typeof Actions.propsActions;
  listBlogs: (nextToken?: string) => Promise<Blogs.ListResponse | undefined>;
  createBlog: (title: string, author: string, markdown: string) => Promise<Blogs.CreateResponse | undefined>;
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
    if (this.props.propAction) {
      this.props.propAction(this.state.count);
    }
  };

  private createBlog = () => {
    this.props.createBlog('my title yo', 'meee', 'i love dr k');
  };

  render() {
    return (
      <React.Fragment>
        <p>{this.props.reduxProps}</p>
        <button onClick={this.setCount}>HITMEGACHIBASS</button>
        <button onClick={this.incrementCount}>{this.state.count}</button>
        <br />
        <button onClick={this.createBlog}>{"Please don't press me"}</button>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (store: Store): StateProps => {
  return {
    reduxProps: store.main ? store.main.count: 0,
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
