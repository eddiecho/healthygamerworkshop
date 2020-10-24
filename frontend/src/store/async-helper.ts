import { Action, AnyAction, Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

import { Store } from 'store';

export enum AsyncActionStatus {
  Success = 'Success',
  Failure = 'Failure',
  Stale = 'Stale',
}

export const fetchSuccessType = (apiName: string): string => {
  return `async/${apiName}__${AsyncActionStatus.Success}`;
};

export const fetchFailureType = (apiName: string): string => {
  return `async/${apiName}__${AsyncActionStatus.Failure}`;
};

export const fetchStaleType = (apiName: string): string => {
  return `async/${apiName}__${AsyncActionStatus.Stale}`;
};

export type AsyncThunkAction<T> = ThunkAction<Promise<T>, Store, {}, Action>;
export type AsyncThunkDispatch = ThunkDispatch<Store, {}, Action>;

// mimic bindActionCreators for my thunk actions
export function bindAsyncActionCreator<A extends any[], T>(
  asyncAction: (...args: A) => AsyncThunkAction<T>,
  dispatch: AsyncThunkDispatch
) {
  return (...args: A) => dispatch(asyncAction(...args));
}

interface AsyncActionOptions {
  invalidate?: boolean;
  meta?: { [key: string]: any };
}
export function asyncActionCreator<T>(apiName: string, promise: Promise<T>, options: AsyncActionOptions) {
  return async function(dispatch: Dispatch) {
    if (options.invalidate) {
      dispatch({
        meta: {
          ...options.meta,
          timestamp: Date.now(),
        },
        type: fetchStaleType(apiName),
      });
    }

    try {
      const response: T  = await promise;

      dispatch({
        meta: {
          ...options.meta,
          timestamp: Date.now(),
        },
        type: fetchSuccessType(apiName),
        payload: response,
      });
    } catch (err) {
      console.log(err);

      dispatch({
        meta: {
          ...options.meta,
          timestamp: Date.now(),
        },
        type: fetchFailureType(apiName),
        payload: err.message,
      });
    }
  }
}

interface AsyncState<T> {
  payload?: T;
  error?: string;
  status?: string;
  meta?: { [key: string]: any };
}
export function asyncReducerCreator<T>(apiName: string) {
  return function(state: AsyncState<T> = {} as AsyncState<T>, action: AnyAction): AsyncState<T> {
    switch(action.type) {
      case fetchSuccessType(apiName): {
        return { ...action.meta, status: AsyncActionStatus.Success, payload: action.payload };
      }
      case fetchFailureType(apiName): {
        return { ...action.meta, status: AsyncActionStatus.Failure, error: action.payload };
      }
      case fetchStaleType(apiName): {
        return { ...action.meta, status: AsyncActionStatus.Stale };
      }
      default: {
        return state;
      }
    }
  }
}

export type AsyncReducerType<T> = { [N in keyof T]?: AsyncState<any> };
