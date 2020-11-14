export enum LoginActions {
  setAccessToken = 'setAccessToken',
}

export const setAccessToken = (payload: string) => {
  return {
    type: LoginActions.setAccessToken,
    payload,
  };
};

