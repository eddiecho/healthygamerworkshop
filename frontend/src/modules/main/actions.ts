export enum MainActions {
  incrementCount = 'incrementCount',
}


export const propsActions = (payload: number) => {
  return {
    type: MainActions.incrementCount,
    payload,
  }
}
