import { FOOTNOTE_EDITOR } from './constants';

const initialState = {};

export function footnote_editor(state = initialState, action = {}) {
  switch (action.type) {
    case FOOTNOTE_EDITOR:
      return {
        ...state,
        show: action.show,
      };
    default:
      return state;
  }
}
