import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com/posts';

export default function PostApp() {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState('');
  const [editPostId, setEditPostId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Fetch Posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await axios.get(API_URL);
      return response.data;
    },
  });

  // Create Post
  const createPost = useMutation({
    mutationFn: async (newContent) => {
      const response = await axios.post(API_URL, { title: newContent, body: '', userId: 1 });
      return response.data;
    },
    onSuccess: (newPost) => {
      queryClient.setQueryData(['posts'], (oldPosts) => [...oldPosts, newPost]);
      setNewPost('');
    },
  });

  // Update Post
  const updatePost = useMutation({
    mutationFn: async ({ id, updatedContent }) => {
      const response = await axios.put(`${API_URL}/${id}`, { title: updatedContent });
      return response.data;
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(['posts'], (oldPosts) =>
        oldPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
      setEditPostId(null);
      setEditContent('');
    },
  });

  // Delete Post
  const deletePost = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['posts'], (oldPosts) =>
        oldPosts.filter((post) => post.id !== deletedId)
      );
    },
  });

  if (isLoading) return <p className="text-center text-gray-500">Loading posts...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">Post Manager</h1>
      <div className="mb-4">
        <input
          type="text"
          className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Write a new post..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 mt-2 w-full rounded-md"
          onClick={() => newPost && createPost.mutate(newPost)}
        >
          Add Post
        </button>
      </div>

      <ul>
        {posts?.map((post) => (
          <li key={post.id} className="border-b p-3 flex justify-between items-center bg-gray-100 rounded-md mb-2">
            {editPostId === post.id ? (
              <input
                type="text"
                className="border p-1 w-full rounded-md"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            ) : (
              <span className="font-semibold text-gray-700">{post.title}</span>
            )}

            <div>
              {editPostId === post.id ? (
                <button
                  className="bg-green-500 hover:bg-green-700 text-white p-2 rounded-md mx-1"
                  onClick={() => editContent && updatePost.mutate({ id: post.id, updatedContent: editContent })}
                >
                  Save
                </button>
              ) : (
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white p-2 rounded-md mx-1"
                  onClick={() => {
                    setEditPostId(post.id);
                    setEditContent(post.title);
                  }}
                >
                  Edit
                </button>
              )}

              <button
                className="bg-red-500 hover:bg-red-700 text-white p-2 rounded-md"
                onClick={() => deletePost.mutate(post.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
