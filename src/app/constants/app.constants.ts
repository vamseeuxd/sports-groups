export const APP_CONSTANTS = {
  COLLECTIONS: {
    GROUPS: 'groups',
    USERS: 'users',
    TOURNAMENTS: 'tournaments',
    PLAYER_REGISTRATIONS: 'playerRegistrations',
    TEAMS: 'teams',
    MATCHES: 'matches'
  },
  VALIDATION: {
    GROUP_NAME_MAX_LENGTH: 50,
    GROUP_NAME_MIN_LENGTH: 1,
    TEAM_NAME_MAX_LENGTH: 50,
    TEAM_NAME_MIN_LENGTH: 1,
    PLAYER_NAME_MAX_LENGTH: 50,
    PLAYER_NAME_MIN_LENGTH: 2
  },
  MESSAGES: {
    ERRORS: {
      INVALID_GROUP_NAME: 'Group name must be between 1 and 50 characters',
      DUPLICATE_GROUP_NAME: 'Group name already exists!',
      CREATE_FAILED: 'Failed to create {0}. Please try again.',
      UPDATE_FAILED: 'Failed to update {0}. Please try again.',
      DELETE_FAILED: 'Failed to delete {0}. Please try again.',
      LOAD_FAILED: 'Failed to load {0}. Please try again.'
    },
    CONFIRMATIONS: {
      DELETE_ITEM: 'Are you sure you want to delete "{0}"?'
    }
  },
  UI: {
    LOADING_MESSAGES: {
      TOURNAMENTS: 'Loading tournaments...',
      TEAMS: 'Loading teams...',
      PLAYERS: 'Loading players...',
      MATCHES: 'Loading matches...'
    }
  }
};