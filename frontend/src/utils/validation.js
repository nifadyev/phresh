/**
 * VERY simple email validation
 *
 * @param {String} text - email to be validated
 * @return {Boolean}
 */
export function validateEmail(text) {
  return text?.indexOf("@") !== -1
}

/**
 * Ensures password is of at least a certain length
 *
 * @param {String} password - password to be validated
 * @param {Integer} length - length password must be as long as
 * @return {Boolean}
 */
export function validatePassword(password, length = 7) {
  return password?.length >= length
}

export default {
  email: validateEmail,
  password: validatePassword
}
