import * as React from 'react';
import { connect } from 'react-redux';

interface StateProps {
  count: number;
}

type Props = StateProps;
export class Header extends React.Component<Props> {
  render() {
    return <div />;
  }
}

export default Header;

