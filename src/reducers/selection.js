const initialState = {};

export default function slate_block_selections(
  state = initialState,
  action = {},
) {
  switch (action.type) {
    case 'SET_SLATE_BLOCK_SELECTION':
      return {
        ...state,
        [action.blockid]: action.selection,
      };
    default:
      return state;
  }
}
