import { AnyAction } from 'redux';

import { LoginActions } from './actions';

export interface LoginState {
  accessToken: string;
}

export const loginReducer = (state: LoginState = {} as LoginState, action: AnyAction): LoginState => {
  switch (action.type) {
    case LoginActions.setAccessToken:
      return { ...state, accessToken: action.payload };
    default:
      return state;
  }
};
