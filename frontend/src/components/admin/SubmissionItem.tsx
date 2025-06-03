import React, {  useState } from "react";
import { Submission } from "../../interfaces/Submission";
import { approveSubmission, rejectSubmission } from "../../api/adminApi";

interface SubmissionItemProps {
  submission: Submission;
  onSubmissionUpdated: (submission: Submission) => void;
}

const SubmissionItem: React.FC<SubmissionItemProps> = ({
  submission,
  onSubmissionUpdated,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // console.log("submission:", submission);
  // console.log("Submitted At:", submission.completedAt);
  
  const handleApprove = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Approving submission:", submission._id);
      const updatedSubmission = await approveSubmission(
        submission._id,
        feedback
      );
      console.log("Approval Response:", updatedSubmission);

      onSubmissionUpdated(updatedSubmission);
    } catch (err: any) {
      console.error("Approval Error:", err);
      setError(err?.message || "Failed to approve submission");
    } finally {
      setLoading(false);
    }
    window.location.reload()
  };

  const handleReject = async () => {
    if (!feedback.trim()) {
      setError("Feedback is required when rejecting a submission");
      return;
    }

    setLoading(true);
    try {
      const updatedSubmission = await rejectSubmission(
        submission._id,
        feedback
      );
      onSubmissionUpdated(updatedSubmission);
    } catch (err) {
      setError("Failed to reject submission");
      console.error(err);
    } finally {
      setLoading(false);
    }
    window.location.reload()
  };

  const submissionDate = submission.completedAt
    ? new Date(submission.completedAt).toLocaleString()
    : "Date Not Available";

  return (
    <div className="p-6 border-b border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-white text-lg">
            {submission.user?.username || "Unknown User"} -{" "}
            {submission.task?.title || "Unknown Task"}
          </h3>

          <p className="text-sm text-gray-400 mt-1">
            Submitted on {submissionDate}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expanded ? "Hide" : "View"}
        </button>
      </div>
      {expanded && (
        <div className="mt-6">
          {/* Display Submission Image */}
          {submission.image && (
            <div className="mb-6">
              <h4 className="font-medium mb-3 text-gray-300">
                Submitted Image:
              </h4>
              <img
                src={submission.image}
                alt="Submission"
                className="w-full max-w-md rounded-lg border border-gray-700"
              />
            </div>
          )}

          {/* Submission Content */}
          <div className="bg-gray-800 p-4 rounded-md mb-6 border border-gray-700">
            <h4 className="font-medium mb-3 text-gray-300">
              Submission Content:
            </h4>
            <div className="whitespace-pre-wrap text-white">
              {submission.submissionContent}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 text-red-300 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Feedback Section */}
          <div className="mb-6">
            <label className="block mb-2 text-gray-300">
              Feedback (required for rejection):
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:border-gray-600"
              placeholder="Provide feedback to the user..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="bg-gray-700 text-green-400 px-5 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors border border-green-700"
            >
              {loading ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="bg-gray-700 text-red-400 px-5 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors border border-red-700"
            >
              {loading ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionItem;
