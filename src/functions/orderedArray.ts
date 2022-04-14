export function compare<T>(a: T, b: T) {
    if (a > b) {
        return 1
    } else if (b > a) {
        return -1
    } else {
        return 0
    }
}


export function find<T>(array: T[], item: T, compareFunction: (_a: T, _b: T) => number = compare): boolean {
    let start = 0, end = array.length - 1

    while (start <= end) {
        let mid = Math.floor((start + end) / 2)
        let comparison = compareFunction(array[mid], item)
        if (comparison === 0) {
            return true
        } else if (comparison < 0)
            start = mid + 1
        else
            end = mid - 1
    }
    return false
}

export function indexOf<T>(array: T[], item: T, compareFunction: (_a: T, _b: T) => number = compare) {
    let start = 0, end = array.length - 1

    while (start <= end) {
        let mid = Math.floor((start + end) / 2)
        let comparison = compareFunction(array[mid], item)
        if (comparison === 0) {
            return mid
        } else if (comparison < 0)
            start = mid + 1
        else
            end = mid - 1
    }
    return -1
}

export function indexOfFirstGreaterThan<T>(array: T[], item: T, compareFunction: (_a: T, _b: T) => number = compare) {
    let start = 0, end = array.length - 1

    while (start <= end) {
        let mid = Math.floor((start + end) / 2)
        if (compareFunction(array[mid], item) === 1)
            end = mid - 1
        else
            start = mid + 1
    }
    if (start > array.length - 1) {
        return -1
    } else {
        return start
    }
}

export function orderedArraySetAdd<T>(array: T[], item: T, compareFunction: (_a: T, _b: T) => number = compare) {
    let start = 0, end = array.length - 1

    while (start <= end) {
        let mid = Math.floor((start + end) / 2)
        let comparison = compareFunction(array[mid], item)
        if (comparison === 0) {
            return array
        } else if (comparison > 0)
            end = mid - 1
        else
            start = mid + 1
    }

    if (start > array.length - 1) {
        return [...array, item]
    } else if (start === 0) {
        return [item, ...array]
    } else {
        return [...array.slice(0, start), item, ...array.slice(start)]
    }
}

export function orderedArraySetRemove<T>(array: T[], item: T, compareFunction: (_a: T, _b: T) => number = compare) {
    let index = indexOf(array, item, compareFunction)
    if (index === -1) {
        return array
    } else {
        if (index === 0) {
            return array.slice(1)
        } else if (index === array.length - 1) {
            return array.slice(0, array.length - 1)
        } else {
            return [...array.slice(0, index), ...array.slice(index + 1)]
        }
    }
}