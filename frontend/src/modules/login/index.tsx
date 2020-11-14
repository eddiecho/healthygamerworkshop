import * as React from 'react';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse } from 'react-google-login';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import * as LoginActions from './actions';
import * as utils from 'modules/utils';
import { Store } from 'store';

export enum LoginCookie {
  StorageKey = 'healthygamerworkshoplogin',
}

interface State {
  loggedIn: boolean;
  clientToken: string;
}

interface StateProps {}

interface DispatchProps {
  setClientToken: typeof LoginActions.setClientToken;
}

interface OwnProps {
  clientId: string;
}

type Props = OwnProps & DispatchProps & StateProps;
class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loggedIn: false,
      clientToken: '',
    };
  }

  componentDidMount() {
    if (!this.state.loggedIn) {
      const clientToken = utils.getCookie(LoginCookie.StorageKey);
      if (clientToken) {
        this.setState({
          loggedIn: true,
          clientToken,
        });

        this.props.setClientToken(clientToken);
      }
    }
  }

  private onLoginFailure = (error: any) => {
    console.error(error);
  };

  private onLoginSuccess = (response: any) => {
    if (response) {
      const googleResponse: GoogleLoginResponse = response as GoogleLoginResponse;

      this.setState({
        loggedIn: true,
        clientToken: googleResponse.tokenId,
      });

      this.props.setClientToken(googleResponse.tokenId);
      utils.setCookie(LoginCookie.StorageKey, googleResponse.tokenId, googleResponse.tokenObj.expires_at);
    }
  };

  private onLogoutSuccess = () => {
    this.setState({
      loggedIn: false,
      clientToken: '',
    });

    this.props.setClientToken(undefined);
  };

  private renderLoginButton = () => {
    return (
      <GoogleLogin
        clientId={this.props.clientId}
        onSuccess={this.onLoginSuccess}
        onFailure={this.onLoginFailure}
        cookiePolicy="single_host_origin"
      />
    );
  };

  private renderLogoutButton = () => {
    return (
      <GoogleLogout
        clientId={this.props.clientId}
        onLogoutSuccess={this.onLogoutSuccess}
      />
    )
  };

  render() {
    return this.state.loggedIn ? this.renderLogoutButton() : this.renderLoginButton();
  }
}

const mapStateToProps = (state: Store): StateProps => ({});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return bindActionCreators({ setClientToken: LoginActions.setClientToken }, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps, Store>(mapStateToProps, mapDispatchToProps)(Login);
