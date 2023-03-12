import React from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { useLoginAndRegistrationForm } from "hooks/ui/useLoginAndRegistrationForm"
import { Actions as authActions, FETCHING_USER_FROM_TOKEN_SUCCESS } from "redux/auth"
import {
  EuiButton,
  EuiFieldText,
  EuiForm,
  EuiFormRow,
  EuiFieldPassword,
  EuiSpacer
} from "@elastic/eui"
import styled from "styled-components"

const LoginFormWrapper = styled.div`
  padding: 2rem;
`
const NeedAccountLink = styled.span`
  font-size: 0.8rem;
`

function LoginForm({ requestUserLogin }) {
  const {
    form,
    setForm,
    errors,
    setErrors,
    isLoading,
    getFormErrors,
    validateInput,
    handleInputChange,
    setHasSubmitted
  } = useLoginAndRegistrationForm({ isLogin: true })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // validate inputs before submitting
    Object.keys(form).forEach((label) => validateInput(label, form[label]))
    // if any input hasn't been entered in, return early
    if (!Object.values(form).every((value) => Boolean(value))) {
      setErrors((errors) => ({ ...errors, form: `You must fill out all fields.` }))
      return
    }

    setHasSubmitted(true)
    const action = await requestUserLogin({ email: form.email, password: form.password })
    // reset the password form state if the login attempt is not successful
    if (action?.type !== FETCHING_USER_FROM_TOKEN_SUCCESS) {
      setForm((form) => ({ ...form, password: "" }))
    }
  }

  return (
    <LoginFormWrapper>
      <EuiForm
        component="form"
        onSubmit={handleSubmit}
        isInvalid={Boolean(getFormErrors().length)}
        error={getFormErrors()}
      >
        <EuiFormRow
          label="Email"
          helpText="Enter the email associated with your account."
          isInvalid={Boolean(errors.email)}
          error={`Please enter a valid email.`}
        >
          <EuiFieldText
            icon="email"
            placeholder="user@gmail.com"
            value={form.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            aria-label="Enter the email associated with your account."
            isInvalid={Boolean(errors.email)}
          />
        </EuiFormRow>

        <EuiFormRow
          label="Password"
          helpText="Enter your password."
          isInvalid={Boolean(errors.password)}
          error={`Password must be at least 7 characters.`}
        >
          <EuiFieldPassword
            placeholder="••••••••••••"
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            type="dual"
            aria-label="Enter your password."
            isInvalid={Boolean(errors.password)}
          />
        </EuiFormRow>
        <EuiSpacer />
        <EuiButton type="submit" fill isLoading={isLoading}>
          Submit
        </EuiButton>
      </EuiForm>

      <EuiSpacer size="xl" />

      <NeedAccountLink>
        Need an account? Sign up <Link to="/registration">here</Link>.
      </NeedAccountLink>
    </LoginFormWrapper>
  )
}

export default connect(null, { requestUserLogin: authActions.requestUserLogin })(LoginForm)
