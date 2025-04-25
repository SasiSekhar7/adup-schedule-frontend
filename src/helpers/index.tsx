
import moment from 'moment'

export function formatDateWithOrdinal(dateString: string): string {
    if (!dateString) return "Invalid Date";
  
    return moment(dateString).format("Do MMMM YYYY"); // "28th June 2025"
  }

  export function getRole(): string | null {
    const token = sessionStorage.getItem('token');
  
    if (!token) {
      return null; // Or handle the case where there's no token differently
    }
  
    try {
      // JWT structure: Header.Payload.Signature (Base64 encoded)
      const base64Payload = token.split('.')[1];
  
      // Base64 decode the payload
      const jsonPayload = atob(base64Payload);
  
      // Parse the JSON payload
      const payload = JSON.parse(jsonPayload);
  
      // Assuming your role is stored in a 'role' claim in the payload
      return payload.role || null; // Return the role, or null if it's not present
    } catch (error) {
      console.error("Error decoding or parsing JWT:", error);
      return null; // Or handle the error as needed
    }
  }