#ifndef STACK_HPP
#define STACK_HPP

#include <iostream>
#include <vector>

class Stack {
private:
    std::vector<int> data;
    int capacity;

public:
    explicit Stack(int maxCapacity = 5)
        : capacity(maxCapacity > 0 ? maxCapacity : 5) {}

    bool isEmpty() const {
        return data.empty();
    }

    bool isFull() const {
        return static_cast<int>(data.size()) >= capacity;
    }

    int size() const {
        return static_cast<int>(data.size());
    }

    int getCapacity() const {
        return capacity;
    }

    void setCapacity(int maxCapacity) {
        if (maxCapacity > 0) {
            capacity = maxCapacity;
            if (static_cast<int>(data.size()) > capacity) {
                data.resize(capacity);
            }
        }
    }

    bool push(int value) {
        if (isFull()) {
            return false;
        }

        data.push_back(value);
        return true;
    }

    bool pop() {
        if (isEmpty()) {
            return false;
        }

        data.pop_back();
        return true;
    }

    bool peek(int& result) const {
        if (isEmpty()) {
            return false;
        }

        result = data.back();
        return true;
    }

    const std::vector<int>& getData() const {
        return data;
    }

    void setData(const std::vector<int>& elements) {
        data.clear();
        for (int val : elements) {
            if (static_cast<int>(data.size()) < capacity) {
                data.push_back(val);
            }
        }
    }
};

#endif // STACK_HPP
