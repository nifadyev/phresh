import React from "react"
import { CleaningJobsHome, CleaningJobView, NotFoundPage } from "../../components"
import { Routes, Route } from "react-router-dom"

export default function CleaningJobsPage() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CleaningJobsHome />} />
        <Route path=":cleaning_id/*" element={<CleaningJobView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
