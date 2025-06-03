import React, { useState, useEffect } from "react";
import { Submission } from "../../interfaces/Submission";
import { getPendingSubmissions } from "../../api/adminApi";
import SubmissionItem from "./SubmissionItem";

const SubmissionList: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSubmissions = async () => {
    try {
      const data = await getPendingSubmissions();
      setSubmissions(data);
    } catch (err) {
      setError("Failed to load submissions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmissionUpdated = (updatedSubmission: Submission) => {
    setSubmissions(
      submissions.filter((sub) => sub._id !== updatedSubmission._id)
    );
  };

  if (loading)
    return (
      <div className="text-center p-4 text-gray-300">
        Loading submissions...
      </div>
    );

  return (
    <div>
      <div className="p-4 border-b border-gray-800 mb-4">
        <h2 className="text-xl font-bold text-white">Pending Submissions</h2>
      </div>

      {error && (
        <div className="bg-red-900 text-red-300 p-4 mb-4 rounded-md">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="p-6 text-center text-gray-400">
          No pending submissions found.
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {submissions.map((submission) => (
            <SubmissionItem
              key={submission._id}
              submission={submission}
              onSubmissionUpdated={handleSubmissionUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};
export default SubmissionList;
