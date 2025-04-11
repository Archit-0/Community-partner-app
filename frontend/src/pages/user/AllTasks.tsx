import { useEffect, useState } from "react";
import { LINK } from "../../constant";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Task {
  _id: string;
  title: string;
  description: string;
  points: number;
  createdBy?: { username: string };
  createdAt: string;
}

const userStr = localStorage.getItem("user");

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${LINK}/api/tasks`);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskClick = async(task: Task) => {
    let taskId=task["_id"]
    try{
      const response = await fetch(`${LINK}/api/user/profile`, {
        method: "POST",
        body: JSON.stringify({ userId: JSON.parse(userStr!=null?userStr:"")["_id"] }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json()
      
      if (data[taskId]) {

        alert(`Task Status: ${data[taskId]}`);
        return
        // console.log(tasks)
        // let taskCopy: any= []
        // tasks.forEach((ele)=>{
        //   if (ele["_id"]!=taskId){
        //     console.log(ele)
        //     taskCopy.push(ele)
        //   }
        // })
        // setTasks(taskCopy)
        // navigate("/auth/dashboard");
      }


    }catch(err){
      console.error("Error",err)
    }
    setSelectedTask(task);
    setImage(null); // Reset image when selecting new task
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation
      if (!file.type.match("image.*")) {
        alert("Please select an image file (JPEG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImage(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log("Starting file upload:", file.name, file.type, file.size);

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${LINK}/api/upload/image`, {
        method: "POST",
        credentials: "include", // Add credentials to include cookies
        body: formData,
      });

      const data = await response.json();
      console.log("Upload Response:", data);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Upload failed");
      }

      if (!data.url) {
        throw new Error("No URL returned from server");
      }

      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown upload error";
      throw new Error(`Upload failed: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask || !image) {
      alert("Please select a task and upload an image");
      return;
    }

    setUploading(true);
    let imageUrl = "";

    try {
      // Display upload status
      console.log("Starting task submission process...");

      // 1. Upload image
      try {
        imageUrl = await uploadImage(image);
        console.log("Image upload successful:", imageUrl);
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        throw uploadError; // Rethrow to be caught by outer catch
      }

      // 2. Submit task with image URL
      console.log("Submitting task with image:", imageUrl);
      const submissionResponse = await fetch(
        `${LINK}/api/user/tasks/${selectedTask._id}/complete`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        }
      );

      const submissionData = await submissionResponse.json();

      if (!submissionResponse.ok) {
        throw new Error(submissionData.message || "Failed to submit task");
      }

      // 3. On success - show alert and redirect
      alert("Task submitted successfully! Redirecting to dashboard...");
      navigate("/auth/dashboard");
    } catch (error) {
      console.error("Submission error:", error);

      // Improved error display
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Error: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="glass-container p-8 rounded-lg mb-6">
          <h2 className="text-3xl font-bold text-center mb-8 neon-text">
            Available Tasks
          </h2>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-white p-4 rounded-lg text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleTaskClick(task)}
                  className="glow-card p-5 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                  <p className="text-gray-400 line-clamp-3 mb-4">
                    {task.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm border border-blue-800/50">
                      {task.points} pts
                    </span>
                    <span className="text-sm text-gray-500">
                      {task.createdBy?.username || "System"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="glass-container p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setSelectedTask(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-2 neon-text">
              {selectedTask.title}
            </h2>
            <p className="text-gray-300 mb-4">{selectedTask.description}</p>

            <div className="bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-800/50 inline-block mb-4">
              <span className="font-semibold text-blue-300">
                {selectedTask.points} Points
              </span>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Proof (Image)
              </label>

              <div className="border-2 border-dashed border-gray-700 rounded-lg p-2">
                <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors">
                  {image ? (
                    <div className="relative w-full h-full">
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-3">
                      <svg
                        className="w-8 h-8 mb-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-400">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPEG, PNG (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-gray-700 rounded-md text-gray-300 hover:bg-gray-800"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!image || uploading}
                className={`glow-button ${
                  !image || uploading
                    ? "opacity-50 cursor-not-allowed"
                    : "green"
                } px-4 py-2 rounded-md`}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Task"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
