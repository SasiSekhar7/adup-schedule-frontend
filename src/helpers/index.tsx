
import moment from 'moment'

export function formatDateWithOrdinal(dateString: string): string {
    if (!dateString) return "Invalid Date";
  
    return moment(dateString).format("Do MMMM YYYY"); // "28th June 2025"
  }