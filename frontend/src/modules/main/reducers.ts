import { AnyAction } from 'redux';

import { MainActions } from './actions';

export interface MainReducer {
  count: number;
}

export const mainReducer = (state: MainReducer = {} as MainReducer, action: AnyAction): MainReducer => {
  switch(action.type) {
    case MainActions.incrementCount:
      return { ...state, count: action.payload };
    default:
      return state;
  }
}
