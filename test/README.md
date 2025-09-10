tn# Testing Guide

This directory contains comprehensive tests for the MyBohra app, covering all critical functionality including MobX stores, React hooks, UI components, and utility functions.

## Test Structure

```
test/
├── components/          # UI component tests
├── helpers/            # Helper function tests
├── hooks/              # React hook tests
├── models/             # MobX store tests
├── mocks/              # Mock implementations
├── scripts/            # Test runner scripts
├── utils/              # Utility function tests
├── setup.ts            # Jest setup
├── setupAfterEnv.ts    # Jest setup after environment
└── README.md           # This file
```

## Test Categories

### 1. Unit Tests

- **Models**: MobX State Tree stores and models
- **Helpers**: Business logic and utility functions
- **Utils**: General utility functions

### 2. Integration Tests

- **Hooks**: React hooks that interact with stores
- **Services**: API and external service integrations

### 3. Component Tests

- **UI Components**: React Native component rendering and interactions
- **Screens**: Full screen component tests

## Running Tests

### Basic Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

### Specific Test Types

```bash
# Run only unit tests
yarn test test/models/ test/helpers/ test/utils/

# Run only integration tests
yarn test test/hooks/

# Run only component tests
yarn test test/components/

# Run specific test file
yarn test test/models/ReminderStore.test.ts
```

### Advanced Commands

```bash
# Run tests with verbose output
yarn test --verbose

# Run tests matching a pattern
yarn test --testNamePattern="should create reminder"

# Run tests in parallel
yarn test --maxWorkers=50%

# Run tests with specific timeout
yarn test --testTimeout=10000
```

## Test Configuration

### Jest Configuration

- **Preset**: `jest-expo` for React Native compatibility
- **Environment**: `jsdom` for DOM testing
- **Coverage**: 70% threshold for all metrics
- **Setup**: Custom setup files for mocking

### Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mocking Strategy

### Native Modules

- **AsyncStorage**: Mocked for storage operations
- **Push Notifications**: Mocked for notification testing
- **Location Services**: Mocked for location testing
- **Prayer Times**: Mocked for prayer time calculations

### External Libraries

- **Moment.js**: Mocked for consistent time testing
- **Fuse.js**: Mocked for search functionality
- **Haversine**: Mocked for distance calculations

## Writing Tests

### Test Structure

```typescript
describe("ComponentName", () => {
  describe("feature group", () => {
    it("should do something specific", () => {
      // Arrange
      const props = { ... }
      
      // Act
      const result = functionUnderTest(props)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### Best Practices

1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear sections
3. **Single Responsibility**: Each test should verify one thing
4. **Mock External Dependencies**: Use mocks for external services
5. **Test Edge Cases**: Include tests for error conditions
6. **Clean Up**: Reset mocks and state between tests

### MobX Testing

```typescript
import { getSnapshot } from "mobx-state-tree"

describe("Store", () => {
  let store: any

  beforeEach(() => {
    store = StoreModel.create(initialState)
  })

  it("should update state", () => {
    store.updateSomething(newValue)
    expect(store.something).toBe(newValue)
  })
})
```

### React Hook Testing

```typescript
import { renderHook, act } from "@testing-library/react-hooks"

describe("useCustomHook", () => {
  it("should return expected value", () => {
    const { result } = renderHook(() => useCustomHook())
    
    expect(result.current.value).toBe(expected)
  })
})
```

### Component Testing

```typescript
import { render, fireEvent } from "@testing-library/react-native"

describe("Component", () => {
  it("should handle user interaction", () => {
    const onPress = jest.fn()
    const { getByText } = render(<Component onPress={onPress} />)
    
    fireEvent.press(getByText("Button"))
    
    expect(onPress).toHaveBeenCalled()
  })
})
```

## Test Data

### Mock Data

- **Locations**: Predefined location objects for testing
- **Prayer Times**: Mock prayer time data
- **Reminders**: Sample reminder objects
- **Users**: Mock user data

### Test Utilities

- **renderWithProviders**: Custom render function with store context
- **createMockReminder**: Helper to create test reminders
- **waitFor**: Async test utility
- **mockAsyncStorage**: Storage mocking utilities

## Debugging Tests

### Common Issues

1. **Async Operations**: Use `await` and `act()` for async operations
2. **Mock Resets**: Clear mocks between tests
3. **State Isolation**: Ensure tests don't affect each other
4. **Timing Issues**: Use fake timers for time-dependent tests

### Debug Commands

```bash
# Run single test with debug output
yarn test --testNamePattern="specific test" --verbose

# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run tests with specific environment
yarn test --testEnvironment=node
```

## Continuous Integration

### GitHub Actions

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Scheduled runs

### Coverage Reports

- Coverage reports generated on CI
- Coverage badges in README
- Coverage thresholds enforced

## Performance Testing

### Test Performance

- Tests should run quickly (< 30 seconds total)
- Use parallel execution where possible
- Mock expensive operations

### Memory Usage

- Clean up resources after tests
- Avoid memory leaks in test setup
- Monitor test memory usage

## Troubleshooting

### Common Problems

1. **Import Errors**: Check module resolution in Jest config
2. **Mock Issues**: Ensure mocks are properly configured
3. **Async Issues**: Use proper async/await patterns
4. **State Issues**: Reset state between tests

### Getting Help

- Check Jest documentation
- Review existing test patterns
- Ask team members for guidance
- Create issues for test failures

## Contributing

### Adding New Tests

1. Create test file in appropriate directory
2. Follow existing naming conventions
3. Include comprehensive test cases
4. Update this README if needed

### Test Review Checklist

- [ ] Tests cover all code paths
- [ ] Edge cases are tested
- [ ] Mocks are properly configured
- [ ] Tests are readable and maintainable
- [ ] Coverage requirements are met
