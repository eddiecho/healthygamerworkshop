import React from 'react';
import { GoogleLogin, GoogleLogout, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Store } from 'store';
import * as LoginActions from './actions';
import * as utils from 'modules/utils';

interface State {
  loggedIn: boolean;
  accessToken: string;
  expirationDate: number;
}

interface StateProps {}

interface DispatchProps {
  setAccessToken: typeof LoginActions.setAccessToken;
}

interface OwnProps {
  clientId: string;
}

export enum LoginStorage {
  StorageKey = 'healthygamerworkshoplogin',
  User = 'user',
  Expiry = 'expiry',
};

type Props = StateProps & DispatchProps & OwnProps;
export class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loggedIn: false,
      accessToken: '',
      expirationDate: 0,
    };
  }

  public componentDidMount() {
    const userDataStr = utils.getCookie(LoginStorage.StorageKey);

    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      const expirationDate = userData[LoginStorage.Expiry];

      if (expirationDate > Date.now()) {
        this.setState({
          loggedIn: true,
          accessToken: userData[LoginStorage.User],
          expirationDate,
        });

        this.props.setAccessToken(userData[LoginStorage.User]);
      } else {
        utils.setCookie(LoginStorage.StorageKey, '');
      }
    }
  }

  private loginSuccess = (response: any) => {
    if (response) {
      const googleResponse: GoogleLoginResponse = response as GoogleLoginResponse;
      const expirationDate = googleResponse.tokenObj.expires_at;

      console.log(googleResponse);
      this.setState({
        loggedIn: true,
        accessToken: googleResponse.accessToken,
        expirationDate,
      });

      utils.setCookie(LoginStorage.StorageKey, googleResponse.accessToken, expirationDate);
      this.props.setAccessToken(googleResponse.accessToken);
    }
  };

  private logoutSuccess = () => {
    this.setState({
      loggedIn: false,
      accessToken: '',
      expirationDate: 0,
    });
  };

  private loginFailure = (response: any) => {
    console.error(response);
  };

  private logoutFailure = () => {
    console.error('wtf');
  };

  private renderLoginButton = () => {
    return (
      <GoogleLogin
        clientId={this.props.clientId}
        onSuccess={this.loginSuccess}
        onFailure={this.loginFailure}
        cookiePolicy={'single_host_origin'}
        responseType="code,token"
        isSignedIn={true}
        prompt="consent"
      />
    )
  };

  private renderLogoutButton = () => {
    return (
      <GoogleLogout
        clientId={this.props.clientId}
        onLogoutSuccess={this.logoutSuccess}
        onFailure={this.logoutFailure}
      />
    )
  };

  render() {
    return (
      <div>
        {this.state.loggedIn ? this.renderLogoutButton() : this.renderLoginButton()}
      </div>
    )
  }
}

const mapStateToProps = (state: Store): StateProps => {
  return {};
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
  return bindActionCreators({ setAccessToken: LoginActions.setAccessToken }, dispatch);
}

export default connect<StateProps, DispatchProps, OwnProps, Store>(mapStateToProps, mapDispatchToProps)(Login);
