/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import Button from './Button';

const CandidatesTab = () => {

  const [candidates, setCandidates] = useState([{
    id: 0,
    name: "John Carmack",
    email: "jc@gmail.com",
    exp: 4,
    status: "pending",
    listingId: 1
  }]);

  return (
    <div>
      <table className="w-[1500px] border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">ID</th>
          <th className="border border-gray-300 px-4 py-2">Name</th>
          <th className="border border-gray-300 px-4 py-2">Email</th>
          <th className="border border-gray-300 px-4 py-2">Years of Experience</th>
          <th className="border border-gray-300 px-4 py-2">Application Status</th>
          <th className="border border-gray-300 px-4 py-2">Job Listing</th>
          <th className="border border-gray-300 px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((candidate) => (
          <tr key={candidate.id} className="even:bg-gray-50">
            <td className="border border-gray-300 px-4 py-2">{candidate.id}</td>
            <td className="border border-gray-300 px-4 py-2">{candidate.name}</td>
            <td className="border border-gray-300 px-4 py-2">{candidate.email}</td>
            <td className="border border-gray-300 px-4 py-2">{candidate.exp}</td>
            <td className="border border-gray-300 px-4 py-2">{candidate.status}</td>
            <td className="border border-gray-300 px-4 py-2">{candidate.listingId}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}

export default CandidatesTab