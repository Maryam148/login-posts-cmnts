import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CommentSection = ({ postId, comments = [], handleCreateComment, handleEditComment, handleDeleteComment }) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const authenticateUser = () => {
    setAuthenticated(true);
  };
  
    

  const handleAddComment = () => {
    if (!authenticated) {
      alert("Please sign up or log in to comment.");
      return;
    }
    else{
      handleCreateComment(postId, newComment);
      setNewComment('');
    }
  };

  const handleUpdateComment = (commentId) => {
    handleEditComment(postId, commentId, editingCommentText);
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleRemoveComment = (commentId) => {
    handleDeleteComment(postId, commentId);
  };

  return (
    <div>
    {authenticated?(<>
      {comments.map((comment) => (
        <div key={comment.id}>
          {editingCommentId === comment.id ? (
            <div>
              <input
                type="text"
                value={editingCommentText}
                onChange={(e) => setEditingCommentText(e.target.value)}
              />
              <button  className='save'onClick={() => handleUpdateComment(comment.id)}>Save</button>
              <button  className ='cancel'onClick={() => setEditingCommentId(null)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>{comment.body}</p>
              <button className= 'edit'onClick={() => setEditingCommentId(comment.id)}>Edit</button>
              <button className= 'del' onClick={() => handleRemoveComment(comment.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment"
      />
      <button  className= 'save'onClick={handleAddComment}>Add Comment</button>
    </>):(
      <button onClick={authenticateUser}>Sign Up / Log In to Comment</button>
    )}
      
    </div>
  );
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', body: '' });

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  const handleCreatePost = () => {
    axios.post('https://jsonplaceholder.typicode.com/posts', newPost)
      .then((response) => {
        setPosts([...posts, { ...response.data, comments: [] }]);
        setNewPost({ title: '', body: '' });
      })
      .catch((error) => {
        console.error('Error creating post:', error);
      });
  };

  const handleCreateComment = (postId, commentText) => {
    const newComment = {
      id: Date.now(),
      body: commentText,
    };
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        // Ensure that post.comments is properly initialized as an empty array
        const comments = post.comments || [];
        return {
          ...post,
          comments: [...comments, newComment],
        };
      }
      return post;
    });
    setPosts(updatedPosts);
  };
  
  const handleEditComment = (postId, commentId, updatedComment) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                body: updatedComment,
              };
            }
            return comment;
          }),
        };
      }
      return post;
    });
    setPosts(updatedPosts);
  }; 

  const handleDeleteComment = (postId, commentId) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { 
          ...post,
          comments: post.comments.filter((comment) => comment.id !== commentId),
        };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = posts.filter((post) => post.id !== postId);
    setPosts(updatedPosts);
  };

  return (
    <div>
      <h2>Posts</h2>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          <button className= 'del'onClick={() => handleDeletePost(post.id)}>Delete Post</button>
          <CommentSection
            postId={post.id}
            comments={post.comments}
            handleCreateComment={handleCreateComment}
            handleEditComment={handleEditComment}
            handleDeleteComment={handleDeleteComment}
          />
        </div>
      ))}
      <h3>Create New Post</h3>
      <input
        type="text"
        value={newPost.title}
        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        placeholder="Title"
      />
      <textarea
        value={newPost.body}
        onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
        placeholder="Content"
      />
      <button  className= 'create'onClick={handleCreatePost}>Create Post</button>
    </div>
  );
};

export default Posts;