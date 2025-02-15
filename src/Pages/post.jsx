import { useState, useEffect } from "react";
import Swal from "sweetalert2"; // Import SweetAlert2

const getAllPostFromAPI = async () => {
  try {
    const response = await fetch("https://dummyjson.com/posts");
    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }
    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const Post = () => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await getAllPostFromAPI();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPosts(posts.filter((post) => post.id !== id));
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
      }
    });
  };

  const handleEdit = (id, currentTitle, currentDescription) => {
    setEditingPost(id);
    setNewTitle(currentTitle);
    setNewDescription(currentDescription);
  };

  const handleUpdate = (id) => {
    const updatedPosts = posts.map((post) =>
      post.id === id ? { ...post, title: newTitle, body: newDescription } : post
    );
    setPosts(updatedPosts);
    setEditingPost(null);
    Swal.fire("Updated!", "Your post has been updated successfully.", "success");
  };

  const handleCreatePost = () => {
    if (!postTitle || !postDescription) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Title and Description are required!",
      });
      return;
    }

    const newPost = {
      id: posts.length + 101, // Unique ID for new posts
      title: postTitle,
      body: postDescription,
    };

    setPosts([...posts, newPost]);
    setPostTitle("");
    setPostDescription("");

    Swal.fire({
      icon: "success",
      title: "Post Created!",
      text: "Your new post has been added successfully.",
    });
  };

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
          onClick={handleCreatePost}
          className="rounded-lg px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white text-xl w-full"
        >
          Create Post
        </button>
      </div>

      {/* Display Posts */}
      <div className="mt-5 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800">All Posts</h2>
        {posts.map(({ title, id, body }) => (
          <div
            className="bg-white shadow-lg p-4 m-2 border rounded-lg transition hover:shadow-xl"
            key={id}
          >
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
                  onClick={() => handleUpdate(id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(id, title, body)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(id)}
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
