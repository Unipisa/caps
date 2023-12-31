 function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleString(navigator.language);
 }
 
 export { formatDate };