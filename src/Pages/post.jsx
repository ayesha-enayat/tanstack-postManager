import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Fetch Posts
const getAllPostFromAPI = async () => {
  const response = await fetch("https://dummyjson.com/posts");
  if (!response.ok) throw new Error("Failed to fetch posts");
  const data = await response.json();
  return data.posts;
};

const Post = () => {
  const queryClient = useQueryClient();

  // Fetch posts using useQuery
  const { data: posts = [], isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: getAllPostFromAPI,
  });

  // Mutations for CRUD operations
  const deletePostMutation = useMutation({
    mutationFn: (id) =>
      new Promise((resolve) => {
        setTimeout(() => resolve(id), 500); // Simulating API request delay
      }),
    onSuccess: (id) => {
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.filter((post) => post.id !== id)
      );
      Swal.fire("Deleted!", "Your post has been deleted.", "success");
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (newPost) =>
      new Promise((resolve) => {
        setTimeout(() => resolve(newPost), 500);
      }),
    onSuccess: (newPost) => {
      queryClient.setQueryData(["posts"], (oldPosts) => [...oldPosts, newPost]);
      Swal.fire("Post Created!", "Your new post has been added.", "success");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, newTitle, newDescription }) =>
      new Promise((resolve) => {
        setTimeout(() => resolve({ id, newTitle, newDescription }), 500);
      }),
    onSuccess: ({ id, newTitle, newDescription }) => {
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.map((post) =>
          post.id === id ? { ...post, title: newTitle, body: newDescription } : post
        )
      );
      Swal.fire("Updated!", "Your post has been updated successfully.", "success");
    },
  });

  const [editingPost, setEditingPost] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");

  if (isLoading) return <div className="text-center text-2xl">Loading posts...</div>;
  if (isError) return <div className="text-center text-2xl text-red-500">Error fetching posts.</div>;

  return (
    <>
      <div className="text-center text-4xl mt-4 font-bold text-gray-800">Post Manager</div>

      {/* Create Post Section */}
      <div className="p-5 mt-5 bg-gray-100 shadow-md rounded-lg max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Enter Title"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          placeholder="Enter Description"
          value={postDescription}
          onChange={(e) => setPostDescription(e.target.value)}
          className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
          rows="3"
        />
        <button
          onClick={() => {
            if (!postTitle || !postDescription) {
              Swal.fire({ icon: "error", title: "Oops...", text: "Title and Description are required!" });
              return;
            }
            createPostMutation.mutate({
              id: posts.length + 101, 
              title: postTitle,
              body: postDescription,
            });
            setPostTitle("");
            setPostDescription("");
          }}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-xl w-full"
        >
          Create Post
        </button>
      </div>

      {/* Display Posts */}
      <div className="mt-5 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800">All Posts</h2>
        {posts.map(({ title, id, body }) => (
          <div className="bg-white shadow-lg p-4 m-2 border rounded-lg transition hover:shadow-xl" key={id}>
            <div className="font-bold text-xl text-blue-700">Post #{id}</div>

            {editingPost === id ? (
              <>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border p-2 rounded w-full mb-2 focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                  rows="3"
                />
              </>
            ) : (
              <>
                <h1 className="text-lg font-semibold text-gray-800">Title: {title}</h1>
                <p className="text-gray-600">{body}</p>
              </>
            )}

            <div className="mt-3 flex gap-2">
              {editingPost === id ? (
                <button
                  onClick={() => {
                    updatePostMutation.mutate({ id, newTitle, newDescription });
                    setEditingPost(null);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingPost(id);
                    setNewTitle(title);
                    setNewDescription(body);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => deletePostMutation.mutate(id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Post;
