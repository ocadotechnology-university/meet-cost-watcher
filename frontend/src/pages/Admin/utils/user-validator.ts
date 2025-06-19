type NewUser = {
  username: string,
  password: string,
  role_name: string,
  hourly_cost: string,
  app_role: string
};

export const userValidator = {
  isNewUserValid: (user: NewUser) => {
    return user.username.trim().length > 0 &&
      user.password.trim().length > 0 &&
      user.role_name.trim().length > 0 &&
      isHourlyCostValid(user.hourly_cost) &&
      user.app_role.length > 0;
  }
};

const isHourlyCostValid = (cost: string) => {
  return cost.length > 0 && !isNaN(Number(cost)) && Number(cost) > 0;
}