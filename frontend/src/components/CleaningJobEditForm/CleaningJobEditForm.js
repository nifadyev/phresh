import React from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Actions as cleaningActions } from "redux/cleanings"
import { useCleaningJobForm } from "hooks/ui/useCleaningJobForm"
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFieldNumber,
  EuiSuperSelect,
  EuiSpacer,
  EuiTextArea
} from "@elastic/eui"
import styled from "styled-components"

const Wrapper = styled.div`
  padding: 1rem 2rem;
`

function CleaningJobEditForm({ cleaningId, updateCleaning }) {
  const navigate = useNavigate()
  const {
    form,
    errors,
    setErrors,
    isUpdating,
    getFormErrors,
    validateInput,
    onCleaningTypeChange,
    setHasSubmitted,
    onInputChange,
    cleaningTypeOptions
  } = useCleaningJobForm(cleaningId)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // validate inputs before submitting
    Object.keys(form).forEach((label) => validateInput(label, form[label]))
    console.log("validate")

    // if any input hasn't been entered in, return early
    if (!Object.values(form).every((value) => Boolean(value))) {
      setErrors((errors) => ({ ...errors, form: `You must fill out all fields.` }))
      return
    }
    console.log("inputted")

    setHasSubmitted(true)
    console.log("submitted")

    const res = await updateCleaning({ cleaningId, cleaningUpdate: { ...form } })
    console.log("updated")
    if (res.success) {
      console.log("success")
      navigate(`/cleaning-jobs/${cleaningId}`)
    }
    console.log({ res })
  }

  return (
    <Wrapper>
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFormRow
          label="Job Title"
          helpText="What do you want cleaners to see first?"
          isInvalid={Boolean(errors.name)}
          error={`Please enter a valid name.`}
        >
          <EuiFieldText
            name="name"
            value={form.name}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
          />
        </EuiFormRow>

        <EuiFormRow label="Select a cleaning type">
          <EuiSuperSelect
            options={cleaningTypeOptions}
            valueOfSelected={form.cleaning_type}
            onChange={(value) => onCleaningTypeChange(value)}
            itemLayoutAlign="top"
            hasDividers
          />
        </EuiFormRow>

        <EuiFormRow
          label="Hourly Rate"
          helpText="List a reasonable price for each hour of work the employee logs."
          isInvalid={Boolean(errors.price)}
          error={`Price should match the general format: 9.99`}
        >
          <EuiFieldNumber
            name="price"
            icon="currency"
            placeholder="19.99"
            value={form.price}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Job Description"
          helpText="What do you want prospective employees to know about this opportunity?"
          isInvalid={Boolean(errors.description)}
          error={`Please enter a valid input.`}
        >
          <EuiTextArea
            name="description"
            placeholder="I'm looking for..."
            value={form.description}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
          />
        </EuiFormRow>

        <EuiSpacer />

        <EuiButton type="submit" isLoading={isUpdating} fill iconType="save" iconSide="right">
          Update Cleaning
        </EuiButton>
      </EuiForm>
    </Wrapper>
  )
}

export default connect(null, {
  updateCleaning: cleaningActions.updateCleaningJob
})(CleaningJobEditForm)
