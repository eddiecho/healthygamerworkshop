import { AnyAction } from 'redux';

import { LoginActions } from './actions';

export interface LoginState {
  clientToken?: string;
}

export const loginReducer = (state: LoginState = {} as LoginState, action: AnyAction): LoginState => {
  switch (action.type) {
    case LoginActions.setClientToken:
      return { ...state, clientToken: action.payload };
    default:
      return state;
  }
};
