import React from "react"
import { useAuthenticatedUser } from "hooks/auth/useAuthenticatedUser"
import {
  EuiHorizontalRule,
  EuiIcon,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiText
} from "@elastic/eui"
import { UserAvatar } from "components"
import moment from "moment"
import styled from "styled-components"

const StyledEuiPage = styled(EuiPage)`
  flex: 1;
`
const StyledEuiPageHeader = styled(EuiPageHeader)`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem;

  & h1 {
    font-size: 3.5rem;
  }
`
const StyledEuiPageContentBody = styled(EuiPageContentBody)`
  display: flex;
  flex-direction: column;
  align-items: center;

  & h2 {
    margin-bottom: 1rem;
  }
`

export default function ProfilePage() {
  const { user } = useAuthenticatedUser()
  return (
    <StyledEuiPage>
      <EuiPageBody component="section">
        <StyledEuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Profile</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </StyledEuiPageHeader>
        <EuiPageContent verticalPosition="center" horizontalPosition="center">
          <StyledEuiPageContentBody>
            <UserAvatar size="xl" user={user} initialsLength={2} />
            <EuiTitle size="l">
              <h2>@{user?.username}</h2>
            </EuiTitle>
            <EuiText>
              <p>
                <EuiIcon type="email" /> {user.email}
              </p>
              <p>
                <EuiIcon type="clock" /> member since {moment(user.created_at).format("MM-DD-YYYY")}
              </p>
              <p>
                <EuiIcon type="alert" />{" "}
                {user.profile.full_name ? user.profile.full_name : "Full name not specified"}
              </p>
              <p>
                <EuiIcon type="number" />{" "}
                {user.profile.phone_number ? user.profile.phone_number : "No phone number added"}
              </p>
              <EuiHorizontalRule />
              <p>
                <EuiIcon type="quote" />{" "}
                {user.profile.bio ? user.profile.bio : "This user hasn't written a bio yet"}
              </p>
            </EuiText>
          </StyledEuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </StyledEuiPage>
  )
}
