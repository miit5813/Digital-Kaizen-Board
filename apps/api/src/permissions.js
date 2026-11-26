export const PERMISSIONS = {
  SUGGESTION_CREATE: 'suggestion.create',
  SUGGESTION_VIEW_ALL: 'suggestion.view_all',
  COMMENT_CREATE: 'comment.create',
  WORKFLOW_MANAGE: 'workflow.manage',
  ROLES_MANAGE: 'roles.manage',
  USERS_MANAGE: 'users.manage',
  REPORTS_VIEW: 'reports.view',
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

export const ROLE_TEMPLATES = [
  {
    name: 'Администратор',
    description: 'Полный доступ',
    permissions: ALL_PERMISSIONS,
  },
  {
    name: 'Автор',
    description: 'Подаёт предложения',
    permissions: [PERMISSIONS.SUGGESTION_CREATE, PERMISSIONS.COMMENT_CREATE],
  },
  {
    name: 'Эксперт',
    description: 'Оценивает предложения',
    permissions: [PERMISSIONS.SUGGESTION_VIEW_ALL, PERMISSIONS.COMMENT_CREATE],
  },
  {
    name: 'Координатор кайдзен',
    description: 'Видит все предложения и отчёты',
    permissions: [
      PERMISSIONS.SUGGESTION_VIEW_ALL,
      PERMISSIONS.COMMENT_CREATE,
      PERMISSIONS.REPORTS_VIEW,
    ],
  },
]