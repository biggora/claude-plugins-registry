export const MOCK_REGISTRY = {
  version: '1.0.0',
  updated: '2026-03-06',
  plugins: [
    {
      name: 'test-plugin',
      version: '1.0.0',
      description: 'A test plugin for unit tests',
      author: { name: 'tester', url: 'https://github.com/tester' },
      repository: 'https://github.com/test/test-plugin',
      keywords: ['test', 'demo'],
      license: 'MIT',
      commands: ['/test'],
      category: 'testing',
    },
    {
      name: 'code-optimizer',
      version: '2.0.0',
      description: 'Optimizes code quality and performance',
      author: { name: 'biggora', url: 'https://github.com/biggora' },
      repository: 'https://github.com/biggora/code-optimizer',
      keywords: ['optimization', 'refactoring'],
      license: 'MIT',
      commands: ['/optimize', '/optimize-project'],
      category: 'code-quality',
    },
    {
      name: 'no-extras',
      version: '0.1.0',
      description: 'Minimal plugin with no optional fields',
      repository: 'https://github.com/test/no-extras',
    },
  ],
};

export const VALID_PLUGIN_MANIFEST = {
  name: 'test-plugin',
  version: '1.0.0',
  description: 'A test plugin',
  author: { name: 'tester' },
  repository: 'https://github.com/test/test-plugin',
  keywords: ['test'],
  license: 'MIT',
  commands: ['/test'],
  category: 'testing',
};

export const VALID_SKILL_MD = `---
name: test-skill
description: A test skill for unit tests
compatibility: Node.js 18+
---

# Test Skill

Instructions for the skill.
`;

export const VALID_ORIGIN_JSON = {
  repository: 'https://github.com/test/test-skill',
  skill: null,
  installedAt: '2026-03-07T00:00:00.000Z',
};
