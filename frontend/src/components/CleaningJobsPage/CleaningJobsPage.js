import React from "react"
import { Routes, Route } from "react-router-dom"
import { CleaningJobsHome, CleaningJobView, NotFoundPage } from "components"

export default function CleaningJobsPage() {
  return (
    <>
      <Routes>
        <Route path="/" element={<CleaningJobsHome />} />
        <Route path=":cleaningId/*" element={<CleaningJobView />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
