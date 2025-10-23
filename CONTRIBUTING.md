# Contributing to BharatMesh

Thank you for your interest in contributing to BharatMesh! This document provides guidelines and instructions for contributors.

## 🤝 How to Contribute

### 1. Fork and Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/bharatmesh.git
cd bharatmesh
```

### 2. Set Up Development Environment
```bash
# Install dependencies
npm install --workspaces

# Set up environment variables
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

cd ../frontend
cp .env.example .env
# Edit .env with your API URL
```

### 3. Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:5001
npm run dev:frontend # Frontend on http://localhost:5173
```

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Use TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use camelCase for variables, PascalCase for components

### Project Structure
```
bharatmesh/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript UI
├── shared/           # Shared TypeScript types
└── package.json      # Root package.json
```

### Git Workflow
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 📝 Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(auth): add phone number validation
fix(billing): resolve GST calculation error
docs(readme): update installation instructions
style(ui): improve button hover effects
refactor(api): simplify user authentication
test(auth): add unit tests for login
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Guidelines
- Write unit tests for new functions
- Add integration tests for API endpoints
- Test error handling scenarios
- Ensure tests pass before submitting PR

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, Node.js version, browser
6. **Screenshots**: If applicable

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., Windows 10, macOS 12, Ubuntu 20.04]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 91, Firefox 89]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

When requesting features, please include:

1. **Problem**: What problem does this solve?
2. **Solution**: Describe your proposed solution
3. **Alternatives**: Any alternative solutions considered
4. **Use Case**: Who would benefit from this feature?

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Problem
What problem does this feature solve?

## Proposed Solution
Describe your proposed solution

## Use Case
Who would benefit from this feature?

## Additional Context
Any other context or screenshots
```

## 🎯 Areas for Contribution

### High Priority
- **Billing Module**: Complete invoice creation UI
- **Inventory Module**: Product management interface
- **Orders Module**: WhatsApp integration
- **Attendance Module**: Clock in/out functionality
- **P2P Sync**: WebRTC implementation

### Medium Priority
- **Language Packs**: Tamil, Telugu, Bengali, Marathi
- **Analytics**: Charts and reporting
- **Mobile Optimization**: PWA improvements
- **Testing**: Unit and integration tests

### Low Priority
- **Documentation**: API documentation
- **Performance**: Optimization improvements
- **Accessibility**: WCAG compliance
- **Internationalization**: Additional languages

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Git

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/bharatmesh
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Database Setup
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Create test user
mongosh mongodb://localhost:27017/bharatmesh
db.users.insertOne({
  name: "Test User",
  phone: "9999999999",
  pin: "$2b$10$...", // Hash of "1234"
  role: "owner",
  langs: ["hi", "en"],
  preferredLang: "hi",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 📋 Pull Request Process

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No merge conflicts
```

## 🏷️ Labels

We use labels to categorize issues and PRs:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high`: High priority
- `priority: medium`: Medium priority
- `priority: low`: Low priority

## 💬 Communication

### Getting Help
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Email**: support@bharatmesh.in

### Code Review
- Be respectful and constructive
- Focus on the code, not the person
- Ask questions if something is unclear
- Suggest improvements, don't just point out problems

## 📄 License

By contributing to BharatMesh, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

**Thank you for contributing to BharatMesh! 🚀**

For any questions about contributing, please open an issue or contact us at support@bharatmesh.in
