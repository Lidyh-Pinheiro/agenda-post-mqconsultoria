
// This file handles all data operations, using localStorage as the storage mechanism

// Function to save posts to localStorage as a fallback
export const savePostsToLocalStorage = (posts, clientId) => {
  try {
    // Get existing posts from localStorage
    const existingPostsJSON = localStorage.getItem('calendarPosts');
    let existingPosts = [];
    
    if (existingPostsJSON) {
      existingPosts = JSON.parse(existingPostsJSON);
      
      // Remove any posts for this client (to update them)
      existingPosts = existingPosts.filter(post => post.clientId !== clientId);
    }
    
    // Add the new/updated posts for this client
    const updatedPosts = [...existingPosts, ...posts];
    
    // Save back to localStorage
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    
    return true;
  } catch (error) {
    console.error('Error saving posts to localStorage:', error);
    return false;
  }
};

// Function to get posts from localStorage by clientId
export const getPostsFromLocalStorage = (clientId) => {
  try {
    const postsJSON = localStorage.getItem('calendarPosts');
    if (!postsJSON) return [];
    
    const allPosts = JSON.parse(postsJSON);
    return allPosts.filter(post => post.clientId === clientId);
  } catch (error) {
    console.error('Error getting posts from localStorage:', error);
    return [];
  }
};

// Function to get all posts from localStorage
export const getAllPostsFromLocalStorage = () => {
  try {
    const postsJSON = localStorage.getItem('calendarPosts');
    if (!postsJSON) return [];
    
    return JSON.parse(postsJSON);
  } catch (error) {
    console.error('Error getting all posts from localStorage:', error);
    return [];
  }
};

// Function to save a single post to localStorage
export const savePostToLocalStorage = (post) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    
    // Check if post already exists (by id)
    const existingPostIndex = allPosts.findIndex(p => p.id === post.id);
    
    if (existingPostIndex >= 0) {
      // Update existing post
      allPosts[existingPostIndex] = post;
    } else {
      // Add new post
      allPosts.push(post);
    }
    
    localStorage.setItem('calendarPosts', JSON.stringify(allPosts));
    return true;
  } catch (error) {
    console.error('Error saving post to localStorage:', error);
    return false;
  }
};

// Function to delete a post from localStorage
export const deletePostFromLocalStorage = (postId) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const filteredPosts = allPosts.filter(post => post.id !== postId);
    localStorage.setItem('calendarPosts', JSON.stringify(filteredPosts));
    return true;
  } catch (error) {
    console.error('Error deleting post from localStorage:', error);
    return false;
  }
};

// Function to update post completion status
export const updatePostCompletionStatus = (postId, completed) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        return { ...post, completed };
      }
      return post;
    });
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    return true;
  } catch (error) {
    console.error('Error updating post completion status:', error);
    return false;
  }
};

// Function to update post notes
export const updatePostNotes = (postId, notes) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        return { ...post, notes };
      }
      return post;
    });
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    return true;
  } catch (error) {
    console.error('Error updating post notes:', error);
    return false;
  }
};

// Function to update post content
export const updatePostContent = (postId, updates) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        return { ...post, ...updates };
      }
      return post;
    });
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    return true;
  } catch (error) {
    console.error('Error updating post content:', error);
    return false;
  }
};

// Function to add image to post
export const addImageToPost = (postId, imageUrl) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        const currentImages = post.images || [];
        return { ...post, images: [...currentImages, imageUrl] };
      }
      return post;
    });
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    return true;
  } catch (error) {
    console.error('Error adding image to post:', error);
    return false;
  }
};

// Function to remove image from post
export const removeImageFromPost = (postId, imageUrl) => {
  try {
    const allPosts = getAllPostsFromLocalStorage();
    const updatedPosts = allPosts.map(post => {
      if (post.id === postId) {
        const filteredImages = (post.images || []).filter(img => img !== imageUrl);
        return { ...post, images: filteredImages };
      }
      return post;
    });
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    return true;
  } catch (error) {
    console.error('Error removing image from post:', error);
    return false;
  }
};

// Mock Supabase interface to be compatible with existing code
export const supabase = {
  from: (table) => {
    return {
      select: (columns) => {
        return {
          eq: (column, value) => {
            return {
              data: getAllPostsFromLocalStorage().filter(post => post.clientId === value),
              error: null
            };
          },
          single: () => {
            return { data: null, error: null };
          }
        };
      },
      insert: (data) => {
        // For simplicity, we'll add an id if one is not provided
        if (!data.id) {
          data.id = Date.now().toString();
        }
        // Convert client_id to clientId for our localStorage format
        if (data.client_id) {
          data.clientId = data.client_id;
        }
        // Convert day_of_week to dayOfWeek for our localStorage format
        if (data.day_of_week) {
          data.dayOfWeek = data.day_of_week;
        }
        // Convert post_type to postType for our localStorage format
        if (data.post_type) {
          data.postType = data.post_type;
        }
        
        const success = savePostToLocalStorage(data);
        return {
          data: success ? data : null,
          error: success ? null : new Error('Failed to insert data')
        };
      },
      update: (data) => {
        return {
          eq: (column, value) => {
            const allPosts = getAllPostsFromLocalStorage();
            const post = allPosts.find(p => p[column] === value);
            
            if (post) {
              const updatedPost = { ...post, ...data };
              const success = savePostToLocalStorage(updatedPost);
              
              return {
                data: success ? updatedPost : null,
                error: success ? null : new Error('Failed to update data')
              };
            }
            
            return {
              data: null,
              error: new Error('Post not found')
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (column, value) => {
            const success = deletePostFromLocalStorage(value);
            return {
              data: success ? { id: value } : null,
              error: success ? null : new Error('Failed to delete data')
            };
          }
        };
      }
    };
  },
  storage: {
    from: (bucket) => {
      return {
        upload: (path, file) => {
          // For this mock implementation, we'll use Data URLs to simulate file uploads
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                data: { path },
                error: null
              });
            };
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl: (path) => {
          // This would normally return a URL to the file, but for our mock,
          // we'll just return the path itself
          return {
            data: {
              publicUrl: `data:image/placeholder;base64,${path}`
            }
          };
        },
        remove: (paths) => {
          // Mock successful removal
          return {
            data: { paths },
            error: null
          };
        }
      };
    }
  }
};

// These functions are now stubs that pretend to check Supabase status
export const checkSupabaseTables = async () => {
  console.warn('Using localStorage instead of Supabase');
  return true;
};

export const ensureStorageBucketExists = async () => {
  console.warn('Using localStorage instead of Supabase storage');
  return true;
};
