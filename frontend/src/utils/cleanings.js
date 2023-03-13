export const userIsOwnerOfCleaningJob = (cleaning, user) => {
  if (cleaning?.owner?.id === user?.id) return true
  if (cleaning?.owner === user?.id) return true
  return false
}
