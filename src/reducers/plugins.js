const initialState = {};

export default function slate_plugins(state = initialState, action = {}) {
  const { type, ...rest } = action;
  switch (type) {
    case 'SLATE_PLUGINS':
      return {
        ...state,
        ...rest,
      };
    default:
      return state;
  }
}
