# Contributing to SpeechLab Plugin

Thank you for your interest in contributing to the SpeechLab plugin for ElizaOS! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by the ElizaOS Code of Conduct. Please be respectful and constructive in all interactions.

## 🐛 Reporting Issues

1. Check existing issues to avoid duplicates
2. Use the issue templates when available
3. Provide clear reproduction steps
4. Include relevant logs and error messages
5. Specify your environment (OS, Node version, etc.)

## 💡 Suggesting Features

1. Open an issue with the "enhancement" label
2. Clearly describe the feature and its benefits
3. Provide use cases and examples
4. Be open to discussion and feedback

## 📝 Pull Request Process

### Before You Start

1. Fork the repository
2. Create a new branch from `main`
3. Use descriptive branch names (e.g., `fix/auth-error`, `feature/batch-processing`)

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/eliza.git
cd eliza/packages/plugin-speechlab

# Install dependencies
npm install

# Run tests
npm test

# Build the plugin
npm run build
```

### Making Changes

1. Write clean, readable code
2. Follow existing code style
3. Add tests for new functionality
4. Update documentation as needed
5. Ensure all tests pass
6. Run linting and type checking

### Commit Guidelines

Use conventional commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or changes
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

Example:
```
feat: add support for batch audio processing
fix: handle 401 errors with token refresh
docs: update usage examples for v2 API
```

### Submitting Your PR

1. Push your branch to your fork
2. Open a PR against the `main` branch
3. Fill out the PR template completely
4. Link related issues
5. Wait for review and address feedback

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test src/index.test.ts
```

### Writing Tests

- Test file names should end with `.test.ts`
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Aim for good test coverage

Example test:
```typescript
describe('createDubbingProject', () => {
  it('should create project with valid parameters', async () => {
    // Test implementation
  });
  
  it('should handle authentication errors', async () => {
    // Test implementation
  });
});
```

## 📚 Documentation

- Update README.md for user-facing changes
- Update USAGE.md for new features or options
- Add JSDoc comments for public APIs
- Include code examples where helpful

## 🔧 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Prefer async/await over promises
- Handle errors appropriately

### API Design

- Keep the public API simple and intuitive
- Maintain backward compatibility
- Use clear, descriptive names
- Provide sensible defaults
- Document all options

### Performance

- Avoid unnecessary API calls
- Implement proper caching
- Use efficient data structures
- Consider rate limits
- Test with large datasets

## 🚀 Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release PR
4. After merge, tag the release
5. Publish to npm

## 📮 Getting Help

- Join the ElizaOS Discord server
- Check the documentation
- Ask questions in GitHub Discussions
- Contact the maintainers

## 🙏 Recognition

Contributors will be recognized in:
- The project README
- Release notes
- The ElizaOS contributors page

Thank you for contributing to the SpeechLab plugin!