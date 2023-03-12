import React from "react"
import { useAuthenticatedUser } from "hooks/auth/useAuthenticatedUser"
import {
  EuiAvatar,
  EuiIcon,
  EuiHeader,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderSectionItemButton,
  EuiHeaderLinks,
  EuiHeaderLink,
  EuiPopover,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink
} from "@elastic/eui"
import { UserAvatar } from "components"
import { Link, useNavigate } from "react-router-dom"
import loginIcon from "assets/img/loginIcon.svg"
import styled from "styled-components"

const LogoSection = styled(EuiHeaderLink)`
  padding: 0 2rem;
`

const AvatarMenu = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 300px;

  & .avatar-actions {
    margin-left: 2rem;
  }
`

export default function Navbar() {
  const navigate = useNavigate()
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false)
  const { user, logUserOut } = useAuthenticatedUser()

  const toggleAvatarMenu = () => setAvatarMenuOpen(!avatarMenuOpen)

  const closeAvatarMenu = () => setAvatarMenuOpen(false)

  const handleLogout = () => {
    closeAvatarMenu()
    logUserOut()
    navigate("/")
  }

  const avatarButton = (
    <EuiHeaderSectionItemButton
      aria-label="User avatar"
      onClick={() => user?.profile && toggleAvatarMenu()}
    >
      {user?.profile ? (
        <UserAvatar size="l" user={user} initialsLength={2} />
      ) : (
        <Link to="/login">
          <EuiAvatar size="l" color="#1E90FF" name="user" imageUrl={loginIcon} />
        </Link>
      )}
    </EuiHeaderSectionItemButton>
  )

  const renderAvatarMenu = () => {
    if (!user?.profile) return null

    return (
      <AvatarMenu>
        <UserAvatar size="xl" user={user} initialsLength={2} />
        <EuiFlexGroup direction="column" className="avatar-actions">
          <EuiFlexItem grow={1}>
            <p>
              {user.email} - {user.username}
            </p>
          </EuiFlexItem>

          <EuiFlexItem grow={1}>
            <EuiFlexGroup justifyContent="spaceBetween">
              <EuiFlexItem grow={1}>
                <Link to="/profile">Profile</Link>
              </EuiFlexItem>
              <EuiFlexItem grow={1}>
                <EuiLink onClick={() => handleLogout()}>Log out</EuiLink>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      </AvatarMenu>
    )
  }

  return (
    <EuiHeader>
      <EuiHeaderSection>
        <EuiHeaderSectionItem border="right">
          <LogoSection href="/">
            <EuiIcon type="cloudDrizzle" color="#1E90FF" size="l" /> Phresh
          </LogoSection>
        </EuiHeaderSectionItem>
        <EuiHeaderSectionItem border="right">
          <EuiHeaderLinks aria-label="app navigation links">
            <EuiHeaderLink iconType="tear" href="#">
              Find Cleaners
            </EuiHeaderLink>

            <EuiHeaderLink iconType="tag" onClick={() => navigate("/cleaning-jobs")}>
              Find Jobs
            </EuiHeaderLink>

            <EuiHeaderLink iconType="help" href="#">
              Help
            </EuiHeaderLink>
          </EuiHeaderLinks>
        </EuiHeaderSectionItem>
      </EuiHeaderSection>

      <EuiHeaderSection>
        <EuiPopover
          id="avatar-menu"
          isOpen={avatarMenuOpen}
          closePopover={closeAvatarMenu}
          anchorPosition="downRight"
          button={avatarButton}
          panelPaddingSize="l"
        >
          {renderAvatarMenu()}
        </EuiPopover>
      </EuiHeaderSection>
    </EuiHeader>
  )
}
