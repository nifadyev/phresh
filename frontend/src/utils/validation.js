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

/**
 * Ensures a username consists of only letters, numbers, underscores, and dashes
 *
 * @param {String} username - username to be validated
 * @return {Boolean}
 */
export function validateUsername(username) {
  return /^[a-zA-Z0-9_-]+$/.test(username)
}

/**
 * Ensures a price field matches the general format: 9.99 or 2199999.99
 *
 * @param {String} price - price to be validated
 * @return {Boolean}
 */
export function validatePrice(price) {
  return /^\d+\.\d{1,2}$/.test(String(price).trim())
}

export default {
  email: validateEmail,
  password: validatePassword,
  username: validateUsername,
  price: validatePrice
}
