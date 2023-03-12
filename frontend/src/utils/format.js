export const capitalize = (str) => (str ? str[0].toUpperCase() + str.slice(1) : str)

export const getAvatarName = (user) =>
  capitalize(user?.profile?.full_name) || capitalize(user?.username) || "Anonymous"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const formatPrice = (price) => (price ? currencyFormatter.format(price) : price)

/**
 * Take the first n characters of a string and add an ellipses at the end
 * if the string is longer than n characters. Option to cut off at nearest
 * word using the `useWordBoundary` flag
 *
 * @param {String} str - the string to truncate
 * @param {Integer} n - the max number of characters
 * @param {Boolean} useWordBoundary - whether or not to cut off at the nearest word
 */
export const truncate = (str, n = 200, useWordBoundary = false) => {
  if (!str || str?.length <= n) return str
  const subString = str.substr(0, n - 1)
  return (
    (useWordBoundary ? subString.substr(0, subString.lastIndexOf(" ")) : subString) + "&hellip;"
  )
}
