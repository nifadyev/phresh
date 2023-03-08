import React from "react"
import {
  EuiBadge,
  EuiButton,
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiSpacer,
  EuiLoadingChart
} from "@elastic/eui"
import styled from "styled-components"

const ImageHolder = styled.div`
  min-width: 400px;
  min-height: 200px;

  & > img {
    position: relative;
    z-index: 2;
  }
`

const cleaningTypeToDisplayNameMapping = {
  dust_up: "Dust Up",
  spot_clean: "Spot Clean",
  full_clean: "Full Clean"
}

export default function CleaningJobCard({ cleaningJob }) {
  const image = (
    <ImageHolder>
      <EuiLoadingChart size="xl" style={{ position: "absolute", zIndex: 1 }} />
      <img src="https://source.unsplash.com/400x200/?Soap" alt="Cleaning Job Cover" />
    </ImageHolder>
  )

  const title = (
    <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
      <EuiFlexItem grow={false}>{cleaningJob.name}</EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiBadge color="secondary">
          {cleaningTypeToDisplayNameMapping[cleaningJob.cleaning_type]}
        </EuiBadge>
      </EuiFlexItem>
    </EuiFlexGroup>
  )

  const footer = (
    <>
      <EuiSpacer />
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="flexEnd">
        <EuiFlexItem grow={false}>
          <EuiText>Hourly Rate: ${cleaningJob.price}</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton>Offer Services</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  )

  return (
    <EuiCard
      display="plain"
      textAlign="left"
      image={image}
      title={title}
      description={cleaningJob.description}
      footer={footer}
    />
  )
}
