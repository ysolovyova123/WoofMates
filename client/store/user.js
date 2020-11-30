import axios from 'axios';
import {saltAndHash} from '../../utils/hashPasswordFunc'

//User State

const REGISTER_USER = "REGISTER_USER"
const LOGIN = 'LOGIN';

const _login = (user) => {
    return {
        type: LOGIN,
        user
    }
};

export const registerAUser = (user) => {
  return {
      type: REGISTER_USER,
      user
  }
};

export const registerUser = (firstName, lastName, userEmail, password, city, state, zipCode) => {
  return async(dispatch) => {
    try {
      let hashedPassword = saltAndHash(password)
      const newUser = (await axios.post('/api/users/register', {firstName, lastName, userEmail, hashedPassword, city, state, zipCode})).data
      dispatch(registerAUser(newUser))
    }
    catch (error) {
      console.log(error)
    }
  }
}

export const login = (loginInfo) => async(dispatch) => {
  try {
      let {userEmail} = loginInfo
      let hashedPassword = saltAndHash(loginInfo.password)
      const { data } = await (axios.post('/api/auth/login', {userEmail, hashedPassword}))
      dispatch(_login(data))
  } catch(err) {
      alert(err.message);
      console.error(err);
  }
};

export const userReducer = (state = {}, action) => {
  switch (action.type) {
      case REGISTER_USER:
          return action.user
      case LOGIN:
        return action.user;
      default:
          return state
  }
};
