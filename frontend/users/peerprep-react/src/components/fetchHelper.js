export async function fetchWithAuth(url, options = {}) {
  // Get the token from localStorage (or your preferred storage)
  const token = localStorage.getItem('token'); // Adjust this to your storage method

  // Set up headers with Authorization if the token exists
  const headers = {
    ...(token && { 'Authorization': `Bearer ${token}` }), // If token exists, copy the 'Authorization': `Bearer ${token}` to the header dict
    ...options.headers, // copy other headers to header dict
  };

  // Call fetch with the updated headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle response (you can add more error handling or processing as needed)
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json(); // Return the JSON body of the response
}
