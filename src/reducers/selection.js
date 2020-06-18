const initialState = {};

export default function slate_block_selections(
  state = initialState,
  action = {},
) {
  console.log('slate_block_selections reducer called', { state, action });

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
