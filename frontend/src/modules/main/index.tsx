import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';

import { Store } from 'store';
import * as Actions from './actions';

interface StateProps {
  reduxProps: number;
}

interface DispatchProps {
  propAction: typeof Actions.propsActions;
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

  componentDidMount() {
    if (this.props.propAction) {
      this.props.propAction(42);
    }
  }

  private incrementCount = () => {
    this.setState({...this.state, count: this.state.count + 1});
  }

  private setCount = () => {
    if (this.props.propAction) {
      this.props.propAction(this.state.count);
    }
  }

  render() {
    return (
      <React.Fragment>
        <p>{this.props.reduxProps}</p>
        <button onClick={this.setCount}>HITMEGACHIBASS</button>
        <button onClick={this.incrementCount}>{this.state.count}</button>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (store: Store): StateProps => {
  return {
    reduxProps: store.main ? store.main.count: 0,
  }
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return bindActionCreators({ propAction: Actions.propsActions }, dispatch);
}

export default connect<StateProps, DispatchProps, OwnProps, Store>(mapStateToProps, mapDispatchToProps)(Main);
