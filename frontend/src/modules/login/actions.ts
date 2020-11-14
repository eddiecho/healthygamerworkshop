export enum LoginActions {
  setClientToken = 'setClientToken',
}

export const setClientToken = (payload: string | undefined) => {
  return {
    type: LoginActions.setClientToken,
    payload
  };
}
