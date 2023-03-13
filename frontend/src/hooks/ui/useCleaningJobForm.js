import React, { useState, Fragment, useEffect } from "react"
import { useSingleCleaningJob } from "hooks/cleanings/useSingleCleaningJob"
import { EuiText } from "@elastic/eui"
import { extractErrorMessages } from "utils/errors"
import validation from "utils/validation"

const cleaningTypeOptions = [
  {
    value: "dust_up",
    inputDisplay: "Dust Up",
    dropdownDisplay: (
      <Fragment>
        <strong>Dust Up</strong>
        <EuiText size="s" color="subdued">
          <p className="euiTextColor--subdued">
            A minimal clean job. Dust shelves and mantels, tidy rooms, and sweep floors.
          </p>
        </EuiText>
      </Fragment>
    )
  },
  {
    value: "spot_clean",
    inputDisplay: "Spot Clean",
    dropdownDisplay: (
      <Fragment>
        <strong>Spot Clean</strong>
        <EuiText size="s" color="subdued">
          <p className="euiTextColor--subdued">
            A standard clean job. Vacuum all indoor spaces, sanitize surfaces, and disinfect
            targeted areas. Bathrooms, tubs, and toilets can be added on for an additional charge.
          </p>
        </EuiText>
      </Fragment>
    )
  },
  {
    value: "full_clean",
    inputDisplay: "Deep Clean",
    dropdownDisplay: (
      <Fragment>
        <strong>Deep Clean</strong>
        <EuiText size="s" color="subdued">
          <p className="euiTextColor--subdued">
            A complete clean job. Mop tile floors, scrub out tough spots, and a guaranteed clean
            residence upon completion. Dishes, pots, and pans included in this package.
          </p>
        </EuiText>
      </Fragment>
    )
  }
]

export const useCleaningJobForm = (cleaningId) => {
  const { cleaningJob, isLoading, isUpdating, error } = useSingleCleaningJob(cleaningId)

  const [form, setForm] = useState({
    name: cleaningJob?.name || "",
    description: cleaningJob?.description || "",
    price: cleaningJob?.price || "",
    cleaning_type: cleaningJob?.cleaning_type || cleaningTypeOptions[0].value
  })
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const cleaningErrorList = extractErrorMessages(error)

  useEffect(() => {
    if (cleaningJob) {
      setForm((form) => ({ ...cleaningJob }))
    }
  }, [cleaningJob])

  const validateInput = (label, value) => {
    // grab validation function and run it on input if it exists
    // if it doesn't exists, just assume the input is valid
    const isValid = validation?.[label] ? validation?.[label]?.(value) : true
    // set an error if the validation function did NOT return true
    setErrors((errors) => ({ ...errors, [label]: !isValid }))
  }

  const onInputChange = (label, value) => {
    validateInput(label, value)

    setForm((state) => ({ ...state, [label]: value }))
  }

  const onCleaningTypeChange = (cleaning_type) => {
    setForm((state) => ({ ...state, cleaning_type }))
  }

  const getFormErrors = () => {
    const formErrors = []

    if (errors.form) {
      formErrors.push(errors.form)
    }

    if (hasSubmitted && cleaningErrorList.length) {
      return formErrors.concat(cleaningErrorList)
    }

    return formErrors
  }

  return {
    form,
    setForm,
    errors,
    isLoading,
    isUpdating,
    hasSubmitted,
    getFormErrors,
    setHasSubmitted,
    onInputChange,
    validateInput,
    onCleaningTypeChange,
    cleaningTypeOptions
  }
}
