//From ChatGPT

// Define the Quick Sort function for sorting objects based on the 'urgency' attribute
function quickSortByUrgency(arr: { urgency: number }[]): { urgency: number }[] {
  if (arr.length <= 1) {
    return arr; // Base case: arrays with 0 or 1 element are already sorted
  }

  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex].urgency;

  // Partition the array into two sub-arrays
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) continue; // Skip the pivot element
    if (arr[i].urgency < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  // Recursively sort the sub-arrays and concatenate them with the pivot in between
  return [...quickSortByUrgency(left), { urgency: pivot }, ...quickSortByUrgency(right)];
}

