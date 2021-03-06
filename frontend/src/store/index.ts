import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import Thunk from 'redux-thunk';

import { LoginState, loginReducer } from 'modules/login/reducers';
import { MainReducer, mainReducer } from 'modules/main/reducers';
import blog, { BlogReducers } from 'store/async-reducers';

const isDevelopment = process.env.NODE_ENV === 'development';

let enhancedCompose = compose;
if (isDevelopment) {
  enhancedCompose =
    typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'workshop' })
  : compose;
}

export interface Store {
  main: MainReducer;
  blog: BlogReducers;
  login: LoginState;
}

export const configureStore = createStore<Store, any, {}, {}>(
  combineReducers({
    login: loginReducer,
    main: mainReducer,
    blog
  }),
  enhancedCompose(applyMiddleware(Thunk))
)
