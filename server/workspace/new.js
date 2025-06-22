function findSecondLargest(numbers) {
    if (numbers.length < 2) {
        return "Array should have at least 2 numbers";
    }

    // First reduce to find the largest number
    const largest = numbers.reduce((max, current) => 
        current > max ? current : max
    );

    // Second reduce to find the second largest
    const secondLargest = numbers.reduce((secondMax, current) => {
        if (current === largest) {
            return secondMax;
        }
        return current > secondMax ? current : secondMax;
    }, -Infinity);

    return secondLargest;
} , updated the code now