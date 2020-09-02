import { LINK_EDITOR } from './constants';

const initialState = {};

export function link_editor(state = initialState, action = {}) {
  switch (action.type) {
    case LINK_EDITOR:
      return {
        ...state,
        show: action.show,
      };
    default:
      return state;
  }
}
