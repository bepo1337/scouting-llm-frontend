// need this for docker later when we use a compose file
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

export enum Positions {
    GOALKEEPER = 'Goalkeeper',
    CENTER_BACK = 'Centre back',
    LEFT_CENTER_BACK = 'Left center back',
    RIGHT_CENTER_BACK = 'Right center back',
    LEFT_BACK = 'Left back',
    LEFT_WING_BACK = 'Left wing back',
    RIGHT_BACK = 'Right back',
    RIGHT_WING_BACK = 'Right wing back',
    DEFENSIVE_MIDFIELD = 'Defensive midfield',
    CENTRAL_MIDFIELD = 'Central midfield',
    RIGHT_MIDFIELD = 'Right midfield',
    LEFT_MIDFIELD = 'Left midfield',
    ATTACKING_MIDFIELD = 'Attacking midfield',
    HANGING_TOP = 'Hanging top',
    LEFT_WING = 'Left wing',
    RIGHT_WING = 'Right wing',
    CENTER_FORWARD = 'Center forward',
    SUBSTITUTE = 'Substitute'
}
  