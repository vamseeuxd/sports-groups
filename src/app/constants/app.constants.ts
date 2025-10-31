export const APP_CONSTANTS = {
  COLLECTIONS: {
    GROUPS: 'groups',
    USERS: 'users',
    TOURNAMENTS: 'tournaments',
    PLAYER_REGISTRATIONS: 'playerRegistrations',
    TEAMS: 'teams'
  },
  VALIDATION: {
    GROUP_NAME_MAX_LENGTH: 50,
    GROUP_NAME_MIN_LENGTH: 1
  },
  MESSAGES: {
    ERRORS: {
      INVALID_GROUP_NAME: 'Group name must be between 1 and 50 characters',
      DUPLICATE_GROUP_NAME: 'Group name already exists!',
      CREATE_GROUP_FAILED: 'Failed to create group. Please try again.',
      UPDATE_GROUP_FAILED: 'Failed to update group. Please try again.',
      DELETE_GROUP_FAILED: 'Failed to delete group. Please try again.'
    },
    CONFIRMATIONS: {
      DELETE_GROUP: 'Are you sure you want to delete'
    }
  }
};